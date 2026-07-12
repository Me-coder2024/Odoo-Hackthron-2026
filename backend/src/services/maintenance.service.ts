import prisma from '../models/prisma';
import { MaintenanceStatus, VehicleStatus } from '@prisma/client';
import { createAuditLog } from './audit.service';

interface CreateMaintenanceInput {
  vehicle_id: string;
  service_type: string;
  description?: string;
}

interface AddItemInput {
  description: string;
  cost: number;
}

/**
 * CREATE maintenance (ACTIVE):
 * vehicle→IN_SHOP (atomic with maintenance create)
 * Business Rule #9
 */
export async function createMaintenance(input: CreateMaintenanceInput, userId: string) {
  return prisma.$transaction(async (tx) => {
    const vehicle = await tx.vehicle.findUnique({ where: { id: input.vehicle_id } });
    if (!vehicle) throw new Error('Vehicle not found');

    if (vehicle.status === VehicleStatus.ON_TRIP) {
      throw new Error('Cannot create maintenance for a vehicle currently on a trip');
    }

    if (vehicle.status === VehicleStatus.IN_SHOP) {
      throw new Error('Vehicle is already in shop for maintenance');
    }

    // Create maintenance log
    const maintenanceLog = await tx.maintenanceLog.create({
      data: {
        vehicle_id: input.vehicle_id,
        service_type: input.service_type,
        description: input.description,
        status: MaintenanceStatus.ACTIVE,
        created_by: userId,
      },
      include: {
        vehicle: { select: { name: true, registration_number: true } },
      },
    });

    // Atomic: vehicle → IN_SHOP
    await tx.vehicle.update({
      where: { id: input.vehicle_id },
      data: { status: VehicleStatus.IN_SHOP },
    });

    // Audit log
    await tx.auditLog.create({
      data: {
        user_id: userId,
        action: 'CREATE_MAINTENANCE',
        entity: 'MaintenanceLog',
        entity_id: maintenanceLog.id,
        new_value: {
          maintenance: maintenanceLog,
          vehicle_status_change: `${vehicle.status} → IN_SHOP`,
        },
      },
    });

    return maintenanceLog;
  });
}

export async function getAllMaintenance(filters?: { status?: MaintenanceStatus; vehicle_id?: string }) {
  const where: Record<string, unknown> = {};
  if (filters?.status) where.status = filters.status;
  if (filters?.vehicle_id) where.vehicle_id = filters.vehicle_id;

  return prisma.maintenanceLog.findMany({
    where,
    orderBy: { created_at: 'desc' },
    include: {
      vehicle: { select: { id: true, name: true, registration_number: true } },
      creator: { select: { username: true } },
      items: true,
      _count: { select: { items: true } },
    },
  });
}

export async function getMaintenanceById(id: string) {
  return prisma.maintenanceLog.findUnique({
    where: { id },
    include: {
      vehicle: true,
      creator: { select: { username: true, role: true } },
      items: { orderBy: { created_at: 'asc' } },
    },
  });
}

export async function updateMaintenance(id: string, input: { service_type?: string; description?: string }, userId: string) {
  const existing = await prisma.maintenanceLog.findUnique({ where: { id } });
  if (!existing) throw new Error('Maintenance log not found');

  if (existing.status === MaintenanceStatus.CLOSED) {
    throw new Error('Cannot update a closed maintenance log');
  }

  const log = await prisma.maintenanceLog.update({
    where: { id },
    data: input,
  });

  await createAuditLog({
    userId,
    action: 'UPDATE',
    entity: 'MaintenanceLog',
    entityId: id,
    oldValue: existing,
    newValue: log,
  });

  return log;
}

/**
 * CLOSE maintenance:
 * vehicle→AVAILABLE (unless RETIRED), maintenance→CLOSED
 * Business Rule #10
 */
export async function closeMaintenance(id: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const log = await tx.maintenanceLog.findUnique({
      where: { id },
      include: { vehicle: true, items: true },
    });

    if (!log) throw new Error('Maintenance log not found');
    if (log.status === MaintenanceStatus.CLOSED) {
      throw new Error('Maintenance log is already closed');
    }

    // Calculate total cost from items
    const totalCost = log.items.reduce((sum, item) => sum + Number(item.cost), 0);

    // Close maintenance
    const updatedLog = await tx.maintenanceLog.update({
      where: { id },
      data: {
        status: MaintenanceStatus.CLOSED,
        closed_at: new Date(),
        total_cost: totalCost,
      },
      include: {
        vehicle: { select: { name: true, registration_number: true } },
        items: true,
      },
    });

    // Vehicle → AVAILABLE (unless RETIRED)
    if (log.vehicle.status !== VehicleStatus.RETIRED) {
      await tx.vehicle.update({
        where: { id: log.vehicle_id },
        data: { status: VehicleStatus.AVAILABLE },
      });
    }

    // Audit log
    await tx.auditLog.create({
      data: {
        user_id: userId,
        action: 'CLOSE_MAINTENANCE',
        entity: 'MaintenanceLog',
        entity_id: id,
        old_value: { status: MaintenanceStatus.ACTIVE },
        new_value: {
          status: MaintenanceStatus.CLOSED,
          total_cost: totalCost,
          vehicle_status_change: log.vehicle.status !== VehicleStatus.RETIRED
            ? `IN_SHOP → AVAILABLE`
            : `remains RETIRED`,
        },
      },
    });

    return updatedLog;
  });
}

/**
 * Add item to maintenance log and update total cost.
 */
export async function addMaintenanceItem(logId: string, input: AddItemInput, userId: string) {
  const log = await prisma.maintenanceLog.findUnique({ where: { id: logId } });
  if (!log) throw new Error('Maintenance log not found');

  if (log.status === MaintenanceStatus.CLOSED) {
    throw new Error('Cannot add items to a closed maintenance log');
  }

  const item = await prisma.maintenanceItem.create({
    data: {
      log_id: logId,
      description: input.description,
      cost: input.cost,
    },
  });

  // Update total cost
  const allItems = await prisma.maintenanceItem.findMany({ where: { log_id: logId } });
  const totalCost = allItems.reduce((sum, i) => sum + Number(i.cost), 0);

  await prisma.maintenanceLog.update({
    where: { id: logId },
    data: { total_cost: totalCost },
  });

  await createAuditLog({
    userId,
    action: 'ADD_ITEM',
    entity: 'MaintenanceItem',
    entityId: item.id,
    newValue: { ...item, log_total_cost: totalCost },
  });

  return item;
}

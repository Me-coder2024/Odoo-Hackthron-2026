import prisma from '../models/prisma';
import { VehicleStatus, VehicleType, Prisma } from '@prisma/client';
import { createAuditLog } from './audit.service';

interface CreateVehicleInput {
  registration_number: string;
  name: string;
  type: VehicleType;
  max_load_capacity: number;
  odometer?: number;
  acquisition_cost: number;
  region?: string;
}

interface UpdateVehicleInput {
  name?: string;
  type?: VehicleType;
  max_load_capacity?: number;
  odometer?: number;
  acquisition_cost?: number;
  region?: string;
  status?: VehicleStatus;
}

export async function getAllVehicles(filters?: { status?: VehicleStatus; type?: VehicleType; search?: string }) {
  const where: Prisma.VehicleWhereInput = {};

  if (filters?.status) where.status = filters.status;
  if (filters?.type) where.type = filters.type;
  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { registration_number: { contains: filters.search, mode: 'insensitive' } },
      { region: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return prisma.vehicle.findMany({
    where,
    orderBy: { created_at: 'desc' },
    include: {
      _count: {
        select: { trips: true, maintenance_logs: true },
      },
    },
  });
}

export async function getAvailableVehicles() {
  return prisma.vehicle.findMany({
    where: { status: VehicleStatus.AVAILABLE },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      registration_number: true,
      name: true,
      type: true,
      max_load_capacity: true,
      odometer: true,
      status: true,
    },
  });
}

export async function getVehicleById(id: string) {
  return prisma.vehicle.findUnique({
    where: { id },
    include: {
      trips: {
        orderBy: { created_at: 'desc' },
        take: 10,
        include: { driver: { select: { name: true } } },
      },
      maintenance_logs: {
        orderBy: { created_at: 'desc' },
        take: 5,
        include: { items: true },
      },
      fuel_logs: {
        orderBy: { log_date: 'desc' },
        take: 10,
      },
      _count: {
        select: { trips: true, maintenance_logs: true, fuel_logs: true, expenses: true },
      },
    },
  });
}

export async function createVehicle(input: CreateVehicleInput, userId: string) {
  // Check uniqueness of registration_number
  const existing = await prisma.vehicle.findUnique({
    where: { registration_number: input.registration_number },
  });

  if (existing) {
    throw new Error(`Vehicle with registration number ${input.registration_number} already exists`);
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      registration_number: input.registration_number,
      name: input.name,
      type: input.type,
      max_load_capacity: input.max_load_capacity,
      odometer: input.odometer || 0,
      acquisition_cost: input.acquisition_cost,
      region: input.region,
    },
  });

  await createAuditLog({
    userId,
    action: 'CREATE',
    entity: 'Vehicle',
    entityId: vehicle.id,
    newValue: vehicle,
  });

  return vehicle;
}

export async function updateVehicle(id: string, input: UpdateVehicleInput, userId: string) {
  const existing = await prisma.vehicle.findUnique({ where: { id } });
  if (!existing) throw new Error('Vehicle not found');

  const vehicle = await prisma.vehicle.update({
    where: { id },
    data: input,
  });

  await createAuditLog({
    userId,
    action: 'UPDATE',
    entity: 'Vehicle',
    entityId: vehicle.id,
    oldValue: existing,
    newValue: vehicle,
  });

  return vehicle;
}

export async function deleteVehicle(id: string, userId: string) {
  const existing = await prisma.vehicle.findUnique({ where: { id } });
  if (!existing) throw new Error('Vehicle not found');

  if (existing.status === VehicleStatus.ON_TRIP) {
    throw new Error('Cannot delete a vehicle that is currently on a trip');
  }

  // Check for related trips
  const tripCount = await prisma.trip.count({ where: { vehicle_id: id } });
  if (tripCount > 0) {
    // Soft delete by retiring
    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: { status: VehicleStatus.RETIRED },
    });

    await createAuditLog({
      userId,
      action: 'RETIRE',
      entity: 'Vehicle',
      entityId: vehicle.id,
      oldValue: existing,
      newValue: vehicle,
    });

    return vehicle;
  }

  await prisma.vehicle.delete({ where: { id } });

  await createAuditLog({
    userId,
    action: 'DELETE',
    entity: 'Vehicle',
    entityId: id,
    oldValue: existing,
  });

  return existing;
}

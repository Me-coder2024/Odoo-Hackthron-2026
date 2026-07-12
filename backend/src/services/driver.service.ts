import prisma from '../models/prisma';
import { DriverStatus, Prisma } from '@prisma/client';
import { createAuditLog } from './audit.service';

interface CreateDriverInput {
  name: string;
  license_number: string;
  license_category: string;
  license_expiry: Date;
  contact_number?: string;
  safety_score?: number;
}

interface UpdateDriverInput {
  name?: string;
  license_category?: string;
  license_expiry?: Date;
  contact_number?: string;
  safety_score?: number;
  status?: DriverStatus;
}

export async function getAllDrivers(filters?: { status?: DriverStatus; search?: string }) {
  const where: Prisma.DriverWhereInput = {};

  if (filters?.status) where.status = filters.status;
  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { license_number: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return prisma.driver.findMany({
    where,
    orderBy: { created_at: 'desc' },
    include: {
      _count: {
        select: { trips: true },
      },
    },
  });
}

/**
 * Returns only AVAILABLE drivers with valid (non-expired) licenses.
 * Business Rule: Expired license OR SUSPENDED drivers cannot be assigned.
 */
export async function getAvailableDrivers() {
  const now = new Date();

  return prisma.driver.findMany({
    where: {
      status: DriverStatus.AVAILABLE,
      license_expiry: { gte: now },
    },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      license_number: true,
      license_category: true,
      license_expiry: true,
      safety_score: true,
      status: true,
    },
  });
}

export async function getDriverById(id: string) {
  return prisma.driver.findUnique({
    where: { id },
    include: {
      trips: {
        orderBy: { created_at: 'desc' },
        take: 10,
        include: {
          vehicle: { select: { name: true, registration_number: true } },
        },
      },
      _count: {
        select: { trips: true },
      },
    },
  });
}

export async function createDriver(input: CreateDriverInput, userId: string) {
  // Check uniqueness of license_number
  const existing = await prisma.driver.findUnique({
    where: { license_number: input.license_number },
  });

  if (existing) {
    throw new Error(`Driver with license number ${input.license_number} already exists`);
  }

  const driver = await prisma.driver.create({
    data: {
      name: input.name,
      license_number: input.license_number,
      license_category: input.license_category,
      license_expiry: input.license_expiry,
      contact_number: input.contact_number,
      safety_score: input.safety_score ?? 100,
    },
  });

  await createAuditLog({
    userId,
    action: 'CREATE',
    entity: 'Driver',
    entityId: driver.id,
    newValue: driver,
  });

  return driver;
}

export async function updateDriver(id: string, input: UpdateDriverInput, userId: string) {
  const existing = await prisma.driver.findUnique({ where: { id } });
  if (!existing) throw new Error('Driver not found');

  const driver = await prisma.driver.update({
    where: { id },
    data: input,
  });

  await createAuditLog({
    userId,
    action: 'UPDATE',
    entity: 'Driver',
    entityId: driver.id,
    oldValue: existing,
    newValue: driver,
  });

  return driver;
}

export async function deleteDriver(id: string, userId: string) {
  const existing = await prisma.driver.findUnique({ where: { id } });
  if (!existing) throw new Error('Driver not found');

  if (existing.status === DriverStatus.ON_TRIP) {
    throw new Error('Cannot delete a driver that is currently on a trip');
  }

  const tripCount = await prisma.trip.count({ where: { driver_id: id } });
  if (tripCount > 0) {
    throw new Error('Cannot delete a driver with existing trip records. Set to OFF_DUTY instead.');
  }

  await prisma.driver.delete({ where: { id } });

  await createAuditLog({
    userId,
    action: 'DELETE',
    entity: 'Driver',
    entityId: id,
    oldValue: existing,
  });

  return existing;
}

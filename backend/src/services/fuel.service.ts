import prisma from '../models/prisma';
import { createAuditLog } from './audit.service';

interface CreateFuelLogInput {
  vehicle_id: string;
  trip_id?: string;
  liters: number;
  cost_per_liter: number;
  total_cost: number;
  log_date: Date;
  odometer_at_fill: number;
}

export async function getAllFuelLogs(filters?: { vehicle_id?: string; trip_id?: string }) {
  const where: Record<string, unknown> = {};
  if (filters?.vehicle_id) where.vehicle_id = filters.vehicle_id;
  if (filters?.trip_id) where.trip_id = filters.trip_id;

  return prisma.fuelLog.findMany({
    where,
    orderBy: { log_date: 'desc' },
    include: {
      vehicle: { select: { id: true, name: true, registration_number: true } },
      trip: { select: { id: true, trip_number: true, source: true, destination: true } },
      creator: { select: { username: true } },
    },
  });
}

export async function createFuelLog(input: CreateFuelLogInput, userId: string) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: input.vehicle_id } });
  if (!vehicle) throw new Error('Vehicle not found');

  if (input.trip_id) {
    const trip = await prisma.trip.findUnique({ where: { id: input.trip_id } });
    if (!trip) throw new Error('Trip not found');
  }

  const fuelLog = await prisma.fuelLog.create({
    data: {
      vehicle_id: input.vehicle_id,
      trip_id: input.trip_id || null,
      liters: input.liters,
      cost_per_liter: input.cost_per_liter,
      total_cost: input.total_cost,
      log_date: input.log_date,
      odometer_at_fill: input.odometer_at_fill,
      created_by: userId,
    },
    include: {
      vehicle: { select: { name: true, registration_number: true } },
      trip: { select: { trip_number: true } },
    },
  });

  await createAuditLog({
    userId,
    action: 'CREATE',
    entity: 'FuelLog',
    entityId: fuelLog.id,
    newValue: fuelLog,
  });

  return fuelLog;
}

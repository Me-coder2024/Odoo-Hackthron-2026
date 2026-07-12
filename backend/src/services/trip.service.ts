import prisma from '../models/prisma';
import { TripStatus, VehicleStatus, DriverStatus, Prisma } from '@prisma/client';
import { generateTripNumber } from '../utils/tripNumber';
import { createAuditLog } from './audit.service';
import { Decimal } from '@prisma/client/runtime/library';

interface CreateTripInput {
  source: string;
  destination: string;
  vehicle_id: string;
  driver_id: string;
  cargo_weight: number;
  planned_distance: number;
}

interface CompleteTripInput {
  final_odometer: number;
  fuel_consumed: number;
  actual_distance: number;
  revenue: number;
}

export async function getAllTrips(filters?: { status?: TripStatus; search?: string }) {
  const where: Prisma.TripWhereInput = {};

  if (filters?.status) where.status = filters.status;
  if (filters?.search) {
    where.OR = [
      { trip_number: { contains: filters.search, mode: 'insensitive' } },
      { source: { contains: filters.search, mode: 'insensitive' } },
      { destination: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return prisma.trip.findMany({
    where,
    orderBy: { created_at: 'desc' },
    include: {
      vehicle: { select: { id: true, name: true, registration_number: true, type: true, max_load_capacity: true } },
      driver: { select: { id: true, name: true, license_number: true, safety_score: true } },
      creator: { select: { username: true } },
    },
  });
}

export async function getTripById(id: string) {
  return prisma.trip.findUnique({
    where: { id },
    include: {
      vehicle: true,
      driver: true,
      creator: { select: { username: true, role: true } },
      fuel_logs: true,
      expenses: true,
    },
  });
}

export async function createTrip(input: CreateTripInput, userId: string) {
  const tripNumber = await generateTripNumber();

  const trip = await prisma.trip.create({
    data: {
      trip_number: tripNumber,
      source: input.source,
      destination: input.destination,
      vehicle_id: input.vehicle_id,
      driver_id: input.driver_id,
      cargo_weight: input.cargo_weight,
      planned_distance: input.planned_distance,
      status: TripStatus.DRAFT,
      created_by: userId,
    },
    include: {
      vehicle: { select: { name: true, registration_number: true } },
      driver: { select: { name: true } },
    },
  });

  await createAuditLog({
    userId,
    action: 'CREATE',
    entity: 'Trip',
    entityId: trip.id,
    newValue: trip,
  });

  return trip;
}

export async function updateTrip(id: string, input: Partial<CreateTripInput>, userId: string) {
  const existing = await prisma.trip.findUnique({ where: { id } });
  if (!existing) throw new Error('Trip not found');

  if (existing.status !== TripStatus.DRAFT) {
    throw new Error('Only DRAFT trips can be edited');
  }

  const trip = await prisma.trip.update({
    where: { id },
    data: input,
    include: {
      vehicle: { select: { name: true, registration_number: true } },
      driver: { select: { name: true } },
    },
  });

  await createAuditLog({
    userId,
    action: 'UPDATE',
    entity: 'Trip',
    entityId: trip.id,
    oldValue: existing,
    newValue: trip,
  });

  return trip;
}

/**
 * DISPATCH TRIP — Atomic Prisma Transaction
 * 
 * All 5 validations + vehicle→ON_TRIP + driver→ON_TRIP
 * + trip→DISPATCHED + dispatched_at = now + audit log
 * If any validation fails: full rollback
 */
export async function dispatchTrip(tripId: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    // Fetch trip with relations
    const trip = await tx.trip.findUnique({
      where: { id: tripId },
      include: { vehicle: true, driver: true },
    });

    if (!trip) throw new Error('Trip not found');
    if (trip.status !== TripStatus.DRAFT) {
      throw new Error('Only DRAFT trips can be dispatched');
    }

    const vehicle = trip.vehicle;
    const driver = trip.driver;

    // Validation 1: Vehicle must not be RETIRED or IN_SHOP
    if (vehicle.status === VehicleStatus.RETIRED || vehicle.status === VehicleStatus.IN_SHOP) {
      throw new Error(`Vehicle ${vehicle.registration_number} is ${vehicle.status} and cannot be dispatched`);
    }

    // Validation 2: Vehicle must be AVAILABLE (not already ON_TRIP)
    if (vehicle.status !== VehicleStatus.AVAILABLE) {
      throw new Error(`Vehicle ${vehicle.registration_number} is currently ${vehicle.status} and cannot be assigned`);
    }

    // Validation 3: Driver must not be SUSPENDED
    if (driver.status === DriverStatus.SUSPENDED) {
      throw new Error(`Driver ${driver.name} is SUSPENDED and cannot be assigned`);
    }

    // Validation 4: Driver license must not be expired
    const now = new Date();
    if (driver.license_expiry < now) {
      throw new Error(`Driver ${driver.name}'s license expired on ${driver.license_expiry.toISOString().split('T')[0]}`);
    }

    // Validation 5: Driver must be AVAILABLE (not already ON_TRIP or OFF_DUTY)
    if (driver.status !== DriverStatus.AVAILABLE) {
      throw new Error(`Driver ${driver.name} is currently ${driver.status} and cannot be assigned`);
    }

    // Validation 6: Cargo weight must not exceed vehicle max_load_capacity
    const cargoWeight = new Decimal(trip.cargo_weight.toString());
    const maxLoad = new Decimal(vehicle.max_load_capacity.toString());
    if (cargoWeight.greaterThan(maxLoad)) {
      throw new Error(
        `Cargo weight (${cargoWeight.toString()} kg) exceeds vehicle max load capacity (${maxLoad.toString()} kg)`
      );
    }

    // All validations passed — perform atomic state changes

    // Update vehicle → ON_TRIP
    await tx.vehicle.update({
      where: { id: vehicle.id },
      data: { status: VehicleStatus.ON_TRIP },
    });

    // Update driver → ON_TRIP
    await tx.driver.update({
      where: { id: driver.id },
      data: { status: DriverStatus.ON_TRIP },
    });

    // Update trip → DISPATCHED
    const updatedTrip = await tx.trip.update({
      where: { id: tripId },
      data: {
        status: TripStatus.DISPATCHED,
        dispatched_at: now,
      },
      include: {
        vehicle: { select: { name: true, registration_number: true, status: true } },
        driver: { select: { name: true, status: true } },
      },
    });

    // Create audit log within the same transaction
    await tx.auditLog.create({
      data: {
        user_id: userId,
        action: 'DISPATCH',
        entity: 'Trip',
        entity_id: tripId,
        old_value: { status: TripStatus.DRAFT },
        new_value: {
          status: TripStatus.DISPATCHED,
          dispatched_at: now,
          vehicle_status: VehicleStatus.ON_TRIP,
          driver_status: DriverStatus.ON_TRIP,
        },
      },
    });

    return updatedTrip;
  });
}

/**
 * COMPLETE TRIP
 * Record final_odometer, fuel_consumed, actual_distance, revenue
 * vehicle→AVAILABLE, driver→AVAILABLE, trip→COMPLETED
 * Auto-insert fuel_log entry
 */
export async function completeTrip(tripId: string, input: CompleteTripInput, userId: string) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({
      where: { id: tripId },
      include: { vehicle: true, driver: true },
    });

    if (!trip) throw new Error('Trip not found');
    if (trip.status !== TripStatus.DISPATCHED) {
      throw new Error('Only DISPATCHED trips can be completed');
    }

    const now = new Date();

    // Update vehicle → AVAILABLE + update odometer
    await tx.vehicle.update({
      where: { id: trip.vehicle_id },
      data: {
        status: VehicleStatus.AVAILABLE,
        odometer: input.final_odometer,
      },
    });

    // Update driver → AVAILABLE
    await tx.driver.update({
      where: { id: trip.driver_id },
      data: { status: DriverStatus.AVAILABLE },
    });

    // Update trip → COMPLETED
    const updatedTrip = await tx.trip.update({
      where: { id: tripId },
      data: {
        status: TripStatus.COMPLETED,
        completed_at: now,
        final_odometer: input.final_odometer,
        fuel_consumed: input.fuel_consumed,
        actual_distance: input.actual_distance,
        revenue: input.revenue,
      },
      include: {
        vehicle: { select: { name: true, registration_number: true } },
        driver: { select: { name: true } },
      },
    });

    // Auto-insert fuel_log entry
    if (input.fuel_consumed > 0) {
      const costPerLiter = 95.0; // Default fuel cost; could be parameterized
      await tx.fuelLog.create({
        data: {
          vehicle_id: trip.vehicle_id,
          trip_id: tripId,
          liters: input.fuel_consumed,
          cost_per_liter: costPerLiter,
          total_cost: input.fuel_consumed * costPerLiter,
          log_date: now,
          odometer_at_fill: input.final_odometer,
          created_by: userId,
        },
      });
    }

    // Audit log
    await tx.auditLog.create({
      data: {
        user_id: userId,
        action: 'COMPLETE',
        entity: 'Trip',
        entity_id: tripId,
        old_value: { status: TripStatus.DISPATCHED },
        new_value: {
          status: TripStatus.COMPLETED,
          final_odometer: input.final_odometer,
          fuel_consumed: input.fuel_consumed,
          actual_distance: input.actual_distance,
          revenue: input.revenue,
        },
      },
    });

    return updatedTrip;
  });
}

/**
 * CANCEL DISPATCHED TRIP
 * vehicle→AVAILABLE, driver→AVAILABLE, trip→CANCELLED
 */
export async function cancelTrip(tripId: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({
      where: { id: tripId },
      include: { vehicle: true, driver: true },
    });

    if (!trip) throw new Error('Trip not found');
    if (trip.status !== TripStatus.DISPATCHED && trip.status !== TripStatus.DRAFT) {
      throw new Error('Only DRAFT or DISPATCHED trips can be cancelled');
    }

    // If dispatched, release vehicle and driver
    if (trip.status === TripStatus.DISPATCHED) {
      await tx.vehicle.update({
        where: { id: trip.vehicle_id },
        data: { status: VehicleStatus.AVAILABLE },
      });

      await tx.driver.update({
        where: { id: trip.driver_id },
        data: { status: DriverStatus.AVAILABLE },
      });
    }

    const updatedTrip = await tx.trip.update({
      where: { id: tripId },
      data: { status: TripStatus.CANCELLED },
      include: {
        vehicle: { select: { name: true, registration_number: true } },
        driver: { select: { name: true } },
      },
    });

    await tx.auditLog.create({
      data: {
        user_id: userId,
        action: 'CANCEL',
        entity: 'Trip',
        entity_id: tripId,
        old_value: { status: trip.status },
        new_value: { status: TripStatus.CANCELLED },
      },
    });

    return updatedTrip;
  });
}

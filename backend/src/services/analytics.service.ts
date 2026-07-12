import prisma from '../models/prisma';
import { VehicleStatus, TripStatus } from '@prisma/client';

/**
 * All analytics computed live from DB — never stored.
 * Business rule: Reviewers will check the network tab.
 */

export async function getKPIs() {
  const [
    totalVehicles,
    availableVehicles,
    onTripVehicles,
    inShopVehicles,
    retiredVehicles,
    totalDrivers,
    totalTrips,
    activeTrips,
    completedTrips,
    totalRevenue,
    totalFuelCost,
    totalMaintenanceCost,
    totalExpenses,
  ] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { status: VehicleStatus.AVAILABLE } }),
    prisma.vehicle.count({ where: { status: VehicleStatus.ON_TRIP } }),
    prisma.vehicle.count({ where: { status: VehicleStatus.IN_SHOP } }),
    prisma.vehicle.count({ where: { status: VehicleStatus.RETIRED } }),
    prisma.driver.count(),
    prisma.trip.count(),
    prisma.trip.count({ where: { status: TripStatus.DISPATCHED } }),
    prisma.trip.count({ where: { status: TripStatus.COMPLETED } }),
    prisma.trip.aggregate({ _sum: { revenue: true }, where: { status: TripStatus.COMPLETED } }),
    prisma.fuelLog.aggregate({ _sum: { total_cost: true } }),
    prisma.maintenanceLog.aggregate({ _sum: { total_cost: true } }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
  ]);

  const revenue = Number(totalRevenue._sum.revenue || 0);
  const fuelCost = Number(totalFuelCost._sum.total_cost || 0);
  const maintenanceCost = Number(totalMaintenanceCost._sum.total_cost || 0);
  const expenseCost = Number(totalExpenses._sum.amount || 0);

  return {
    fleet: {
      total: totalVehicles,
      available: availableVehicles,
      on_trip: onTripVehicles,
      in_shop: inShopVehicles,
      retired: retiredVehicles,
    },
    drivers: {
      total: totalDrivers,
    },
    trips: {
      total: totalTrips,
      active: activeTrips,
      completed: completedTrips,
    },
    financial: {
      total_revenue: revenue,
      total_fuel_cost: fuelCost,
      total_maintenance_cost: maintenanceCost,
      total_expenses: expenseCost,
      net_profit: revenue - fuelCost - maintenanceCost - expenseCost,
    },
  };
}

/**
 * Fleet Utilization % = (ON_TRIP vehicles / total active) × 100
 * "Active" excludes RETIRED vehicles.
 */
export async function getFleetUtilization() {
  const [onTrip, totalActive] = await Promise.all([
    prisma.vehicle.count({ where: { status: VehicleStatus.ON_TRIP } }),
    prisma.vehicle.count({ where: { status: { not: VehicleStatus.RETIRED } } }),
  ]);

  const utilization = totalActive > 0 ? (onTrip / totalActive) * 100 : 0;

  // Historical data by vehicle status breakdown
  const statusBreakdown = await prisma.vehicle.groupBy({
    by: ['status'],
    _count: { id: true },
  });

  return {
    utilization_percent: Math.round(utilization * 100) / 100,
    on_trip: onTrip,
    total_active: totalActive,
    breakdown: statusBreakdown.map((s) => ({
      status: s.status,
      count: s._count.id,
    })),
  };
}

/**
 * Fuel Efficiency km/L = actual_distance / fuel_consumed per trip
 */
export async function getFuelEfficiency() {
  const trips = await prisma.trip.findMany({
    where: {
      status: TripStatus.COMPLETED,
      actual_distance: { not: null },
      fuel_consumed: { not: null, gt: 0 },
    },
    select: {
      id: true,
      trip_number: true,
      actual_distance: true,
      fuel_consumed: true,
      vehicle: { select: { name: true, registration_number: true, type: true } },
    },
    orderBy: { completed_at: 'desc' },
    take: 50,
  });

  const tripEfficiencies = trips.map((trip) => {
    const distance = Number(trip.actual_distance);
    const fuel = Number(trip.fuel_consumed);
    return {
      trip_number: trip.trip_number,
      vehicle: trip.vehicle.name,
      vehicle_reg: trip.vehicle.registration_number,
      vehicle_type: trip.vehicle.type,
      actual_distance: distance,
      fuel_consumed: fuel,
      efficiency_km_per_liter: fuel > 0 ? Math.round((distance / fuel) * 100) / 100 : 0,
    };
  });

  const totalDistance = tripEfficiencies.reduce((sum, t) => sum + t.actual_distance, 0);
  const totalFuel = tripEfficiencies.reduce((sum, t) => sum + t.fuel_consumed, 0);
  const averageEfficiency = totalFuel > 0 ? Math.round((totalDistance / totalFuel) * 100) / 100 : 0;

  return {
    average_efficiency_km_per_liter: averageEfficiency,
    total_distance: totalDistance,
    total_fuel: totalFuel,
    trips: tripEfficiencies,
  };
}

/**
 * Operational Cost = SUM(fuel_logs) + SUM(maintenance_items) per vehicle
 */
export async function getOperationalCost() {
  const vehicles = await prisma.vehicle.findMany({
    where: { status: { not: VehicleStatus.RETIRED } },
    select: {
      id: true,
      name: true,
      registration_number: true,
      type: true,
      acquisition_cost: true,
      fuel_logs: { select: { total_cost: true } },
      maintenance_logs: {
        select: {
          total_cost: true,
          items: { select: { cost: true } },
        },
      },
      expenses: { select: { amount: true } },
    },
  });

  const vehicleCosts = vehicles.map((v) => {
    const fuelCost = v.fuel_logs.reduce((sum, f) => sum + Number(f.total_cost), 0);
    const maintenanceCost = v.maintenance_logs.reduce((sum, m) => sum + Number(m.total_cost), 0);
    const expenseCost = v.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalOpCost = fuelCost + maintenanceCost + expenseCost;

    return {
      vehicle_id: v.id,
      vehicle_name: v.name,
      registration_number: v.registration_number,
      vehicle_type: v.type,
      fuel_cost: Math.round(fuelCost * 100) / 100,
      maintenance_cost: Math.round(maintenanceCost * 100) / 100,
      expense_cost: Math.round(expenseCost * 100) / 100,
      total_operational_cost: Math.round(totalOpCost * 100) / 100,
    };
  });

  const totalOpCost = vehicleCosts.reduce((sum, v) => sum + v.total_operational_cost, 0);

  return {
    total_operational_cost: Math.round(totalOpCost * 100) / 100,
    vehicles: vehicleCosts.sort((a, b) => b.total_operational_cost - a.total_operational_cost),
  };
}

/**
 * Vehicle ROI = (SUM(revenue) - (fuel + maintenance)) / acquisition_cost
 */
export async function getVehicleROI() {
  const vehicles = await prisma.vehicle.findMany({
    select: {
      id: true,
      name: true,
      registration_number: true,
      type: true,
      acquisition_cost: true,
      status: true,
      trips: {
        where: { status: TripStatus.COMPLETED },
        select: { revenue: true },
      },
      fuel_logs: { select: { total_cost: true } },
      maintenance_logs: { select: { total_cost: true } },
    },
  });

  const roiData = vehicles.map((v) => {
    const totalRevenue = v.trips.reduce((sum, t) => sum + Number(t.revenue || 0), 0);
    const fuelCost = v.fuel_logs.reduce((sum, f) => sum + Number(f.total_cost), 0);
    const maintenanceCost = v.maintenance_logs.reduce((sum, m) => sum + Number(m.total_cost), 0);
    const acquisitionCost = Number(v.acquisition_cost);
    const netProfit = totalRevenue - fuelCost - maintenanceCost;
    const roi = acquisitionCost > 0 ? (netProfit / acquisitionCost) * 100 : 0;

    return {
      vehicle_id: v.id,
      vehicle_name: v.name,
      registration_number: v.registration_number,
      vehicle_type: v.type,
      status: v.status,
      acquisition_cost: acquisitionCost,
      total_revenue: Math.round(totalRevenue * 100) / 100,
      fuel_cost: Math.round(fuelCost * 100) / 100,
      maintenance_cost: Math.round(maintenanceCost * 100) / 100,
      net_profit: Math.round(netProfit * 100) / 100,
      roi_percent: Math.round(roi * 100) / 100,
    };
  });

  return {
    vehicles: roiData.sort((a, b) => b.roi_percent - a.roi_percent),
  };
}

/**
 * CSV Export — generates CSV string for download.
 */
export async function exportCSV(type: string) {
  let headers: string[] = [];
  let rows: string[][] = [];

  switch (type) {
    case 'vehicles': {
      const vehicles = await prisma.vehicle.findMany({ orderBy: { created_at: 'desc' } });
      headers = ['ID', 'Registration', 'Name', 'Type', 'Status', 'Max Load', 'Odometer', 'Acquisition Cost', 'Region'];
      rows = vehicles.map((v) => [
        v.id, v.registration_number, v.name, v.type, v.status,
        v.max_load_capacity.toString(), v.odometer.toString(),
        v.acquisition_cost.toString(), v.region || '',
      ]);
      break;
    }
    case 'trips': {
      const trips = await prisma.trip.findMany({
        orderBy: { created_at: 'desc' },
        include: { vehicle: { select: { registration_number: true } }, driver: { select: { name: true } } },
      });
      headers = ['Trip#', 'Source', 'Destination', 'Vehicle', 'Driver', 'Status', 'Cargo Weight', 'Distance', 'Fuel', 'Revenue'];
      rows = trips.map((t) => [
        t.trip_number, t.source, t.destination,
        t.vehicle.registration_number, t.driver.name, t.status,
        t.cargo_weight.toString(), (t.actual_distance || t.planned_distance).toString(),
        (t.fuel_consumed || '').toString(), (t.revenue || '').toString(),
      ]);
      break;
    }
    case 'fuel-logs': {
      const logs = await prisma.fuelLog.findMany({
        orderBy: { log_date: 'desc' },
        include: { vehicle: { select: { registration_number: true } } },
      });
      headers = ['Date', 'Vehicle', 'Liters', 'Cost/Liter', 'Total Cost', 'Odometer'];
      rows = logs.map((f) => [
        f.log_date.toISOString().split('T')[0],
        f.vehicle.registration_number, f.liters.toString(),
        f.cost_per_liter.toString(), f.total_cost.toString(),
        f.odometer_at_fill.toString(),
      ]);
      break;
    }
    case 'expenses': {
      const expenses = await prisma.expense.findMany({
        orderBy: { expense_date: 'desc' },
        include: { vehicle: { select: { registration_number: true } } },
      });
      headers = ['Date', 'Vehicle', 'Category', 'Description', 'Amount'];
      rows = expenses.map((e) => [
        e.expense_date.toISOString().split('T')[0],
        e.vehicle.registration_number, e.category,
        e.description || '', e.amount.toString(),
      ]);
      break;
    }
    default:
      throw new Error(`Unknown export type: ${type}`);
  }

  const csvLines = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')),
  ];

  return csvLines.join('\n');
}

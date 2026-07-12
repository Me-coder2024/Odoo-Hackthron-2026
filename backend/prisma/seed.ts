import { PrismaClient, UserRole, VehicleType, VehicleStatus, DriverStatus, TripStatus, MaintenanceStatus, ExpenseCategory } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Clear existing data in order (respecting FK constraints)
  await prisma.auditLog.deleteMany();
  await prisma.maintenanceItem.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.fuelLog.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleared existing data');

  // --- USERS (4 users, one per role, bcrypt r=12) ---
  const passwordHash = await bcrypt.hash('password123', 12);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        username: 'fleet_manager',
        email: 'fleet@transitops.com',
        password_hash: passwordHash,
        role: UserRole.FLEET_MANAGER,
      },
    }),
    prisma.user.create({
      data: {
        username: 'dispatcher',
        email: 'dispatch@transitops.com',
        password_hash: passwordHash,
        role: UserRole.DISPATCHER,
      },
    }),
    prisma.user.create({
      data: {
        username: 'safety_officer',
        email: 'safety@transitops.com',
        password_hash: passwordHash,
        role: UserRole.SAFETY_OFFICER,
      },
    }),
    prisma.user.create({
      data: {
        username: 'financial_analyst',
        email: 'finance@transitops.com',
        password_hash: passwordHash,
        role: UserRole.FINANCIAL_ANALYST,
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  const [fleetMgr, dispatcherUser, safetyOfficer, financialAnalyst] = users;

  // --- VEHICLES (10 vehicles, mixed types and statuses) ---
  const vehicles = await Promise.all([
    prisma.vehicle.create({
      data: {
        registration_number: 'MH-01-AB-1234',
        name: 'Express Hauler',
        type: VehicleType.TRUCK,
        max_load_capacity: 15000,
        odometer: 45230,
        acquisition_cost: 2500000,
        region: 'Mumbai',
        status: VehicleStatus.AVAILABLE,
      },
    }),
    prisma.vehicle.create({
      data: {
        registration_number: 'MH-02-CD-5678',
        name: 'City Runner',
        type: VehicleType.VAN,
        max_load_capacity: 3000,
        odometer: 28100,
        acquisition_cost: 800000,
        region: 'Pune',
        status: VehicleStatus.AVAILABLE,
      },
    }),
    prisma.vehicle.create({
      data: {
        registration_number: 'DL-03-EF-9012',
        name: 'Metro Transit',
        type: VehicleType.BUS,
        max_load_capacity: 5000,
        odometer: 112000,
        acquisition_cost: 3500000,
        region: 'Delhi',
        status: VehicleStatus.ON_TRIP,
      },
    }),
    prisma.vehicle.create({
      data: {
        registration_number: 'KA-04-GH-3456',
        name: 'Highway Star',
        type: VehicleType.TRUCK,
        max_load_capacity: 20000,
        odometer: 67800,
        acquisition_cost: 3200000,
        region: 'Bangalore',
        status: VehicleStatus.AVAILABLE,
      },
    }),
    prisma.vehicle.create({
      data: {
        registration_number: 'TN-05-IJ-7890',
        name: 'Swift Cargo',
        type: VehicleType.VAN,
        max_load_capacity: 2500,
        odometer: 34500,
        acquisition_cost: 750000,
        region: 'Chennai',
        status: VehicleStatus.IN_SHOP,
      },
    }),
    prisma.vehicle.create({
      data: {
        registration_number: 'GJ-06-KL-2345',
        name: 'Titan Mover',
        type: VehicleType.TRUCK,
        max_load_capacity: 25000,
        odometer: 89200,
        acquisition_cost: 4000000,
        region: 'Ahmedabad',
        status: VehicleStatus.AVAILABLE,
      },
    }),
    prisma.vehicle.create({
      data: {
        registration_number: 'RJ-07-MN-6789',
        name: 'Desert Express',
        type: VehicleType.TRUCK,
        max_load_capacity: 18000,
        odometer: 56700,
        acquisition_cost: 2800000,
        region: 'Jaipur',
        status: VehicleStatus.RETIRED,
      },
    }),
    prisma.vehicle.create({
      data: {
        registration_number: 'UP-08-OP-0123',
        name: 'Urban Shuttle',
        type: VehicleType.BUS,
        max_load_capacity: 4500,
        odometer: 145000,
        acquisition_cost: 3000000,
        region: 'Lucknow',
        status: VehicleStatus.AVAILABLE,
      },
    }),
    prisma.vehicle.create({
      data: {
        registration_number: 'WB-09-QR-4567',
        name: 'Bengal Carrier',
        type: VehicleType.VAN,
        max_load_capacity: 3500,
        odometer: 22300,
        acquisition_cost: 900000,
        region: 'Kolkata',
        status: VehicleStatus.ON_TRIP,
      },
    }),
    prisma.vehicle.create({
      data: {
        registration_number: 'MP-10-ST-8901',
        name: 'Central Freight',
        type: VehicleType.OTHER,
        max_load_capacity: 10000,
        odometer: 41000,
        acquisition_cost: 1800000,
        region: 'Bhopal',
        status: VehicleStatus.AVAILABLE,
      },
    }),
  ]);

  console.log(`✅ Created ${vehicles.length} vehicles`);

  // --- DRIVERS (8 drivers, mixed statuses, some with expired licenses) ---
  const futureDate = new Date('2027-06-15');
  const pastDate = new Date('2025-12-31');

  const drivers = await Promise.all([
    prisma.driver.create({
      data: {
        name: 'Rajesh Kumar',
        license_number: 'DL-2020-001234',
        license_category: 'HMV',
        license_expiry: futureDate,
        contact_number: '+91-9876543210',
        safety_score: 92,
        status: DriverStatus.AVAILABLE,
      },
    }),
    prisma.driver.create({
      data: {
        name: 'Suresh Patel',
        license_number: 'DL-2019-005678',
        license_category: 'HMV',
        license_expiry: futureDate,
        contact_number: '+91-9876543211',
        safety_score: 88,
        status: DriverStatus.ON_TRIP,
      },
    }),
    prisma.driver.create({
      data: {
        name: 'Amit Singh',
        license_number: 'DL-2021-009012',
        license_category: 'LMV',
        license_expiry: futureDate,
        contact_number: '+91-9876543212',
        safety_score: 95,
        status: DriverStatus.AVAILABLE,
      },
    }),
    prisma.driver.create({
      data: {
        name: 'Vikram Sharma',
        license_number: 'DL-2018-003456',
        license_category: 'HMV',
        license_expiry: pastDate, // EXPIRED
        contact_number: '+91-9876543213',
        safety_score: 75,
        status: DriverStatus.AVAILABLE,
      },
    }),
    prisma.driver.create({
      data: {
        name: 'Manoj Yadav',
        license_number: 'DL-2020-007890',
        license_category: 'HMV',
        license_expiry: futureDate,
        contact_number: '+91-9876543214',
        safety_score: 45,
        status: DriverStatus.SUSPENDED,
      },
    }),
    prisma.driver.create({
      data: {
        name: 'Deepak Verma',
        license_number: 'DL-2022-002345',
        license_category: 'LMV',
        license_expiry: futureDate,
        contact_number: '+91-9876543215',
        safety_score: 98,
        status: DriverStatus.AVAILABLE,
      },
    }),
    prisma.driver.create({
      data: {
        name: 'Arun Gupta',
        license_number: 'DL-2019-006789',
        license_category: 'HMV',
        license_expiry: futureDate,
        contact_number: '+91-9876543216',
        safety_score: 82,
        status: DriverStatus.ON_TRIP,
      },
    }),
    prisma.driver.create({
      data: {
        name: 'Kiran Thakur',
        license_number: 'DL-2021-000123',
        license_category: 'HMV',
        license_expiry: futureDate,
        contact_number: '+91-9876543217',
        safety_score: 90,
        status: DriverStatus.OFF_DUTY,
      },
    }),
  ]);

  console.log(`✅ Created ${drivers.length} drivers`);

  // --- TRIPS (15 trips across all statuses) ---
  const trips = await Promise.all([
    // COMPLETED trips (5)
    prisma.trip.create({
      data: {
        trip_number: 'TRP-0001',
        source: 'Mumbai',
        destination: 'Pune',
        vehicle_id: vehicles[0].id,
        driver_id: drivers[0].id,
        cargo_weight: 12000,
        planned_distance: 150,
        actual_distance: 148,
        fuel_consumed: 25,
        final_odometer: 45380,
        revenue: 45000,
        status: TripStatus.COMPLETED,
        dispatched_at: new Date('2026-06-01'),
        completed_at: new Date('2026-06-01'),
        created_by: dispatcherUser.id,
      },
    }),
    prisma.trip.create({
      data: {
        trip_number: 'TRP-0002',
        source: 'Delhi',
        destination: 'Agra',
        vehicle_id: vehicles[3].id,
        driver_id: drivers[2].id,
        cargo_weight: 18000,
        planned_distance: 230,
        actual_distance: 225,
        fuel_consumed: 40,
        final_odometer: 68025,
        revenue: 65000,
        status: TripStatus.COMPLETED,
        dispatched_at: new Date('2026-06-05'),
        completed_at: new Date('2026-06-05'),
        created_by: dispatcherUser.id,
      },
    }),
    prisma.trip.create({
      data: {
        trip_number: 'TRP-0003',
        source: 'Bangalore',
        destination: 'Mysore',
        vehicle_id: vehicles[1].id,
        driver_id: drivers[5].id,
        cargo_weight: 2000,
        planned_distance: 150,
        actual_distance: 152,
        fuel_consumed: 12,
        final_odometer: 28252,
        revenue: 18000,
        status: TripStatus.COMPLETED,
        dispatched_at: new Date('2026-06-10'),
        completed_at: new Date('2026-06-10'),
        created_by: dispatcherUser.id,
      },
    }),
    prisma.trip.create({
      data: {
        trip_number: 'TRP-0004',
        source: 'Chennai',
        destination: 'Pondicherry',
        vehicle_id: vehicles[5].id,
        driver_id: drivers[0].id,
        cargo_weight: 22000,
        planned_distance: 170,
        actual_distance: 165,
        fuel_consumed: 30,
        final_odometer: 89365,
        revenue: 52000,
        status: TripStatus.COMPLETED,
        dispatched_at: new Date('2026-06-15'),
        completed_at: new Date('2026-06-15'),
        created_by: fleetMgr.id,
      },
    }),
    prisma.trip.create({
      data: {
        trip_number: 'TRP-0005',
        source: 'Kolkata',
        destination: 'Siliguri',
        vehicle_id: vehicles[7].id,
        driver_id: drivers[2].id,
        cargo_weight: 3500,
        planned_distance: 600,
        actual_distance: 590,
        fuel_consumed: 85,
        final_odometer: 145590,
        revenue: 95000,
        status: TripStatus.COMPLETED,
        dispatched_at: new Date('2026-06-20'),
        completed_at: new Date('2026-06-21'),
        created_by: dispatcherUser.id,
      },
    }),

    // DISPATCHED trips (3) — these correspond to ON_TRIP vehicles/drivers
    prisma.trip.create({
      data: {
        trip_number: 'TRP-0006',
        source: 'Delhi',
        destination: 'Jaipur',
        vehicle_id: vehicles[2].id, // Metro Transit (ON_TRIP)
        driver_id: drivers[1].id, // Suresh (ON_TRIP)
        cargo_weight: 4000,
        planned_distance: 280,
        status: TripStatus.DISPATCHED,
        dispatched_at: new Date('2026-07-10'),
        created_by: dispatcherUser.id,
      },
    }),
    prisma.trip.create({
      data: {
        trip_number: 'TRP-0007',
        source: 'Kolkata',
        destination: 'Bhubaneswar',
        vehicle_id: vehicles[8].id, // Bengal Carrier (ON_TRIP)
        driver_id: drivers[6].id, // Arun (ON_TRIP)
        cargo_weight: 2800,
        planned_distance: 440,
        status: TripStatus.DISPATCHED,
        dispatched_at: new Date('2026-07-11'),
        created_by: dispatcherUser.id,
      },
    }),
    prisma.trip.create({
      data: {
        trip_number: 'TRP-0008',
        source: 'Ahmedabad',
        destination: 'Surat',
        vehicle_id: vehicles[5].id,
        driver_id: drivers[5].id,
        cargo_weight: 20000,
        planned_distance: 265,
        status: TripStatus.DISPATCHED,
        dispatched_at: new Date('2026-07-12'),
        created_by: fleetMgr.id,
      },
    }),

    // DRAFT trips (4)
    prisma.trip.create({
      data: {
        trip_number: 'TRP-0009',
        source: 'Mumbai',
        destination: 'Nashik',
        vehicle_id: vehicles[0].id,
        driver_id: drivers[0].id,
        cargo_weight: 10000,
        planned_distance: 170,
        status: TripStatus.DRAFT,
        created_by: dispatcherUser.id,
      },
    }),
    prisma.trip.create({
      data: {
        trip_number: 'TRP-0010',
        source: 'Pune',
        destination: 'Goa',
        vehicle_id: vehicles[1].id,
        driver_id: drivers[2].id,
        cargo_weight: 2500,
        planned_distance: 460,
        status: TripStatus.DRAFT,
        created_by: dispatcherUser.id,
      },
    }),
    prisma.trip.create({
      data: {
        trip_number: 'TRP-0011',
        source: 'Lucknow',
        destination: 'Varanasi',
        vehicle_id: vehicles[7].id,
        driver_id: drivers[0].id,
        cargo_weight: 3000,
        planned_distance: 320,
        status: TripStatus.DRAFT,
        created_by: fleetMgr.id,
      },
    }),
    prisma.trip.create({
      data: {
        trip_number: 'TRP-0012',
        source: 'Bhopal',
        destination: 'Indore',
        vehicle_id: vehicles[9].id,
        driver_id: drivers[5].id,
        cargo_weight: 8000,
        planned_distance: 195,
        status: TripStatus.DRAFT,
        created_by: dispatcherUser.id,
      },
    }),

    // CANCELLED trips (3)
    prisma.trip.create({
      data: {
        trip_number: 'TRP-0013',
        source: 'Jaipur',
        destination: 'Udaipur',
        vehicle_id: vehicles[3].id,
        driver_id: drivers[0].id,
        cargo_weight: 15000,
        planned_distance: 400,
        status: TripStatus.CANCELLED,
        created_by: dispatcherUser.id,
      },
    }),
    prisma.trip.create({
      data: {
        trip_number: 'TRP-0014',
        source: 'Hyderabad',
        destination: 'Vijayawada',
        vehicle_id: vehicles[0].id,
        driver_id: drivers[2].id,
        cargo_weight: 11000,
        planned_distance: 275,
        status: TripStatus.CANCELLED,
        created_by: fleetMgr.id,
      },
    }),
    prisma.trip.create({
      data: {
        trip_number: 'TRP-0015',
        source: 'Chennai',
        destination: 'Coimbatore',
        vehicle_id: vehicles[1].id,
        driver_id: drivers[5].id,
        cargo_weight: 1800,
        planned_distance: 505,
        status: TripStatus.CANCELLED,
        created_by: dispatcherUser.id,
      },
    }),
  ]);

  console.log(`✅ Created ${trips.length} trips`);

  // --- MAINTENANCE LOGS (5) ---
  const maintenanceLogs = await Promise.all([
    prisma.maintenanceLog.create({
      data: {
        vehicle_id: vehicles[4].id, // Swift Cargo (IN_SHOP)
        service_type: 'Engine Overhaul',
        description: 'Complete engine overhaul and timing belt replacement',
        status: MaintenanceStatus.ACTIVE,
        created_by: fleetMgr.id,
      },
    }),
    prisma.maintenanceLog.create({
      data: {
        vehicle_id: vehicles[0].id,
        service_type: 'Brake Replacement',
        description: 'Front and rear brake pad replacement',
        status: MaintenanceStatus.CLOSED,
        started_at: new Date('2026-05-15'),
        closed_at: new Date('2026-05-17'),
        total_cost: 15000,
        created_by: fleetMgr.id,
      },
    }),
    prisma.maintenanceLog.create({
      data: {
        vehicle_id: vehicles[3].id,
        service_type: 'Oil Change',
        description: 'Regular oil change and filter replacement',
        status: MaintenanceStatus.CLOSED,
        started_at: new Date('2026-06-01'),
        closed_at: new Date('2026-06-01'),
        total_cost: 5500,
        created_by: safetyOfficer.id,
      },
    }),
    prisma.maintenanceLog.create({
      data: {
        vehicle_id: vehicles[7].id,
        service_type: 'Tire Replacement',
        description: 'All 6 tires replaced with new ones',
        status: MaintenanceStatus.CLOSED,
        started_at: new Date('2026-06-10'),
        closed_at: new Date('2026-06-12'),
        total_cost: 48000,
        created_by: fleetMgr.id,
      },
    }),
    prisma.maintenanceLog.create({
      data: {
        vehicle_id: vehicles[1].id,
        service_type: 'AC Repair',
        description: 'Air conditioning compressor replacement',
        status: MaintenanceStatus.CLOSED,
        started_at: new Date('2026-06-20'),
        closed_at: new Date('2026-06-21'),
        total_cost: 12000,
        created_by: fleetMgr.id,
      },
    }),
  ]);

  console.log(`✅ Created ${maintenanceLogs.length} maintenance logs`);

  // --- MAINTENANCE ITEMS ---
  await Promise.all([
    prisma.maintenanceItem.create({
      data: { log_id: maintenanceLogs[0].id, description: 'Engine gasket set', cost: 8500 },
    }),
    prisma.maintenanceItem.create({
      data: { log_id: maintenanceLogs[0].id, description: 'Timing belt kit', cost: 4200 },
    }),
    prisma.maintenanceItem.create({
      data: { log_id: maintenanceLogs[0].id, description: 'Labor charges', cost: 12000 },
    }),
    prisma.maintenanceItem.create({
      data: { log_id: maintenanceLogs[1].id, description: 'Brake pads (set of 4)', cost: 8000 },
    }),
    prisma.maintenanceItem.create({
      data: { log_id: maintenanceLogs[1].id, description: 'Labor charges', cost: 7000 },
    }),
    prisma.maintenanceItem.create({
      data: { log_id: maintenanceLogs[2].id, description: 'Engine oil 10W-40 (8L)', cost: 3200 },
    }),
    prisma.maintenanceItem.create({
      data: { log_id: maintenanceLogs[2].id, description: 'Oil filter', cost: 800 },
    }),
    prisma.maintenanceItem.create({
      data: { log_id: maintenanceLogs[2].id, description: 'Labor', cost: 1500 },
    }),
    prisma.maintenanceItem.create({
      data: { log_id: maintenanceLogs[3].id, description: 'Tires x6', cost: 42000 },
    }),
    prisma.maintenanceItem.create({
      data: { log_id: maintenanceLogs[3].id, description: 'Alignment and balancing', cost: 6000 },
    }),
    prisma.maintenanceItem.create({
      data: { log_id: maintenanceLogs[4].id, description: 'AC compressor', cost: 9000 },
    }),
    prisma.maintenanceItem.create({
      data: { log_id: maintenanceLogs[4].id, description: 'Refrigerant + Labor', cost: 3000 },
    }),
  ]);

  console.log('✅ Created maintenance items');

  // --- FUEL LOGS ---
  await Promise.all([
    prisma.fuelLog.create({
      data: {
        vehicle_id: vehicles[0].id,
        trip_id: trips[0].id,
        liters: 25,
        cost_per_liter: 95.50,
        total_cost: 2387.50,
        log_date: new Date('2026-06-01'),
        odometer_at_fill: 45380,
        created_by: dispatcherUser.id,
      },
    }),
    prisma.fuelLog.create({
      data: {
        vehicle_id: vehicles[3].id,
        trip_id: trips[1].id,
        liters: 40,
        cost_per_liter: 94.80,
        total_cost: 3792,
        log_date: new Date('2026-06-05'),
        odometer_at_fill: 68025,
        created_by: dispatcherUser.id,
      },
    }),
    prisma.fuelLog.create({
      data: {
        vehicle_id: vehicles[1].id,
        trip_id: trips[2].id,
        liters: 12,
        cost_per_liter: 95.00,
        total_cost: 1140,
        log_date: new Date('2026-06-10'),
        odometer_at_fill: 28252,
        created_by: dispatcherUser.id,
      },
    }),
    prisma.fuelLog.create({
      data: {
        vehicle_id: vehicles[5].id,
        trip_id: trips[3].id,
        liters: 30,
        cost_per_liter: 96.20,
        total_cost: 2886,
        log_date: new Date('2026-06-15'),
        odometer_at_fill: 89365,
        created_by: fleetMgr.id,
      },
    }),
    prisma.fuelLog.create({
      data: {
        vehicle_id: vehicles[7].id,
        trip_id: trips[4].id,
        liters: 85,
        cost_per_liter: 94.50,
        total_cost: 8032.50,
        log_date: new Date('2026-06-21'),
        odometer_at_fill: 145590,
        created_by: dispatcherUser.id,
      },
    }),
    // Standalone fuel fills (not trip-linked)
    prisma.fuelLog.create({
      data: {
        vehicle_id: vehicles[0].id,
        liters: 50,
        cost_per_liter: 95.00,
        total_cost: 4750,
        log_date: new Date('2026-06-25'),
        odometer_at_fill: 45500,
        created_by: financialAnalyst.id,
      },
    }),
    prisma.fuelLog.create({
      data: {
        vehicle_id: vehicles[3].id,
        liters: 60,
        cost_per_liter: 94.00,
        total_cost: 5640,
        log_date: new Date('2026-06-28'),
        odometer_at_fill: 68300,
        created_by: financialAnalyst.id,
      },
    }),
  ]);

  console.log('✅ Created fuel logs');

  // --- EXPENSES ---
  await Promise.all([
    prisma.expense.create({
      data: {
        vehicle_id: vehicles[0].id,
        trip_id: trips[0].id,
        category: ExpenseCategory.TOLL,
        description: 'Mumbai-Pune Expressway toll',
        amount: 350,
        expense_date: new Date('2026-06-01'),
        created_by: dispatcherUser.id,
      },
    }),
    prisma.expense.create({
      data: {
        vehicle_id: vehicles[3].id,
        trip_id: trips[1].id,
        category: ExpenseCategory.TOLL,
        description: 'Yamuna Expressway toll',
        amount: 600,
        expense_date: new Date('2026-06-05'),
        created_by: dispatcherUser.id,
      },
    }),
    prisma.expense.create({
      data: {
        vehicle_id: vehicles[3].id,
        trip_id: trips[1].id,
        category: ExpenseCategory.PARKING,
        description: 'Overnight parking at Agra depot',
        amount: 200,
        expense_date: new Date('2026-06-05'),
        created_by: dispatcherUser.id,
      },
    }),
    prisma.expense.create({
      data: {
        vehicle_id: vehicles[1].id,
        category: ExpenseCategory.REPAIR,
        description: 'Windshield wiper replacement',
        amount: 1200,
        expense_date: new Date('2026-06-12'),
        created_by: fleetMgr.id,
      },
    }),
    prisma.expense.create({
      data: {
        vehicle_id: vehicles[7].id,
        trip_id: trips[4].id,
        category: ExpenseCategory.TOLL,
        description: 'NH toll charges',
        amount: 1500,
        expense_date: new Date('2026-06-20'),
        created_by: dispatcherUser.id,
      },
    }),
    prisma.expense.create({
      data: {
        vehicle_id: vehicles[5].id,
        category: ExpenseCategory.OTHER,
        description: 'GPS tracker subscription',
        amount: 2500,
        expense_date: new Date('2026-07-01'),
        created_by: financialAnalyst.id,
      },
    }),
  ]);

  console.log('✅ Created expenses');

  // --- AUDIT LOGS ---
  await prisma.auditLog.create({
    data: {
      user_id: fleetMgr.id,
      action: 'SEED',
      entity: 'System',
      entity_id: 'seed',
      new_value: { message: 'Database seeded successfully' },
    },
  });

  console.log('✅ Created audit logs');

  console.log('\n🎉 Seeding complete!\n');
  console.log('📋 Login Credentials (all passwords: password123):');
  console.log('   fleet_manager   — FLEET_MANAGER');
  console.log('   dispatcher      — DISPATCHER');
  console.log('   safety_officer  — SAFETY_OFFICER');
  console.log('   financial_analyst — FINANCIAL_ANALYST');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

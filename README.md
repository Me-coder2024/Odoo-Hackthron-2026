# TransitOps — Smart Transport Operations Platform

A full-stack fleet management system built for the Odoo Hackathon 2026. Manages vehicles, drivers, trips, maintenance, fuel/expenses, and analytics across 4 RBAC roles.

## Tech Stack

### Frontend
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS v4 (dark theme)
- Radix UI + shadcn/ui
- Framer Motion
- React Hook Form + Zod
- Recharts
- Lucide Icons + Inter font

### Backend
- Node.js + Express
- PostgreSQL (local)
- Prisma ORM
- JWT (httpOnly cookies)
- bcrypt (r=12)
- express-validator
- Helmet.js
- rate-limiter-flexible

## Team

| Member | Responsibility |
|--------|---------------|
| **Me-coder2024** | Backend, DB schema, all core APIs |
| **aksh-1h** | Frontend: auth, dashboard, vehicles, trips |
| **dixit-00** | Frontend+API: drivers, maintenance, fuel & expenses |
| **anam190** | Frontend+API: analytics, reports, settings, CSV export |

## Roles

| Role | Access |
|------|--------|
| `FLEET_MANAGER` | Fleet assets, maintenance, vehicle lifecycle |
| `DISPATCHER` | Dashboard, trips (create, dispatch, complete) |
| `SAFETY_OFFICER` | Drivers, safety scores, license compliance |
| `FINANCIAL_ANALYST` | Fuel, expenses, reports, ROI |

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (local)

### Setup

```bash
# 1. Clone & install
git clone https://github.com/Me-coder2024/Odoo-Hackthron-2026.git
cd Odoo-Hackthron-2026

# 2. Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# 3. Install dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 4. Setup database
npx prisma generate
npx prisma migrate dev --name init

# 5. Seed database
npx prisma db seed

# 6. Start backend (port 3001)
cd backend && npm run dev

# 7. Start frontend (port 3000) — in another terminal
cd frontend && npm run dev
```

### Login Credentials
All passwords: `password123`

| Username | Role |
|----------|------|
| `fleet_manager` | FLEET_MANAGER |
| `dispatcher` | DISPATCHER |
| `safety_officer` | SAFETY_OFFICER |
| `financial_analyst` | FINANCIAL_ANALYST |

## API Routes

```
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me

GET/POST/PATCH/DELETE  /api/vehicles
GET    /api/vehicles/available

GET/POST/PATCH/DELETE  /api/drivers
GET    /api/drivers/available

GET/POST           /api/trips
GET/PATCH          /api/trips/:id
POST               /api/trips/:id/dispatch
POST               /api/trips/:id/complete
POST               /api/trips/:id/cancel

GET/POST           /api/maintenance
GET/PATCH          /api/maintenance/:id
POST               /api/maintenance/:id/close
POST               /api/maintenance/:id/items

GET/POST           /api/fuel-logs
GET/POST/DELETE    /api/expenses

GET  /api/analytics/kpis
GET  /api/analytics/fleet-utilization
GET  /api/analytics/fuel-efficiency
GET  /api/analytics/operational-cost
GET  /api/analytics/vehicle-roi
GET  /api/analytics/export-csv?type=vehicles|trips|fuel-logs|expenses
```

## Business Rules

1. `registration_number` is UNIQUE — duplicate rejected on create
2. RETIRED/IN_SHOP vehicles never in dispatch dropdown
3. Expired license or SUSPENDED drivers cannot be assigned
4. Driver/vehicle already ON_TRIP cannot be reassigned
5. `cargo_weight` must NOT exceed `vehicle.max_load_capacity`
6. DISPATCH = atomic Prisma transaction (all validations + status changes)
7. COMPLETE trip = record metrics, release resources, auto fuel log
8. CANCEL trip = release vehicle + driver
9. CREATE maintenance = vehicle → IN_SHOP (atomic)
10. CLOSE maintenance = vehicle → AVAILABLE (unless RETIRED)

## License

MIT

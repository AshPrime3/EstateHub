# EstateHub

A full-stack property rental and maintenance management system built with React, Express, TypeScript, and PostgreSQL. EstateHub provides role-based dashboards for property managers and maintenance contractors, enabling end-to-end management of rental units, maintenance lifecycles, rent tracking, and real-time alerts.

## Live Demo

- **Frontend**: [estate-hub.vercel.app](https://estate-hub.vercel.app)
- **Backend API**: [estatehub-li0f.onrender.com/api](https://estatehub-li0f.onrender.com/api)

## Features

- **Two-role authentication** — Property Manager and Maintenance Contractor with JWT-based sessions
- **Unit management** — Create, edit, archive, and restore rental units
- **Maintenance lifecycle** — State machine (REPORTED → TRIAGED → SCHEDULED → RESOLVED) with server-side transition validation
- **Contractor assignments** — Many-to-many assignment model with role-based visibility
- **Rent management** — Single and bulk payment recording with automatic classification (MATCHED / UNDERPAID / OVERPAID / UNMATCHED)
- **CSV export** — Rent roll export for property managers
- **Dashboard** — Real-time metrics with interactive charts
- **Immutable audit trail** — Append-only event history for all maintenance actions
- **Rent alerts** — Overdue detection with configurable grace period and month-specific dismissal

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, React Hook Form, Zod, Recharts |
| Backend | Node.js, Express, TypeScript, Prisma ORM, Zod, JWT, bcrypt |
| Database | PostgreSQL (Supabase) |
| Hosting | Vercel (frontend), Render (backend), Supabase (database) |

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Supabase account)

### Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example server/.env
cp .env.example client/.env
# Edit both .env files with your values

# Run database migrations
cd server
npx prisma migrate deploy

# Seed demo data
npx prisma db seed

# Start development servers
cd ..
npm run dev:server  # Terminal 1
npm run dev:client  # Terminal 2
```

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Property Manager | manager@example.com | DemoManager123! |
| Contractor 1 | contractor1@example.com | DemoContractor123! |
| Contractor 2 | contractor2@example.com | DemoContractor123! |

## Architecture

```
Browser → Vercel (React SPA)
              ↓ HTTPS
         Render (Express API)
              ↓ DATABASE_URL
         Supabase (PostgreSQL)
```

### Request Flow

```
React UI action → HTTP request with JWT → Express middleware (auth, role, validation)
→ Controller → Service → Prisma ORM → PostgreSQL → Response → TanStack Query cache → UI update
```

## API Overview

| Resource | Endpoints |
|----------|-----------|
| Auth | POST /api/auth/login, GET /api/auth/me |
| Units | GET/POST /api/units, GET/PATCH /api/units/:id, POST archive/restore |
| Maintenance | GET/POST /api/maintenance, GET/PATCH /:id, POST /:id/status |
| Assignments | POST/DELETE /api/maintenance/:id/contractors |
| Notes | POST /api/maintenance/:id/notes |
| Rent | GET/POST /api/rent, POST /api/rent/bulk, GET /api/rent/export |
| Dashboard | GET /api/dashboard |
| Alerts | GET /api/alerts, POST /api/alerts/:unitId/dismiss |

## Documentation

- [Architecture](docs/architecture.md)
- [Database Schema](docs/schema.md)
- [Development Plan](docs/plan.md)
- [Technical Decisions](docs/decisions.md)
- [AI Prompts Log](docs/ai-prompts.md)

## License

This project is for portfolio and demonstration purposes.

# Property Rental & Maintenance Management System

## BUSY Infotech — Assignment 07

A full-stack web application for managing property rentals and maintenance requests, built with React, Express, TypeScript, and PostgreSQL.

## Features

- **Two-role authentication**: Property Manager and Maintenance Contractor
- **Unit management**: Create, edit, archive, and restore rental units
- **Maintenance lifecycle**: REPORTED → TRIAGED → SCHEDULED → RESOLVED with server-side validation
- **Contractor assignments**: Multiple contractors per request with role-based visibility
- **Rent management**: Single and bulk payment recording with classification
- **CSV export**: Rent roll export for property managers
- **Dashboard**: Real-time metrics with charts
- **Immutable audit trail**: Complete history of all maintenance actions
- **Rent alerts**: Overdue detection with month-specific dismissal

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
- [AI Prompts](docs/ai-prompts.md)

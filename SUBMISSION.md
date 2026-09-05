# Submission

## Repository

GitHub: https://github.com/USERNAME/property-rental-management

## Live Application

Frontend: https://property-rental.vercel.app
Backend API: https://property-rental-api.onrender.com

## Demo Credentials

### Property Manager
- Email: `manager@example.com`
- Password: `DemoManager123!`

### Maintenance Contractor 1
- Email: `contractor1@example.com`
- Password: `DemoContractor123!`

### Maintenance Contractor 2
- Email: `contractor2@example.com`
- Password: `DemoContractor123!`

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, React Hook Form, Zod, Recharts |
| Backend | Node.js, Express, TypeScript, Prisma ORM, Zod, JWT, bcrypt |
| Database | PostgreSQL (Supabase) |
| Hosting | Vercel (frontend), Render (backend), Supabase (database) |

## Goal Checklist

| # | Goal | Status |
|---|------|--------|
| 1 | Accounts and roles | ✅ Done |
| 2 | Units (CRUD + archive/restore) | ✅ Done |
| 3 | Maintenance requests | ✅ Done |
| 4 | Maintenance lifecycle | ✅ Done |
| 5 | Contractor assignment | ✅ Done |
| 6 | Finding requests (search/filter/pagination) | ✅ Done |
| 7 | Bulk rent + CSV export | ✅ Done |
| 8 | Dashboard | ✅ Done |
| 9 | Immutable maintenance history | ✅ Done |
| 10 | Rent alerts | ✅ Done |

## Time Spent

Total: ~16 hours

## What Would I Do With Another 12 Hours?

- More comprehensive automated tests (E2E with Playwright)
- Better observability (structured logging, error tracking)
- Tenant portal for self-service
- Photo attachments for maintenance requests
- Background jobs for alert emails
- Better dashboard performance with materialized views

## What Am I Least Happy With?

The test coverage could be more comprehensive. While the critical business rules are tested, there are edge cases in the rent classification and alert system that would benefit from additional test scenarios. The frontend testing is also minimal — integration tests with React Testing Library would improve confidence in the UI layer.

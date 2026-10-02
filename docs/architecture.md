# Architecture

## Overview

EstateHub is a property rental and maintenance management system using a separated frontend/backend architecture.

## System Components

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (server state), React Context (auth state)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Routing**: React Router v6

### Backend
- **Runtime**: Node.js
- **Framework**: Express with TypeScript
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Validation**: Zod
- **Security**: Helmet, CORS, rate limiting

### Database
- **Engine**: PostgreSQL (hosted on Supabase)
- **ORM**: Prisma with typed client generation

## Request Flow

```
User clicks action in React UI
    ↓
React sends HTTP request with JWT in Authorization header
    ↓
Express receives request
    ↓
Authentication middleware verifies JWT
    ↓
Authorization middleware checks user role
    ↓
Input validation (Zod schemas)
    ↓
Controller delegates to Service
    ↓
Service executes business logic
    ↓
Prisma ORM queries PostgreSQL
    ↓
Response returned to React
    ↓
TanStack Query caches and updates UI
```

## Deployment Architecture

```
Browser → Vercel (React frontend)
              ↓ HTTPS
         Render (Express API)
              ↓ DATABASE_URL
         Supabase (PostgreSQL)
```

## Future Enhancements

The following features are planned for future iterations:

- Tenant portal
- Lease renewals
- Photo uploads
- Ratings
- Preventive maintenance scheduling
- Multiple property owners
- Late fee calculation
- Utility billing
- Inspection checklists

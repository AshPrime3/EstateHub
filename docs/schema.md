# Database Schema

## Overview

The database uses PostgreSQL with Prisma ORM. All tables use UUID primary keys and timestamp tracking.

## Entity Relationship Diagram

```
User (1) ──── (many) MaintenanceRequest
User (1) ──── (many) MaintenanceAssignment (contractor)
User (1) ──── (many) RentPayment (recordedBy)
User (1) ──── (many) MaintenanceEvent (actor)
User (1) ──── (many) RentAlertDismissal (dismissedBy)

Unit (1) ──── (many) MaintenanceRequest
Unit (1) ──── (many) RentPayment
Unit (1) ──── (many) RentAlertDismissal

MaintenanceRequest (1) ──── (many) MaintenanceAssignment
MaintenanceRequest (1) ──── (many) MaintenanceEvent
```

## Tables

### User
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, default uuid |
| name | VARCHAR | NOT NULL |
| email | VARCHAR | UNIQUE, NOT NULL |
| passwordHash | VARCHAR | NOT NULL |
| role | ENUM (PROPERTY_MANAGER, MAINTENANCE_CONTRACTOR) | NOT NULL |
| createdAt | TIMESTAMP | default now() |
| updatedAt | TIMESTAMP | auto-updated |

### Unit
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| unitNumber | VARCHAR | NOT NULL |
| address | VARCHAR | NOT NULL |
| monthlyRent | DECIMAL(10,2) | NOT NULL, >= 0 |
| tenantName | VARCHAR | NOT NULL |
| isArchived | BOOLEAN | default false |
| createdAt | TIMESTAMP | default now() |
| updatedAt | TIMESTAMP | auto-updated |

### MaintenanceRequest
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| unitId | UUID | FK → Unit, NOT NULL |
| description | TEXT | NOT NULL |
| priority | ENUM (LOW, MEDIUM, HIGH) | NOT NULL |
| status | ENUM (REPORTED, TRIAGED, SCHEDULED, RESOLVED) | NOT NULL, default REPORTED |
| createdById | UUID | FK → User, NOT NULL |
| createdAt | TIMESTAMP | default now() |
| updatedAt | TIMESTAMP | auto-updated |

### MaintenanceAssignment
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| requestId | UUID | FK → MaintenanceRequest, NOT NULL |
| contractorId | UUID | FK → User, NOT NULL |
| assignedAt | TIMESTAMP | default now() |

**Unique constraint**: (requestId, contractorId)

### RentPayment
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| unitId | UUID | FK → Unit, NOT NULL |
| amount | DECIMAL(10,2) | NOT NULL |
| paymentMonth | DATE | NOT NULL |
| recordedById | UUID | FK → User, NOT NULL |
| createdAt | TIMESTAMP | default now() |

**Unique constraint**: (unitId, paymentMonth)

### MaintenanceEvent
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| requestId | UUID | FK → MaintenanceRequest, NOT NULL |
| actorId | UUID | FK → User, NOT NULL |
| eventType | ENUM (CREATED, STATUS_CHANGED, CONTRACTOR_ASSIGNED, CONTRACTOR_UNASSIGNED, NOTE_ADDED) | NOT NULL |
| oldValue | VARCHAR | nullable |
| newValue | VARCHAR | nullable |
| note | TEXT | nullable |
| createdAt | TIMESTAMP | default now() |

**This table is append-only. No update or delete operations are supported.**

### RentAlertDismissal
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| unitId | UUID | FK → Unit, NOT NULL |
| paymentMonth | DATE | NOT NULL |
| dismissedById | UUID | FK → User, NOT NULL |
| dismissedAt | TIMESTAMP | default now() |

**Unique constraint**: (unitId, paymentMonth)

## Indexes

- MaintenanceRequest: status, priority, createdAt, unitId
- MaintenanceAssignment: contractorId
- RentPayment: paymentMonth, unitId
- MaintenanceEvent: requestId, createdAt
- RentAlertDismissal: unitId, paymentMonth

## Database vs Application Constraints

**Database-enforced**: unique email, unique assignment pairs, unique rent per unit/month, foreign keys, non-null fields

**Application-enforced**: maintenance lifecycle transitions, scheduled-requires-contractor rule, role permissions, rent overdue calculation, grace period logic

## Denormalization

No significant denormalization was used. The system is small and transactional, so normalized relational data keeps the business rules and relationships easy to reason about.

## 100x Data Considerations

If data grew 100x, the first bottlenecks would be:
- Dashboard aggregation queries → use materialized views or background jobs
- Maintenance search → add full-text search indexes
- Audit timeline queries → partition by date
- CSV export → stream results, use background job + object storage

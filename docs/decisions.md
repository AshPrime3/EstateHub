# Technical Decisions

## Decision 1 — PostgreSQL over MongoDB

**Chose**: PostgreSQL  
**Rejected**: MongoDB  
**Reason**: The domain has strong relational relationships (units → maintenance requests → assignments → contractors). PostgreSQL's foreign keys, unique constraints, and ACID transactions are essential for enforcing business rules like immutable audit history and rent payment uniqueness.

## Decision 2 — Prisma ORM over Raw SQL

**Chose**: Prisma ORM  
**Rejected**: Raw SQL / Knex.js  
**Reason**: Prisma provides type-safe database access that integrates naturally with TypeScript. The generated client catches schema mismatches at compile time, reducing runtime errors. For this application's scope, Prisma's query builder handles all needed operations without sacrificing performance.

## Decision 3 — REST API over GraphQL

**Chose**: REST  
**Rejected**: GraphQL  
**Reason**: The application has a small, predictable API surface with clear resource boundaries (units, maintenance, rent, dashboard, alerts). REST's simplicity reduces complexity and is more appropriate for a take-home assignment. GraphQL would add unnecessary overhead.

## Decision 4 — Append-Only Audit Events

**Chose**: Immutable MaintenanceEvent table with no update/delete endpoints  
**Rejected**: Mutable history with soft-delete  
**Reason**: The assignment explicitly requires that maintenance history cannot be rewritten. Making the events append-only at both the API and database level ensures this invariant is always maintained.

## Decision 5 — Month-Specific Alert Dismissal

**Chose**: RentAlertDismissal table with (unitId, paymentMonth) unique constraint  
**Rejected**: Boolean `alertDismissed` flag on Unit table  
**Reason**: A unit-level boolean would permanently suppress alerts. The assignment requires that dismissing September's alert should not prevent October's alert. The month-specific dismissal table correctly models this requirement.

## Decision 6 — Grace Period Configuration

**Chose**: 5-day grace period via RENT_GRACE_PERIOD_DAYS environment variable  
**Reason**: The README mentions "a short grace period" without specifying exact days. We chose 5 days as a reasonable default and made it configurable. Documented as a design decision since the exact value was not specified.

## Decision 7 (Reversed) — Contractor Assignment Model

**Initial approach**: Store a single `contractorId` directly on MaintenanceRequest  
**Why it seemed reasonable**: Simplest possible implementation, one foreign key per request  
**What exposed the problem**: The assignment specification says "any number of contractors may be assigned to a request"  
**Final approach**: Created a separate `MaintenanceAssignment` join table with unique constraint on (requestId, contractorId)  
**Why this is better**: Correctly models the many-to-many relationship between requests and contractors, allows multiple assignments per request, and prevents duplicate assignments via database constraint

## Decision 8 — Auto-Assign Contractor on Request Creation

**Chose**: When a contractor creates a maintenance request, automatically assign them to it  
**Reason**: Contractors can only see requests assigned to them. Without auto-assignment, a contractor would create a request and then lose visibility over it until a manager assigns them. This provides better UX while maintaining the "only assigned requests" security rule.

# AI Prompts Log

## Assignment Decomposition

### Prompt
"Analyze the blueprint.md and guide.md files completely. Understand all 10 mandatory goals, the required technology stack, database design, and checkpoint-based development approach. Create a complete implementation plan."

### What I Got
A comprehensive analysis of all 130+ sections in the blueprint, identifying the exact database schema, API design, authentication/authorization requirements, maintenance lifecycle rules, rent classification logic, and alert system design.

### What I Corrected
The initial analysis was accurate. No corrections needed at the planning stage.

---

## Database Design

### Prompt
"Create the Prisma schema with all 7 tables, proper relationships, enums, unique constraints, and indexes as specified in the blueprint."

### What I Got
A complete schema with User, Unit, MaintenanceRequest, MaintenanceAssignment, RentPayment, MaintenanceEvent, and RentAlertDismissal models.

### What I Corrected
AI initially suggested storing `contractorId` directly on MaintenanceRequest as a simple foreign key. This was incorrect because the assignment requires any number of contractors to be assigned to a single request. I replaced it with a separate `MaintenanceAssignment` join table with a unique constraint on (requestId, contractorId) to prevent duplicate assignments.

---

## Maintenance Lifecycle

### Prompt
"Implement the maintenance lifecycle validation: REPORTED → TRIAGED → SCHEDULED → RESOLVED, with RESOLVED → TRIAGED for reopening. SCHEDULED requires at least one contractor."

### What I Got
A domain function with transition map and contractor check.

### What I Corrected
Initially the AI implementation allowed TRIAGED → SCHEDULED without checking contractor assignments. Added the contractor check as a separate validation step to match the assignment requirement that this must be enforced server-side.

---

## Alert System

### Prompt
"Implement rent alerts with month-specific dismissal. Alerts should return for new unpaid months even after previous months are dismissed."

### What I Got
Implementation using a RentAlertDismissal table with (unitId, paymentMonth) composite unique constraint.

### What I Corrected
No correction needed. The month-specific approach was correctly identified from the blueprint's explicit warning against using a simple boolean flag.

---

## Bulk Rent Processing

### Prompt
"Implement bulk rent recording that classifies each payment as MATCHED, UNDERPAID, OVERPAID, or UNMATCHED."

### What I Got
Bulk processing endpoint that validates all rows and returns per-row classifications.

### What I Corrected
AI initially silently skipped unknown unit identifiers. Changed to explicitly report them as UNMATCHED in the response, as the blueprint requires that no rows should be silently discarded.

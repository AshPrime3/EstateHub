# AI Prompts Log

## Assignment Decomposition

### Prompt
"Hey, I need help breaking down this property management assignment. I've attached the `blueprint.md` and `guide.md` files. Can you review them and help me outline a concrete implementation plan? I specifically need to make sure I hit all 10 mandatory goals and follow the checkpoint-based approach. What's the best way to structure the database and the Express backend?"

### What I Got
A comprehensive analysis of all 130+ sections in the blueprint, identifying the exact database schema, API design, authentication/authorization requirements, maintenance lifecycle rules, rent classification logic, and alert system design.

### What I Corrected
The initial analysis was accurate and provided a solid roadmap. No corrections needed at the planning stage.

---

## Database Design

### Prompt
"I'm setting up Prisma for the backend. Based on the requirements in the blueprint, I need to create the schema with all 7 tables: User, Unit, MaintenanceRequest, etc. Can you generate the `schema.prisma` file with the correct enums, relationships, and indexes? Remember that multiple contractors can be assigned to a single maintenance request, so we'll need a join table."

### What I Got
A complete schema with User, Unit, MaintenanceRequest, MaintenanceAssignment, RentPayment, MaintenanceEvent, and RentAlertDismissal models.

### What I Corrected
AI initially suggested storing `contractorId` directly on the `MaintenanceRequest` table as a simple foreign key. This was incorrect because the assignment explicitly requires allowing multiple contractors to be assigned to a single request. I corrected this by having it generate a separate `MaintenanceAssignment` join table with a unique constraint on `(requestId, contractorId)` to prevent duplicate assignments.

---

## Maintenance Lifecycle

### Prompt
"I'm working on the maintenance request state machine. I need a function that validates state transitions exactly like this: REPORTED -> TRIAGED -> SCHEDULED -> RESOLVED. Also, RESOLVED can go back to TRIAGED if reopened. Crucially, a request CANNOT move to SCHEDULED unless it has at least one contractor assigned. Can you write the domain logic for this in TypeScript?"

### What I Got
A domain function with a transition map and contractor check.

### What I Corrected
Initially, the AI implementation allowed the `TRIAGED -> SCHEDULED` transition without checking if any contractors were actually assigned in the database. I had to correct the logic to explicitly check the `assignments` array length before allowing that specific state transition, matching the server-side enforcement requirement.

---

## Alert System

### Prompt
"I need to build the rent alert system. The requirements state that if a user dismisses an alert for a unit in January, they should still see a new alert if the unit is overdue in February. So a simple boolean 'isDismissed' flag won't work. Can you design the schema and service logic for a month-specific dismissal system?"

### What I Got
Implementation using a `RentAlertDismissal` table with a `(unitId, paymentMonth)` composite unique constraint.

### What I Corrected
No correction needed. The AI correctly identified the need for a separate tracking table based on the explicit warning in the blueprint, and implemented the exact composite key needed.

---

## Bulk Rent Processing

### Prompt
"I need an Express controller and service to handle bulk rent payments via CSV upload. The logic needs to validate each row and classify the payment as either MATCHED, UNDERPAID, OVERPAID, or UNMATCHED based on the unit's monthly rent. Make sure it doesn't just crash or silently drop rows if it finds a unit identifier that doesn't exist in the database."

### What I Got
Bulk processing endpoint that parses the CSV, validates all rows, and returns a detailed array of per-row classifications.

### What I Corrected
The AI initially just skipped unknown unit identifiers and returned a success message for the matched ones. I had to modify the code to explicitly report those missing units as `UNMATCHED` in the response array, since the blueprint strictly states that no rows should be silently discarded.

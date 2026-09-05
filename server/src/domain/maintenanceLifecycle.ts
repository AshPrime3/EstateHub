import { MaintenanceStatus } from '@prisma/client';

/**
 * Allowed maintenance status transitions.
 * REPORTED → TRIAGED
 * TRIAGED → SCHEDULED (requires contractor)
 * SCHEDULED → RESOLVED
 * RESOLVED → TRIAGED (reopen)
 */
const ALLOWED_TRANSITIONS: Record<MaintenanceStatus, MaintenanceStatus[]> = {
  REPORTED: [MaintenanceStatus.TRIAGED],
  TRIAGED: [MaintenanceStatus.SCHEDULED],
  SCHEDULED: [MaintenanceStatus.RESOLVED],
  RESOLVED: [MaintenanceStatus.TRIAGED],
};

export interface TransitionResult {
  valid: boolean;
  message?: string;
}

export function validateMaintenanceTransition(
  currentStatus: MaintenanceStatus,
  requestedStatus: MaintenanceStatus,
  hasAssignedContractor: boolean
): TransitionResult {
  const allowedTargets = ALLOWED_TRANSITIONS[currentStatus];

  if (!allowedTargets || !allowedTargets.includes(requestedStatus)) {
    return {
      valid: false,
      message: `Invalid maintenance status transition: ${currentStatus} → ${requestedStatus}.`,
    };
  }

  // TRIAGED → SCHEDULED requires at least one assigned contractor
  if (currentStatus === MaintenanceStatus.TRIAGED && requestedStatus === MaintenanceStatus.SCHEDULED) {
    if (!hasAssignedContractor) {
      return {
        valid: false,
        message: 'A contractor must be assigned before a request can be scheduled.',
      };
    }
  }

  return { valid: true };
}

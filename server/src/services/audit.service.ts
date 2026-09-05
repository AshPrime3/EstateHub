import { PrismaClient } from '@prisma/client';
import { EventType } from '@prisma/client';

const prisma = new PrismaClient();

export async function recordCreated(requestId: string, actorId: string, tx?: any) {
  const client = tx || prisma;
  return client.maintenanceEvent.create({
    data: {
      requestId,
      actorId,
      eventType: EventType.CREATED,
      newValue: 'REPORTED',
    },
  });
}

export async function recordStatusChanged(
  requestId: string,
  actorId: string,
  oldValue: string,
  newValue: string,
  tx?: any
) {
  const client = tx || prisma;
  return client.maintenanceEvent.create({
    data: {
      requestId,
      actorId,
      eventType: EventType.STATUS_CHANGED,
      oldValue,
      newValue,
    },
  });
}

export async function recordContractorAssigned(
  requestId: string,
  actorId: string,
  contractorName: string,
  tx?: any
) {
  const client = tx || prisma;
  return client.maintenanceEvent.create({
    data: {
      requestId,
      actorId,
      eventType: EventType.CONTRACTOR_ASSIGNED,
      newValue: contractorName,
    },
  });
}

export async function recordContractorUnassigned(
  requestId: string,
  actorId: string,
  contractorName: string,
  tx?: any
) {
  const client = tx || prisma;
  return client.maintenanceEvent.create({
    data: {
      requestId,
      actorId,
      eventType: EventType.CONTRACTOR_UNASSIGNED,
      oldValue: contractorName,
    },
  });
}

export async function recordNoteAdded(
  requestId: string,
  actorId: string,
  note: string,
  tx?: any
) {
  const client = tx || prisma;
  return client.maintenanceEvent.create({
    data: {
      requestId,
      actorId,
      eventType: EventType.NOTE_ADDED,
      note,
    },
  });
}

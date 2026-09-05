import { PrismaClient, Prisma, MaintenanceStatus, Role } from '@prisma/client';
import { CreateMaintenanceInput, UpdateMaintenanceInput, MaintenanceQuery } from '../validators/maintenance.schemas';
import { validateMaintenanceTransition } from '../domain/maintenanceLifecycle';
import { getPaginationOffset, buildPaginationResult } from '../utils/pagination';
import * as auditService from './audit.service';

const prisma = new PrismaClient();

export async function listMaintenance(query: MaintenanceQuery, userId: string, userRole: string) {
  const { skip, take } = getPaginationOffset({ page: query.page, pageSize: query.pageSize });

  const where: Prisma.MaintenanceRequestWhereInput = {};

  // Contractor can only see assigned requests
  if (userRole === 'MAINTENANCE_CONTRACTOR') {
    where.assignments = {
      some: { contractorId: userId },
    };
  }

  if (query.search) {
    where.description = { contains: query.search, mode: 'insensitive' };
  }

  if (query.unitId) {
    where.unitId = query.unitId;
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.priority) {
    where.priority = query.priority;
  }

  if (query.contractorId) {
    where.assignments = {
      ...where.assignments as any,
      some: {
        ...(where.assignments as any)?.some,
        contractorId: query.contractorId,
      },
    };
  }

  // Whitelist sort fields
  const sortFieldMap: Record<string, string> = {
    createdAt: 'createdAt',
    priority: 'priority',
    status: 'status',
  };

  const orderBy: Prisma.MaintenanceRequestOrderByWithRelationInput = {
    [sortFieldMap[query.sortBy] || 'createdAt']: query.sortOrder,
  };

  const [items, total] = await Promise.all([
    prisma.maintenanceRequest.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        unit: { select: { id: true, unitNumber: true, address: true } },
        createdBy: { select: { id: true, name: true } },
        assignments: {
          include: { contractor: { select: { id: true, name: true } } },
        },
      },
    }),
    prisma.maintenanceRequest.count({ where }),
  ]);

  return {
    items,
    pagination: buildPaginationResult({ page: query.page, pageSize: query.pageSize }, total),
  };
}

export async function getMaintenanceById(id: string, userId: string, userRole: string) {
  const request = await prisma.maintenanceRequest.findUnique({
    where: { id },
    include: {
      unit: { select: { id: true, unitNumber: true, address: true } },
      createdBy: { select: { id: true, name: true } },
      assignments: {
        include: { contractor: { select: { id: true, name: true, email: true } } },
      },
      events: {
        include: { actor: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!request) {
    throw { status: 404, message: 'Maintenance request not found.' };
  }

  // Contractor can only see assigned requests
  if (userRole === 'MAINTENANCE_CONTRACTOR') {
    const isAssigned = request.assignments.some((a) => a.contractorId === userId);
    if (!isAssigned) {
      throw { status: 404, message: 'Maintenance request not found.' };
    }
  }

  return request;
}

export async function createMaintenance(input: CreateMaintenanceInput, userId: string, userRole: string) {
  // Verify unit exists
  const unit = await prisma.unit.findUnique({ where: { id: input.unitId } });
  if (!unit) {
    throw { status: 404, message: 'Unit not found.' };
  }

  const result = await prisma.$transaction(async (tx) => {
    const request = await tx.maintenanceRequest.create({
      data: {
        unitId: input.unitId,
        description: input.description,
        priority: input.priority,
        status: 'REPORTED',
        createdById: userId,
      },
      include: {
        unit: { select: { id: true, unitNumber: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    // Create audit event
    await tx.maintenanceEvent.create({
      data: {
        requestId: request.id,
        actorId: userId,
        eventType: 'CREATED',
        newValue: 'REPORTED',
      },
    });

    // If contractor creates request, auto-assign them
    if (userRole === 'MAINTENANCE_CONTRACTOR') {
      await tx.maintenanceAssignment.create({
        data: {
          requestId: request.id,
          contractorId: userId,
        },
      });

      await tx.maintenanceEvent.create({
        data: {
          requestId: request.id,
          actorId: userId,
          eventType: 'CONTRACTOR_ASSIGNED',
          newValue: userId,
        },
      });
    }

    return request;
  });

  return result;
}

export async function updateMaintenance(
  id: string,
  input: UpdateMaintenanceInput,
  userId: string,
  userRole: string
) {
  const existing = await prisma.maintenanceRequest.findUnique({
    where: { id },
    include: { assignments: true },
  });

  if (!existing) {
    throw { status: 404, message: 'Maintenance request not found.' };
  }

  // Contractor can only edit assigned requests
  if (userRole === 'MAINTENANCE_CONTRACTOR') {
    const isAssigned = existing.assignments.some((a) => a.contractorId === userId);
    if (!isAssigned) {
      throw { status: 404, message: 'Maintenance request not found.' };
    }
  }

  const request = await prisma.maintenanceRequest.update({
    where: { id },
    data: input,
    include: {
      unit: { select: { id: true, unitNumber: true } },
      createdBy: { select: { id: true, name: true } },
      assignments: {
        include: { contractor: { select: { id: true, name: true } } },
      },
    },
  });

  return request;
}

export async function updateStatus(id: string, newStatus: MaintenanceStatus, userId: string, userRole: string) {
  const existing = await prisma.maintenanceRequest.findUnique({
    where: { id },
    include: { assignments: true },
  });

  if (!existing) {
    throw { status: 404, message: 'Maintenance request not found.' };
  }

  // Contractor can only update assigned requests
  if (userRole === 'MAINTENANCE_CONTRACTOR') {
    const isAssigned = existing.assignments.some((a) => a.contractorId === userId);
    if (!isAssigned) {
      throw { status: 404, message: 'Maintenance request not found.' };
    }
  }

  // Validate transition
  const hasContractor = existing.assignments.length > 0;
  const result = validateMaintenanceTransition(existing.status, newStatus, hasContractor);

  if (!result.valid) {
    throw { status: 400, message: result.message };
  }

  // Update status and create audit event in a transaction
  const updated = await prisma.$transaction(async (tx) => {
    const request = await tx.maintenanceRequest.update({
      where: { id },
      data: { status: newStatus },
      include: {
        unit: { select: { id: true, unitNumber: true } },
        createdBy: { select: { id: true, name: true } },
        assignments: {
          include: { contractor: { select: { id: true, name: true } } },
        },
      },
    });

    await tx.maintenanceEvent.create({
      data: {
        requestId: id,
        actorId: userId,
        eventType: 'STATUS_CHANGED',
        oldValue: existing.status,
        newValue: newStatus,
      },
    });

    return request;
  });

  return updated;
}

export async function assignContractor(requestId: string, contractorId: string, actorId: string) {
  // Verify request exists
  const request = await prisma.maintenanceRequest.findUnique({ where: { id: requestId } });
  if (!request) {
    throw { status: 404, message: 'Maintenance request not found.' };
  }

  // Verify contractor exists and has the right role
  const contractor = await prisma.user.findUnique({ where: { id: contractorId } });
  if (!contractor || contractor.role !== 'MAINTENANCE_CONTRACTOR') {
    throw { status: 400, message: 'Invalid contractor.' };
  }

  // Check if already assigned
  const existing = await prisma.maintenanceAssignment.findUnique({
    where: { requestId_contractorId: { requestId, contractorId } },
  });

  if (existing) {
    throw { status: 409, message: 'Contractor is already assigned to this request.' };
  }

  const result = await prisma.$transaction(async (tx) => {
    const assignment = await tx.maintenanceAssignment.create({
      data: { requestId, contractorId },
      include: { contractor: { select: { id: true, name: true } } },
    });

    await tx.maintenanceEvent.create({
      data: {
        requestId,
        actorId,
        eventType: 'CONTRACTOR_ASSIGNED',
        newValue: contractor.name,
      },
    });

    return assignment;
  });

  return result;
}

export async function removeContractor(requestId: string, contractorId: string, actorId: string) {
  const assignment = await prisma.maintenanceAssignment.findUnique({
    where: { requestId_contractorId: { requestId, contractorId } },
    include: { contractor: { select: { name: true } } },
  });

  if (!assignment) {
    throw { status: 404, message: 'Assignment not found.' };
  }

  await prisma.$transaction(async (tx) => {
    await tx.maintenanceAssignment.delete({
      where: { id: assignment.id },
    });

    await tx.maintenanceEvent.create({
      data: {
        requestId,
        actorId,
        eventType: 'CONTRACTOR_UNASSIGNED',
        oldValue: assignment.contractor.name,
      },
    });
  });
}

export async function addNote(requestId: string, note: string, userId: string, userRole: string) {
  const request = await prisma.maintenanceRequest.findUnique({
    where: { id: requestId },
    include: { assignments: true },
  });

  if (!request) {
    throw { status: 404, message: 'Maintenance request not found.' };
  }

  // Contractor can only add notes to assigned requests
  if (userRole === 'MAINTENANCE_CONTRACTOR') {
    const isAssigned = request.assignments.some((a) => a.contractorId === userId);
    if (!isAssigned) {
      throw { status: 404, message: 'Maintenance request not found.' };
    }
  }

  const event = await prisma.maintenanceEvent.create({
    data: {
      requestId,
      actorId: userId,
      eventType: 'NOTE_ADDED',
      note,
    },
    include: { actor: { select: { id: true, name: true } } },
  });

  return event;
}

export async function getContractors() {
  return prisma.user.findMany({
    where: { role: 'MAINTENANCE_CONTRACTOR' },
    select: { id: true, name: true, email: true },
  });
}

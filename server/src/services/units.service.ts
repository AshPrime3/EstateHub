import { PrismaClient, Prisma } from '@prisma/client';
import { CreateUnitInput, UpdateUnitInput } from '../validators/unit.schemas';

const prisma = new PrismaClient();

export async function listUnits(includeArchived: boolean = false) {
  const where: Prisma.UnitWhereInput = includeArchived ? {} : { isArchived: false };

  const units = await prisma.unit.findMany({
    where,
    orderBy: { unitNumber: 'asc' },
  });

  return units;
}

export async function getUnitById(id: string) {
  const unit = await prisma.unit.findUnique({
    where: { id },
    include: {
      maintenanceRequests: {
        include: {
          assignments: {
            include: { contractor: { select: { id: true, name: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      rentPayments: {
        orderBy: { paymentMonth: 'desc' },
        take: 12,
      },
    },
  });

  if (!unit) {
    throw { status: 404, message: 'Unit not found.' };
  }

  return unit;
}

export async function createUnit(input: CreateUnitInput) {
  const unit = await prisma.unit.create({
    data: {
      unitNumber: input.unitNumber,
      address: input.address,
      monthlyRent: input.monthlyRent,
      tenantName: input.tenantName,
    },
  });

  return unit;
}

export async function updateUnit(id: string, input: UpdateUnitInput) {
  const existing = await prisma.unit.findUnique({ where: { id } });
  if (!existing) {
    throw { status: 404, message: 'Unit not found.' };
  }

  const unit = await prisma.unit.update({
    where: { id },
    data: input,
  });

  return unit;
}

export async function archiveUnit(id: string) {
  const existing = await prisma.unit.findUnique({ where: { id } });
  if (!existing) {
    throw { status: 404, message: 'Unit not found.' };
  }

  if (existing.isArchived) {
    throw { status: 400, message: 'Unit is already archived.' };
  }

  const unit = await prisma.unit.update({
    where: { id },
    data: { isArchived: true },
  });

  return unit;
}

export async function restoreUnit(id: string) {
  const existing = await prisma.unit.findUnique({ where: { id } });
  if (!existing) {
    throw { status: 404, message: 'Unit not found.' };
  }

  if (!existing.isArchived) {
    throw { status: 400, message: 'Unit is not archived.' };
  }

  const unit = await prisma.unit.update({
    where: { id },
    data: { isArchived: false },
  });

  return unit;
}

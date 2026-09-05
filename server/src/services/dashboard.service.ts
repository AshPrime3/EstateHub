import { PrismaClient } from '@prisma/client';
import { getCurrentPaymentMonth, isGracePeriodPassed, getStartOfWeek, getEightWeeksAgo } from '../utils/dates';
import { env } from '../config/env';

const prisma = new PrismaClient();

export async function getDashboardData() {
  const currentMonth = getCurrentPaymentMonth();
  const weekStart = getStartOfWeek();
  const eightWeeksAgo = getEightWeeksAgo();

  // Open maintenance requests (not RESOLVED)
  const openMaintenanceRequests = await prisma.maintenanceRequest.count({
    where: { status: { not: 'RESOLVED' } },
  });

  // Units with overdue rent this month
  const overdueRentUnits = await calculateOverdueUnits(currentMonth);

  // Resolved requests this week (from audit events)
  const resolvedThisWeek = await prisma.maintenanceEvent.count({
    where: {
      eventType: 'STATUS_CHANGED',
      newValue: 'RESOLVED',
      createdAt: { gte: weekStart },
    },
  });

  // Total rent collected this month
  const rentAgg = await prisma.rentPayment.aggregate({
    where: { paymentMonth: currentMonth },
    _sum: { amount: true },
  });
  const rentCollectedThisMonth = Number(rentAgg._sum.amount || 0);

  // Maintenance by status
  const statusGroups = await prisma.maintenanceRequest.groupBy({
    by: ['status'],
    _count: { id: true },
  });
  const maintenanceByStatus = statusGroups.map((g) => ({
    status: g.status,
    count: g._count.id,
  }));

  // Maintenance by contractor
  const contractorAssignments = await prisma.maintenanceAssignment.findMany({
    include: {
      contractor: { select: { name: true } },
      request: { select: { status: true } },
    },
  });
  const contractorMap = new Map<string, number>();
  contractorAssignments.forEach((a) => {
    const name = a.contractor.name;
    contractorMap.set(name, (contractorMap.get(name) || 0) + 1);
  });
  const maintenanceByContractor = Array.from(contractorMap.entries()).map(([name, count]) => ({ name, count }));

  // Resolved by week (last 8 weeks)
  const resolvedEvents = await prisma.maintenanceEvent.findMany({
    where: {
      eventType: 'STATUS_CHANGED',
      newValue: 'RESOLVED',
      createdAt: { gte: eightWeeksAgo },
    },
    select: { createdAt: true },
  });

  const weekBuckets: Array<{ week: string; count: number }> = [];
  for (let i = 7; i >= 0; i--) {
    const wStart = new Date(eightWeeksAgo);
    wStart.setUTCDate(wStart.getUTCDate() + (7 - i) * 7);
    const wEnd = new Date(wStart);
    wEnd.setUTCDate(wEnd.getUTCDate() + 7);
    const count = resolvedEvents.filter((e) => e.createdAt >= wStart && e.createdAt < wEnd).length;
    const label = `${wStart.getUTCMonth() + 1}/${wStart.getUTCDate()}`;
    weekBuckets.push({ week: label, count });
  }

  return {
    openMaintenanceRequests,
    overdueRentUnits,
    resolvedThisWeek,
    rentCollectedThisMonth,
    maintenanceByStatus,
    maintenanceByContractor,
    resolvedByWeek: weekBuckets,
  };
}

async function calculateOverdueUnits(paymentMonth: Date): Promise<number> {
  if (!isGracePeriodPassed(paymentMonth, env.RENT_GRACE_PERIOD_DAYS)) return 0;

  const units = await prisma.unit.findMany({
    where: { isArchived: false },
    select: { id: true, monthlyRent: true },
  });

  const payments = await prisma.rentPayment.findMany({
    where: { paymentMonth },
    select: { unitId: true, amount: true },
  });
  const paymentMap = new Map(payments.map((p) => [p.unitId, Number(p.amount)]));

  let count = 0;
  for (const unit of units) {
    const paid = paymentMap.get(unit.id) || 0;
    if (paid < Number(unit.monthlyRent)) count++;
  }
  return count;
}

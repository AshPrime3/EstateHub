import { PrismaClient } from '@prisma/client';
import { getCurrentPaymentMonth, isGracePeriodPassed, parsePaymentMonth } from '../utils/dates';
import { env } from '../config/env';

const prisma = new PrismaClient();

export async function getActiveAlerts() {
  const currentMonth = getCurrentPaymentMonth();

  if (!isGracePeriodPassed(currentMonth, env.RENT_GRACE_PERIOD_DAYS)) {
    return { alerts: [], count: 0 };
  }

  const units = await prisma.unit.findMany({
    where: { isArchived: false },
    select: { id: true, unitNumber: true, tenantName: true, monthlyRent: true },
  });

  const payments = await prisma.rentPayment.findMany({
    where: { paymentMonth: currentMonth },
    select: { unitId: true, amount: true },
  });
  const paymentMap = new Map(payments.map((p) => [p.unitId, Number(p.amount)]));

  const dismissals = await prisma.rentAlertDismissal.findMany({
    where: { paymentMonth: currentMonth },
    select: { unitId: true },
  });
  const dismissedSet = new Set(dismissals.map((d) => d.unitId));

  const alerts = units
    .filter((unit) => {
      if (dismissedSet.has(unit.id)) return false;
      const paid = paymentMap.get(unit.id) || 0;
      return paid < Number(unit.monthlyRent);
    })
    .map((unit) => ({
      unitId: unit.id,
      unitNumber: unit.unitNumber,
      tenantName: unit.tenantName,
      monthlyRent: Number(unit.monthlyRent),
      amountPaid: paymentMap.get(unit.id) || 0,
      paymentMonth: currentMonth,
    }));

  return { alerts, count: alerts.length };
}

export async function dismissAlert(unitId: string, paymentMonth: string, userId: string) {
  const unit = await prisma.unit.findUnique({ where: { id: unitId } });
  if (!unit) throw { status: 404, message: 'Unit not found.' };

  const month = parsePaymentMonth(paymentMonth);

  const existing = await prisma.rentAlertDismissal.findUnique({
    where: { unitId_paymentMonth: { unitId, paymentMonth: month } },
  });
  if (existing) throw { status: 409, message: 'Alert already dismissed for this month.' };

  await prisma.rentAlertDismissal.create({
    data: { unitId, paymentMonth: month, dismissedById: userId },
  });

  return { message: 'Alert dismissed.' };
}

export async function getAlertCount() {
  const { count } = await getActiveAlerts();
  return count;
}

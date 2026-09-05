import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { RecordRentInput, BulkRentInput } from '../validators/rent.schemas';
import { parsePaymentMonth, getCurrentPaymentMonth } from '../utils/dates';
import { generateCSV } from '../utils/csv';

const prisma = new PrismaClient();

type RentClassification = 'MATCHED' | 'UNDERPAID' | 'OVERPAID' | 'UNMATCHED';

function classifyPayment(paid: number, expected: number): RentClassification {
  if (paid === expected) return 'MATCHED';
  if (paid < expected) return 'UNDERPAID';
  return 'OVERPAID';
}

export async function recordPayment(input: RecordRentInput, userId: string) {
  const unit = await prisma.unit.findUnique({ where: { id: input.unitId } });
  if (!unit) throw { status: 404, message: 'Unit not found.' };

  const paymentMonth = parsePaymentMonth(input.paymentMonth);
  const existing = await prisma.rentPayment.findUnique({
    where: { unitId_paymentMonth: { unitId: input.unitId, paymentMonth } },
  });
  if (existing) throw { status: 409, message: 'A rent payment already exists for this unit and month.' };

  const payment = await prisma.rentPayment.create({
    data: { unitId: input.unitId, amount: input.amount, paymentMonth, recordedById: userId },
    include: { unit: { select: { id: true, unitNumber: true, monthlyRent: true } } },
  });

  return { ...payment, classification: classifyPayment(input.amount, Number(unit.monthlyRent)) };
}

export async function bulkRecordPayments(input: BulkRentInput, userId: string) {
  const paymentMonth = parsePaymentMonth(input.paymentMonth);
  const results: Array<{ unitIdentifier: string; amount: number; classification: RentClassification; error?: string }> = [];

  for (const p of input.payments) {
    const unit = await prisma.unit.findFirst({ where: { unitNumber: p.unitIdentifier } });
    if (!unit) { results.push({ unitIdentifier: p.unitIdentifier, amount: p.amount, classification: 'UNMATCHED', error: `Unit "${p.unitIdentifier}" not found.` }); continue; }
    const existing = await prisma.rentPayment.findUnique({ where: { unitId_paymentMonth: { unitId: unit.id, paymentMonth } } });
    if (existing) { results.push({ unitIdentifier: p.unitIdentifier, amount: p.amount, classification: classifyPayment(p.amount, Number(unit.monthlyRent)), error: 'Payment already exists for this month.' }); continue; }
    try {
      await prisma.rentPayment.create({ data: { unitId: unit.id, amount: p.amount, paymentMonth, recordedById: userId } });
      results.push({ unitIdentifier: p.unitIdentifier, amount: p.amount, classification: classifyPayment(p.amount, Number(unit.monthlyRent)) });
    } catch { results.push({ unitIdentifier: p.unitIdentifier, amount: p.amount, classification: 'UNMATCHED', error: 'Failed to record.' }); }
  }
  return { results };
}

export async function getRentStatus(month?: string) {
  const paymentMonth = month ? parsePaymentMonth(month) : getCurrentPaymentMonth();
  const units = await prisma.unit.findMany({ where: { isArchived: false }, orderBy: { unitNumber: 'asc' } });
  const payments = await prisma.rentPayment.findMany({ where: { paymentMonth } });
  const paymentMap = new Map(payments.map((p) => [p.unitId, p]));

  return units.map((unit) => {
    const payment = paymentMap.get(unit.id);
    let status = 'UNPAID', amountPaid = 0;
    if (payment) {
      amountPaid = Number(payment.amount);
      const expected = Number(unit.monthlyRent);
      status = amountPaid === expected ? 'MATCHED' : amountPaid < expected ? 'UNDERPAID' : 'OVERPAID';
    }
    return { unitId: unit.id, unitNumber: unit.unitNumber, tenantName: unit.tenantName, monthlyRent: Number(unit.monthlyRent), amountPaid, paymentMonth, status };
  });
}

export async function exportRentRoll(month?: string) {
  const rentStatus = await getRentStatus(month);
  const headers = ['Unit', 'Tenant', 'Monthly Rent', 'Amount Paid', 'Payment Status'];
  const rows = rentStatus.map((r) => [r.unitNumber, r.tenantName, r.monthlyRent.toString(), r.amountPaid.toString(), r.status]);
  return generateCSV(headers, rows);
}

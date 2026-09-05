import { PrismaClient, Role, Priority, MaintenanceStatus, EventType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.rentAlertDismissal.deleteMany();
  await prisma.maintenanceEvent.deleteMany();
  await prisma.maintenanceAssignment.deleteMany();
  await prisma.rentPayment.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.user.deleteMany();

  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  // Users
  const manager = await prisma.user.create({
    data: { name: 'Anita Desai', email: 'manager@example.com', passwordHash: hash('DemoManager123!'), role: Role.PROPERTY_MANAGER },
  });
  const contractor1 = await prisma.user.create({
    data: { name: 'Amit Kumar', email: 'contractor1@example.com', passwordHash: hash('DemoContractor123!'), role: Role.MAINTENANCE_CONTRACTOR },
  });
  const contractor2 = await prisma.user.create({
    data: { name: 'Suresh Patel', email: 'contractor2@example.com', passwordHash: hash('DemoContractor123!'), role: Role.MAINTENANCE_CONTRACTOR },
  });

  console.log('Users created');

  // Units
  const unitData = [
    { unitNumber: '101', address: '12 MG Road, Pune', monthlyRent: 25000, tenantName: 'Rahul Sharma' },
    { unitNumber: '102', address: '12 MG Road, Pune', monthlyRent: 22000, tenantName: 'Priya Singh' },
    { unitNumber: '103', address: '12 MG Road, Pune', monthlyRent: 30000, tenantName: 'Amit Verma' },
    { unitNumber: '104', address: '12 MG Road, Pune', monthlyRent: 18000, tenantName: 'Neha Gupta' },
    { unitNumber: '201', address: '45 Park Street, Mumbai', monthlyRent: 35000, tenantName: 'Vikram Mehta' },
    { unitNumber: '202', address: '45 Park Street, Mumbai', monthlyRent: 28000, tenantName: 'Sunita Rao' },
    { unitNumber: '203', address: '45 Park Street, Mumbai', monthlyRent: 32000, tenantName: 'Rajesh Nair' },
    { unitNumber: '301', address: '78 Brigade Road, Bangalore', monthlyRent: 40000, tenantName: 'Deepak Joshi' },
    { unitNumber: '302', address: '78 Brigade Road, Bangalore', monthlyRent: 38000, tenantName: 'Kavita Reddy' },
    { unitNumber: '303', address: '78 Brigade Road, Bangalore', monthlyRent: 42000, tenantName: 'Manish Tiwari' },
    { unitNumber: '401', address: '23 Anna Salai, Chennai', monthlyRent: 20000, tenantName: 'Lakshmi Iyer' },
    { unitNumber: '402', address: '23 Anna Salai, Chennai', monthlyRent: 24000, tenantName: 'Arun Krishnan' },
    { unitNumber: '501', address: '56 Salt Lake, Kolkata', monthlyRent: 15000, tenantName: 'Soumya Das' },
    { unitNumber: '502', address: '56 Salt Lake, Kolkata', monthlyRent: 17000, tenantName: 'Ritu Banerjee' },
    { unitNumber: '503', address: '56 Salt Lake, Kolkata', monthlyRent: 19000, tenantName: 'Partha Ghosh', isArchived: true },
  ];

  const units = [];
  for (const u of unitData) {
    const unit = await prisma.unit.create({ data: { ...u, isArchived: u.isArchived || false } as any });
    units.push(unit);
  }
  console.log(`${units.length} units created`);

  // Current month
  const now = new Date();
  const currentMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
  const lastMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth() - 1, 1));

  // Maintenance Requests
  const requests = [];
  const reqData = [
    { unit: 0, desc: 'Kitchen tap leaking continuously', priority: Priority.HIGH, status: MaintenanceStatus.SCHEDULED },
    { unit: 0, desc: 'Bathroom door handle broken', priority: Priority.MEDIUM, status: MaintenanceStatus.TRIAGED },
    { unit: 1, desc: 'AC not cooling properly', priority: Priority.HIGH, status: MaintenanceStatus.REPORTED },
    { unit: 1, desc: 'Window glass cracked', priority: Priority.LOW, status: MaintenanceStatus.RESOLVED },
    { unit: 2, desc: 'Bathroom pipe leaking', priority: Priority.HIGH, status: MaintenanceStatus.SCHEDULED },
    { unit: 3, desc: 'Electrical socket sparking', priority: Priority.HIGH, status: MaintenanceStatus.TRIAGED },
    { unit: 4, desc: 'Water heater not working', priority: Priority.MEDIUM, status: MaintenanceStatus.RESOLVED },
    { unit: 5, desc: 'Ceiling fan making noise', priority: Priority.LOW, status: MaintenanceStatus.REPORTED },
    { unit: 6, desc: 'Main door lock jammed', priority: Priority.HIGH, status: MaintenanceStatus.SCHEDULED },
    { unit: 7, desc: 'Paint peeling from walls', priority: Priority.LOW, status: MaintenanceStatus.TRIAGED },
    { unit: 8, desc: 'Kitchen chimney not working', priority: Priority.MEDIUM, status: MaintenanceStatus.REPORTED },
    { unit: 9, desc: 'Toilet flush mechanism broken', priority: Priority.HIGH, status: MaintenanceStatus.RESOLVED },
    { unit: 10, desc: 'Balcony railing loose', priority: Priority.MEDIUM, status: MaintenanceStatus.TRIAGED },
    { unit: 11, desc: 'Intercom not functioning', priority: Priority.LOW, status: MaintenanceStatus.REPORTED },
    { unit: 0, desc: 'Gas pipeline needs inspection', priority: Priority.MEDIUM, status: MaintenanceStatus.RESOLVED },
    { unit: 2, desc: 'Washing machine outlet clogged', priority: Priority.LOW, status: MaintenanceStatus.TRIAGED },
    { unit: 4, desc: 'Parking gate remote not working', priority: Priority.LOW, status: MaintenanceStatus.REPORTED },
    { unit: 7, desc: 'AC outdoor unit vibrating', priority: Priority.MEDIUM, status: MaintenanceStatus.SCHEDULED },
    { unit: 9, desc: 'Water tank overflow alarm', priority: Priority.HIGH, status: MaintenanceStatus.TRIAGED },
    { unit: 3, desc: 'Bedroom light flickering', priority: Priority.LOW, status: MaintenanceStatus.RESOLVED },
  ];

  for (const r of reqData) {
    const req = await prisma.maintenanceRequest.create({
      data: { unitId: units[r.unit].id, description: r.desc, priority: r.priority, status: r.status, createdById: manager.id },
    });
    requests.push(req);
    // Create CREATED event
    await prisma.maintenanceEvent.create({
      data: { requestId: req.id, actorId: manager.id, eventType: EventType.CREATED, newValue: 'REPORTED' },
    });
  }
  console.log(`${requests.length} maintenance requests created`);

  // Assignments for SCHEDULED/TRIAGED/RESOLVED requests
  const assignData = [
    { req: 0, con: contractor1 }, { req: 0, con: contractor2 },
    { req: 1, con: contractor1 },
    { req: 3, con: contractor2 },
    { req: 4, con: contractor1 },
    { req: 5, con: contractor2 },
    { req: 6, con: contractor1 }, { req: 6, con: contractor2 },
    { req: 8, con: contractor2 },
    { req: 9, con: contractor1 },
    { req: 11, con: contractor1 },
    { req: 14, con: contractor2 },
    { req: 17, con: contractor1 },
    { req: 18, con: contractor2 },
    { req: 19, con: contractor1 },
  ];

  for (const a of assignData) {
    await prisma.maintenanceAssignment.create({
      data: { requestId: requests[a.req].id, contractorId: a.con.id },
    });
    await prisma.maintenanceEvent.create({
      data: { requestId: requests[a.req].id, actorId: manager.id, eventType: EventType.CONTRACTOR_ASSIGNED, newValue: a.con.name },
    });
  }

  // Status change events for non-REPORTED requests
  for (const r of reqData) {
    const req = requests[reqData.indexOf(r)];
    if (r.status === MaintenanceStatus.TRIAGED || r.status === MaintenanceStatus.SCHEDULED || r.status === MaintenanceStatus.RESOLVED) {
      await prisma.maintenanceEvent.create({
        data: { requestId: req.id, actorId: manager.id, eventType: EventType.STATUS_CHANGED, oldValue: 'REPORTED', newValue: 'TRIAGED' },
      });
    }
    if (r.status === MaintenanceStatus.SCHEDULED || r.status === MaintenanceStatus.RESOLVED) {
      await prisma.maintenanceEvent.create({
        data: { requestId: req.id, actorId: manager.id, eventType: EventType.STATUS_CHANGED, oldValue: 'TRIAGED', newValue: 'SCHEDULED' },
      });
    }
    if (r.status === MaintenanceStatus.RESOLVED) {
      await prisma.maintenanceEvent.create({
        data: { requestId: req.id, actorId: manager.id, eventType: EventType.STATUS_CHANGED, oldValue: 'SCHEDULED', newValue: 'RESOLVED' },
      });
    }
  }

  // Notes
  await prisma.maintenanceEvent.create({
    data: { requestId: requests[0].id, actorId: contractor1.id, eventType: EventType.NOTE_ADDED, note: 'Replacement tap ordered. Expected delivery in 2 days.' },
  });
  await prisma.maintenanceEvent.create({
    data: { requestId: requests[4].id, actorId: contractor1.id, eventType: EventType.NOTE_ADDED, note: 'Inspected the pipe. Need to replace the entire section.' },
  });

  console.log('Audit events created');

  // Rent Payments — current month
  const rentData = [
    { unit: 0, amount: 25000 },  // MATCHED
    { unit: 1, amount: 20000 },  // UNDERPAID
    { unit: 2, amount: 35000 },  // OVERPAID
    // unit 3: UNPAID
    { unit: 4, amount: 35000 },  // MATCHED
    { unit: 5, amount: 28000 },  // MATCHED
    // unit 6: UNPAID
    { unit: 7, amount: 40000 },  // MATCHED
    { unit: 8, amount: 30000 },  // UNDERPAID
    // unit 9: UNPAID
    { unit: 10, amount: 20000 }, // MATCHED
    { unit: 11, amount: 24000 }, // MATCHED
    { unit: 12, amount: 15000 }, // MATCHED
    // unit 13: UNPAID
  ];

  for (const r of rentData) {
    await prisma.rentPayment.create({
      data: { unitId: units[r.unit].id, amount: r.amount, paymentMonth: currentMonth, recordedById: manager.id },
    });
  }

  // Last month payments
  for (let i = 0; i < 12; i++) {
    if (i === 14) continue; // archived unit
    if (units[i]) {
      try {
        await prisma.rentPayment.create({
          data: { unitId: units[i].id, amount: Number(units[i].monthlyRent), paymentMonth: lastMonth, recordedById: manager.id },
        });
      } catch {}
    }
  }

  console.log('Rent payments created');

  // Dismissed alert for one unit
  await prisma.rentAlertDismissal.create({
    data: { unitId: units[3].id, paymentMonth: lastMonth, dismissedById: manager.id },
  });

  console.log('Seed complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

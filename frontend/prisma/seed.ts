import { PrismaClient, BillStatus, TransactionStatus, PaymentMethod, UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';

dotenv.config();

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('Seeding Derash System...');

  try {
    // --- 1. ENCRYPTION ---
    const hashedAdminPassword = await bcrypt.hash('Admin@123', 10);
    const hashedStaffPassword = await bcrypt.hash('Staff@123', 10);

    // --- 2. BILLERS (Utility & Education) ---
    const aawsa = await prisma.biller.upsert({
      where: { code: 'AAWSA' },
      update: {},
      create: {
        name: 'Addis Ababa Water and Sewerage Authority',
        code: 'AAWSA',
        category: 'WATER',
        account_no: '1000123456',
      },
    });

    const eeu = await prisma.biller.upsert({
      where: { code: 'EEU' },
      update: {},
      create: {
        name: 'Ethiopian Electric Utility',
        code: 'EEU',
        category: 'ELECTRICITY',
        account_no: '1000789101',
      },
    });

    const aau = await prisma.biller.upsert({
      where: { code: 'AAU' },
      update: {},
      create: {
        name: 'Addis Ababa University',
        code: 'AAU',
        category: 'EDUCATION',
        account_no: '1000555666',
      },
    });

    // --- 3. AGENTS (Bank & Wallet) ---
    const cbe = await prisma.agent.upsert({
      where: { code: 'CBE' },
      update: {},
      create: {
        name: 'Commercial Bank of Ethiopia',
        code: 'CBE',
        api_key: 'cbe-secret-2026',
      },
    });

    const telebirr = await prisma.agent.upsert({
      where: { code: 'TELEBIRR' },
      update: {},
      create: {
        name: 'Ethio Telecom Telebirr',
        code: 'TELEBIRR',
        api_key: 'tele-secret-2026',
      },
    });

    // --- 4. USERS (Roles & Access) ---
    // Super Admin (The Derash Employee)
    const superAdmin = await prisma.user.upsert({
      where: { email: 'admin@derash.gov.et' },
      update: {},
      create: {
        name: 'Derash Admin',
        email: 'admin@derash.gov.et',
        password: hashedAdminPassword,
        role: UserRole.SUPER_ADMIN,
      },
    });

    // Biller Admin (The AAWSA Employee)
    const waterStaff = await prisma.user.upsert({
      where: { email: 'manager@aawsa.gov.et' },
      update: {},
      create: {
        name: 'AAWSA Manager',
        email: 'manager@aawsa.gov.et',
        password: hashedStaffPassword,
        role: UserRole.BILLER_ADMIN,
        biller_id: aawsa.id,
      },
    });

    // Agent User (The CBE Teller)
    const bankTeller = await prisma.user.upsert({
      where: { email: 'teller@cbe.com.et' },
      update: {},
      create: {
        name: 'CBE Teller 01',
        email: 'teller@cbe.com.et',
        password: hashedStaffPassword,
        role: UserRole.AGENT_USER,
        agent_id: cbe.id,
      },
    });

    // --- 5. CUSTOMERS ---
    const cust1 = await prisma.customer.upsert({
      where: { contract_number: 'WTR-7788' },
      update: {},
      create: {
        full_name: 'Abebe Kebede',
        phone_no: '251911000001',
        contract_number: 'WTR-7788',
      },
    });

    const cust2 = await prisma.customer.upsert({
      where: { contract_number: 'STU-1234' },
      update: {},
      create: {
        full_name: 'Marta Hailu',
        phone_no: '251922000002',
        contract_number: 'STU-1234',
      },
    });

    // --- 6. BILLS (Unpaid and Paid) ---
    const unpaidBill = await prisma.bill.upsert({
      where: { bill_reference: 'REF-WATER-01' },
      update: {},
      create: {
        bill_reference: 'REF-WATER-01',
        amount_due: 450.00,
        remaining_bal: 450.00,
        status: BillStatus.UNPAID,
        period: 'February 2026',
        biller_id: aawsa.id,
        customer_id: cust1.id,
      },
    });

    const paidBill = await prisma.bill.upsert({
      where: { bill_reference: 'REF-ELEC-01' },
      update: {},
      create: {
        bill_reference: 'REF-ELEC-01',
        amount_due: 300.00,
        amount_paid: 300.00,
        remaining_bal: 0.00,
        status: BillStatus.PAID,
        period: 'January 2026',
        biller_id: eeu.id,
        customer_id: cust1.id,
        paid_at: new Date('2026-02-01'),
      },
    });

    // --- 7. TRANSACTIONS ---
    await prisma.transaction.upsert({
      where: { transactionId: 'TXN-001-SUCCESS' },
      update: {},
      create: {
        transactionId: 'TXN-001-SUCCESS',
        agentReference: 'CBE-REF-999',
        idempotencyKey: 'idem-key-001',
        amount: 300.00,
        biller_share: 290.00,
        agent_share: 7.00,
        aggregator_share: 3.00,
        total_amount: 300.00,
        status: TransactionStatus.SUCCESSFUL,
        payment_method: PaymentMethod.CASH,
        initiated_by: bankTeller.id, // Linked to the CBE Teller
        agent_id: cbe.id,
        bill_id: paidBill.id,
      },
    });

    console.log('Seeding Complete!');
  } catch (e) {
    console.error('Seeding Error:', e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
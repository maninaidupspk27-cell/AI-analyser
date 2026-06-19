const prisma = require('../src/config/db');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('Clearing database tables...');
  await prisma.rating.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.segment.deleteMany();
  await prisma.uploadHistory.deleteMany();
  await prisma.user.deleteMany();

  console.log('Creating database seed assets...');

  // 1. Create Default Users (hashing passwords using bcryptjs)
  const passwordHashAdmin = bcrypt.hashSync('admin123', 10);
  const passwordHashSales = bcrypt.hashSync('sales123', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@manikanta.com',
      fullName: 'Manikanta Admin',
      role: 'ADMIN',
      passwordHash: passwordHashAdmin
    }
  });

  const salesUser = await prisma.user.create({
    data: {
      email: 'sales@manikanta.com',
      fullName: 'Sanjay Kumar (Sales)',
      role: 'SALES_MANAGER',
      passwordHash: passwordHashSales
    }
  });

  console.log(`Created default user logins: Admin (${adminUser.email}), Sales (${salesUser.email})`);

  // 2. Create Default Segments
  const vipSegment = await prisma.segment.create({
    data: {
      name: 'VIP Customers',
      description: 'Highest Lifetime Value (LTV) and high purchase frequency, active recently.',
      minRfmScore: 9.0,
      maxRfmScore: 12.0
    }
  });

  const highPotentialSegment = await prisma.segment.create({
    data: {
      name: 'High Potential',
      description: 'Good spending levels and solid frequency with room for growth.',
      minRfmScore: 7.0,
      maxRfmScore: 9.0
    }
  });

  const regularSegment = await prisma.segment.create({
    data: {
      name: 'Regular Customers',
      description: 'Standard, consistent purchasers showing average metrics.',
      minRfmScore: 5.0,
      maxRfmScore: 7.0
    }
  });

  const atRiskSegment = await prisma.segment.create({
    data: {
      name: 'At Risk',
      description: 'Customers showing long periods since their last order, high churn warning.',
      minRfmScore: 3.0,
      maxRfmScore: 5.0
    }
  });

  const lostSegment = await prisma.segment.create({
    data: {
      name: 'Lost Customers',
      description: 'No orders logged recently, very low liftime value scores.',
      minRfmScore: 0.0,
      maxRfmScore: 3.0
    }
  });

  console.log('Created standard segmentation criteria categories.');

  // 3. Create Default Customers
  const customer1 = await prisma.customer.create({
    data: {
      companyName: 'Acme Corporation',
      contactName: 'John Doe',
      email: 'john@acme.com',
      phone: '+1 (555) 019-2834',
      segmentId: vipSegment.id
    }
  });

  const customer2 = await prisma.customer.create({
    data: {
      companyName: 'Beta Industries',
      contactName: 'Sarah Smith',
      email: 'sarah@betaind.com',
      phone: '+1 (555) 014-9982',
      segmentId: vipSegment.id
    }
  });

  const customer3 = await prisma.customer.create({
    data: {
      companyName: 'Gamma Enterprises',
      contactName: 'Richard Roe',
      email: 'richard@gamma.com',
      phone: '+1 (555) 012-7489',
      segmentId: highPotentialSegment.id
    }
  });

  const customer4 = await prisma.customer.create({
    data: {
      companyName: 'Delta Logistical',
      contactName: 'Alice Jones',
      email: 'alice@deltalog.com',
      phone: '+1 (555) 015-8833',
      segmentId: regularSegment.id
    }
  });

  const customer5 = await prisma.customer.create({
    data: {
      companyName: 'Epsilon Tech',
      contactName: 'David Vance',
      email: 'david@epsilon.com',
      phone: '+1 (555) 017-6644',
      segmentId: atRiskSegment.id
    }
  });

  const customer6 = await prisma.customer.create({
    data: {
      companyName: 'Zeta Solutions',
      contactName: 'Elena Rostova',
      email: 'elena@zeta.com',
      phone: '+1 (555) 019-5511',
      segmentId: lostSegment.id
    }
  });

  console.log('Created customer profiles.');

  // 4. Create Invoices (Transactions) associated with Customers
  await prisma.transaction.createMany({
    data: [
      { customerId: customer1.id, amount: 5000, status: 'PAID', paymentMethod: 'Wire Transfer', transactionDate: new Date('2026-06-13') },
      { customerId: customer1.id, amount: 12000, status: 'PAID', paymentMethod: 'ACH', transactionDate: new Date('2026-05-28') },
      { customerId: customer1.id, amount: 8000, status: 'PAID', paymentMethod: 'Wire Transfer', transactionDate: new Date('2026-05-10') },
      { customerId: customer1.id, amount: 20000, status: 'PAID', paymentMethod: 'ACH', transactionDate: new Date('2026-04-15') },
      
      { customerId: customer4.id, amount: 4500, status: 'OVERDUE', paymentMethod: 'Credit Card', transactionDate: new Date('2026-05-04') },
      { customerId: customer4.id, amount: 5500, status: 'PAID', paymentMethod: 'ACH', transactionDate: new Date('2026-04-12') },
      { customerId: customer4.id, amount: 2000, status: 'PAID', paymentMethod: 'Wire Transfer', transactionDate: new Date('2026-03-01') },

      { customerId: customer2.id, amount: 28000, status: 'PAID', paymentMethod: 'Wire Transfer', transactionDate: new Date('2026-06-06') },
      { customerId: customer3.id, amount: 15500, status: 'PENDING', paymentMethod: 'ACH', transactionDate: new Date('2026-05-21') },
      { customerId: customer5.id, amount: 9500, status: 'PENDING', paymentMethod: 'Credit Card', transactionDate: new Date('2026-03-18') },
      { customerId: customer6.id, amount: 1100, status: 'OVERDUE', paymentMethod: 'Wire Transfer', transactionDate: new Date('2026-01-20') }
    ]
  });

  console.log('Created transaction records logs.');

  // 5. Create Default AI Recommendations associated with Segments
  await prisma.recommendation.createMany({
    data: [
      {
        segmentId: vipSegment.id,
        strategyType: 'RETENTION',
        strategyContent: 'Assign personal accounts managers. Reward with exclusive 10% rebate options for settling invoices within 10 days.',
        promptVersion: 'V4 (JSON)'
      },
      {
        segmentId: regularSegment.id,
        strategyType: 'NURTURE',
        strategyContent: 'Enroll in standard update scripts. Promotes mid-tier subscription expansion packages.',
        promptVersion: 'V4 (JSON)'
      },
      {
        segmentId: atRiskSegment.id,
        strategyType: 'RECOVERY',
        strategyContent: 'Trigger personal re-engagement calls. Propose invoice division models (3-part splitting options) to settle pending debt.',
        promptVersion: 'V4 (JSON)'
      }
    ]
  });

  console.log('Created baseline AI recommendation strategies.');
  console.log('Database seeding operation completed successfully!');
}

main()
  .catch((e) => {
    console.error('Database Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

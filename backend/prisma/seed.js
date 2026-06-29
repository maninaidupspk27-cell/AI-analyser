const prisma = require('../src/config/db');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('Clearing database tables...');
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
      email: 'adminmanikanta@gmail.com',
      fullName: 'Manikanta Admin',
      role: 'ADMIN',
      passwordHash: passwordHashAdmin
    }
  });

  const salesUser = await prisma.user.create({
    data: {
      email: 'salesmanikanta@gmail.com',
      fullName: 'Sanjay Kumar (Sales)',
      role: 'SALES_MANAGER',
      passwordHash: passwordHashSales
    }
  });

  const basicUser = await prisma.user.create({
    data: {
      email: 'user@manikanta.com',
      fullName: 'Entry-Level Rep',
      role: 'USER',
      passwordHash: bcrypt.hashSync('user123', 10)
    }
  });

  console.log(`Created default user logins: Admin (${adminUser.email}), Sales (${salesUser.email}), Rep (${basicUser.email})`);

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
      id: 'C001',
      customerName: 'ABC Super Market',
      totalPurchases: 1500000,
      orders: 120,
      avgOrderValue: 12500,
      paymentDelayDays: 2,
      outstanding: 15000,
      repeatRate: 95,
      returns: 1,
      location: 'Hyderabad',
      segmentId: vipSegment.id
    }
  });

  const customer2 = await prisma.customer.create({
    data: {
      id: 'C002',
      customerName: 'XYZ Traders',
      totalPurchases: 800000,
      orders: 65,
      avgOrderValue: 12300,
      paymentDelayDays: 45,
      outstanding: 250000,
      repeatRate: 70,
      returns: 3,
      location: 'Vijayawada',
      segmentId: highPotentialSegment.id
    }
  });

  const customer3 = await prisma.customer.create({
    data: {
      id: 'C003',
      customerName: 'Fresh Mart',
      totalPurchases: 120000,
      orders: 8,
      avgOrderValue: 15000,
      paymentDelayDays: 5,
      outstanding: 10000,
      repeatRate: 40,
      returns: 0,
      location: 'Chennai',
      segmentId: regularSegment.id
    }
  });

  const customer4 = await prisma.customer.create({
    data: {
      id: 'C004',
      customerName: 'PQR Stores',
      totalPurchases: 90000,
      orders: 15,
      avgOrderValue: 6000,
      paymentDelayDays: 90,
      outstanding: 80000,
      repeatRate: 15,
      returns: 18,
      location: 'Hyderabad',
      segmentId: atRiskSegment.id
    }
  });

  const customer5 = await prisma.customer.create({
    data: {
      id: 'C005',
      customerName: 'Sai Distributors',
      totalPurchases: 450000,
      orders: 35,
      avgOrderValue: 12800,
      paymentDelayDays: 4,
      outstanding: 20000,
      repeatRate: 88,
      returns: 2,
      location: 'Bengaluru',
      segmentId: vipSegment.id
    }
  });

  console.log('Created customer profiles.');
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

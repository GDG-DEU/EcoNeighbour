import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import bcrypt from 'bcryptjs';

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'econeighbour_db',
});

const prisma = new PrismaClient({ adapter } as any);

const MONTHS = [
  { month: 1, year: 2025, periodStart: new Date('2025-01-01'), periodEnd: new Date('2025-01-31') },
  { month: 2, year: 2025, periodStart: new Date('2025-02-01'), periodEnd: new Date('2025-02-28') },
  { month: 3, year: 2025, periodStart: new Date('2025-03-01'), periodEnd: new Date('2025-03-31') },
];

const USER_DATA = [
  // Kadıköy
  { name: 'Ahmet Yılmaz', email: 'ahmet.yilmaz@example.com' },
  { name: 'Elif Kaya', email: 'elif.kaya@example.com' },
  { name: 'Murat Demir', email: 'murat.demir@example.com' },
  // Çankaya
  { name: 'Zeynep Çelik', email: 'zeynep.celik@example.com' },
  { name: 'Burak Şahin', email: 'burak.sahin@example.com' },
  { name: 'Ayşe Arslan', email: 'ayse.arslan@example.com' },
  // Konak
  { name: 'Emre Doğan', email: 'emre.dogan@example.com' },
  { name: 'Selin Yıldız', email: 'selin.yildiz@example.com' },
  { name: 'Kerem Aydın', email: 'kerem.aydin@example.com' },
];

// Deterministic pseudo-random to get consistent seed data
function fakeRandom(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  const r = x - Math.floor(x);
  return Math.round(min + r * (max - min));
}

async function main() {
  console.log('Seeding database...');

  // Clean existing seed data (optional — idempotent via upsert where possible)
  await prisma.notificationLog.deleteMany();
  await prisma.monthlyLeaderboard.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany({ where: { email: { endsWith: '@example.com' } } });
  await prisma.neighborhood.deleteMany({ where: { postalCode: { in: ['34710', '06690', '35250'] } } });

  // 1. Neighborhoods
  const neighborhoods = await Promise.all([
    prisma.neighborhood.create({ data: { name: 'Kadıköy', city: 'İstanbul', postalCode: '34710' } }),
    prisma.neighborhood.create({ data: { name: 'Çankaya', city: 'Ankara', postalCode: '06690' } }),
    prisma.neighborhood.create({ data: { name: 'Konak', city: 'İzmir', postalCode: '35250' } }),
  ]);

  console.log(`Created ${neighborhoods.length} neighborhoods`);

  // 2. Users
  const passwordHash = await bcrypt.hash('test1234', 10);

  const users = await Promise.all(
    USER_DATA.map((u, i) =>
      prisma.user.create({
        data: {
          name: u.name,
          email: u.email,
          passwordHash,
          neighborhoodId: neighborhoods[Math.floor(i / 3)].id,
          address: `${u.name.split(' ')[0]} Sok. No:${i + 1}`,
        },
      })
    )
  );

  console.log(`Created ${users.length} users`);

  // 3. Bills + 4. Leaderboard per user per month
  const leaderboardData: {
    userId: string;
    neighborhoodId: string;
    month: number;
    year: number;
    totalCo2Kg: number;
    treesSaved: number;
  }[] = [];

  for (const user of users) {
    const neighborhood = neighborhoods[Math.floor(users.indexOf(user) / 3)];

    for (const { month, year, periodStart, periodEnd } of MONTHS) {
      const seed = users.indexOf(user) * 100 + month;

      const elecUsage = fakeRandom(seed + 1, 150, 400);
      const gasUsage = fakeRandom(seed + 2, 30, 120);

      const elecCo2 = parseFloat((elecUsage * 0.42).toFixed(2));
      const gasCo2 = parseFloat((gasUsage * 2.04).toFixed(2));
      const elecTrees = parseFloat((elecCo2 / 21).toFixed(2));
      const gasTrees = parseFloat((gasCo2 / 21).toFixed(2));

      await prisma.bill.createMany({
        data: [
          {
            userId: user.id,
            type: 'ELECTRICITY',
            address: user.address ?? '',
            subscriberNumber: `E-${user.id.slice(0, 6)}-${month}`,
            periodStart,
            periodEnd,
            usage: elecUsage,
            co2Kg: elecCo2,
            treesSaved: elecTrees,
            month,
            year,
            isConfirmed: true,
          },
          {
            userId: user.id,
            type: 'GAS',
            address: user.address ?? '',
            subscriberNumber: `G-${user.id.slice(0, 6)}-${month}`,
            periodStart,
            periodEnd,
            usage: gasUsage,
            co2Kg: gasCo2,
            treesSaved: gasTrees,
            month,
            year,
            isConfirmed: true,
          },
        ],
      });

      leaderboardData.push({
        userId: user.id,
        neighborhoodId: neighborhood.id,
        month,
        year,
        totalCo2Kg: parseFloat((elecCo2 + gasCo2).toFixed(2)),
        treesSaved: parseFloat((elecTrees + gasTrees).toFixed(2)),
      });
    }
  }

  console.log(`Created bills for ${users.length} users × ${MONTHS.length} months × 2 types`);

  // 4. MonthlyLeaderboard with ranks
  for (const { month, year } of MONTHS) {
    const monthEntries = leaderboardData.filter(e => e.month === month && e.year === year);

    // Sort by co2Kg ascending (less is better)
    monthEntries.sort((a, b) => a.totalCo2Kg - b.totalCo2Kg);

    for (let i = 0; i < monthEntries.length; i++) {
      const entry = monthEntries[i];

      // neighborhood rank among same neighborhood
      const sameNeighborhood = monthEntries.filter(e => e.neighborhoodId === entry.neighborhoodId);
      const neighborhoodRank = sameNeighborhood.indexOf(entry) + 1;

      await prisma.monthlyLeaderboard.create({
        data: {
          userId: entry.userId,
          neighborhoodId: entry.neighborhoodId,
          month,
          year,
          totalCo2Kg: entry.totalCo2Kg,
          treesSaved: entry.treesSaved,
          rank: i + 1,
          neighborhoodRank,
        },
      });
    }
  }

  console.log(`Created leaderboard entries`);

  // 5. NotificationLog — bill reminders for first 4 users for Jan & Feb
  for (const user of users.slice(0, 4)) {
    for (const { month, year } of MONTHS.slice(0, 2)) {
      await prisma.notificationLog.create({
        data: {
          userId: user.id,
          type: 'BILL_REMINDER',
          month,
          year,
        },
      });
    }
  }

  console.log('Created notification logs');
  console.log('\nSeed complete! Test credentials:');
  console.log('  Email: ahmet.yilmaz@example.com');
  console.log('  Password: test1234');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

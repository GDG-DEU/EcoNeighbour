import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import billRoutes from './routes/bills';
import neighborhoodRoutes from './routes/neighborhoods';
import leaderboardRoutes from './routes/leaderboard';
import notificationRoutes from './routes/notifications';

export const prisma = new PrismaClient();

const app = express();
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json());

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/bills', billRoutes);
app.use('/api/v1/neighborhoods', neighborhoodRoutes);
app.use('/api/v1/leaderboard', leaderboardRoutes);
app.use('/api/v1/notifications', notificationRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// --- Push notification helper ---
async function sendPushNotifications(messages: { to: string; title: string; body: string }[]) {
  if (messages.length === 0) return;
  const chunks: typeof messages[] = [];
  for (let i = 0; i < messages.length; i += 100) chunks.push(messages.slice(i, i + 100));
  for (const chunk of chunks) {
    try {
      const resp = await axios.post('https://exp.host/--/api/v2/push/send', chunk, {
        headers: { 'Content-Type': 'application/json' },
      });
      // Remove invalid tokens
      const data: { data: { status: string; details?: { error?: string } }[] } = resp.data;
      for (let i = 0; i < chunk.length; i++) {
        if (data.data[i]?.details?.error === 'DeviceNotRegistered') {
          await prisma.user.updateMany({ where: { pushToken: chunk[i].to }, data: { pushToken: null } });
        }
      }
    } catch (err) {
      console.error('Push notification error:', err);
    }
  }
}

// --- Cron: Bill reminder — daily at 09:00 ---
cron.schedule('0 9 * * *', async () => {
  console.log('[CRON] Running bill reminder job');
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const currentDay = now.getDate();

  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  // Users who uploaded a bill on this day last month
  const prevMonthBills = await prisma.bill.findMany({
    where: {
      isConfirmed: true,
      month: prevMonth,
      year: prevYear,
      createdAt: {
        gte: new Date(prevYear, prevMonth - 1, currentDay, 0, 0, 0),
        lt: new Date(prevYear, prevMonth - 1, currentDay + 1, 0, 0, 0),
      },
    },
    include: { user: { select: { id: true, pushToken: true } } },
  });

  const messages: { to: string; title: string; body: string }[] = [];

  for (const bill of prevMonthBills) {
    if (!bill.user.pushToken) continue;

    // Check if already sent this month
    const alreadySent = await prisma.notificationLog.findUnique({
      where: { userId_type_month_year: { userId: bill.user.id, type: 'BILL_REMINDER', month: currentMonth, year: currentYear } },
    });
    if (alreadySent) continue;

    // Check if they already uploaded this month
    const alreadyUploaded = await prisma.bill.findFirst({
      where: { userId: bill.user.id, isConfirmed: true, month: currentMonth, year: currentYear },
    });
    if (alreadyUploaded) continue;

    messages.push({
      to: bill.user.pushToken,
      title: '💡 Fatura Zamanı!',
      body: 'Geçen ay bu günlerde faturanı yüklemiştin. Bu ayı da kaçırma!',
    });

    await prisma.notificationLog.create({
      data: { userId: bill.user.id, type: 'BILL_REMINDER', month: currentMonth, year: currentYear },
    });
  }

  await sendPushNotifications(messages);
  console.log(`[CRON] Bill reminders sent: ${messages.length}`);
});

// --- Cron: Leaderboard reset — 1st of every month at 00:00 ---
cron.schedule('0 0 1 * *', async () => {
  console.log('[CRON] Running leaderboard reset job');
  const now = new Date();
  const prevMonth = now.getMonth() === 0 ? 12 : now.getMonth();
  const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

  const neighborhoods = await prisma.neighborhood.findMany();

  for (const neighborhood of neighborhoods) {
    const userBills = await prisma.bill.groupBy({
      by: ['userId'],
      where: {
        user: { neighborhoodId: neighborhood.id },
        isConfirmed: true,
        month: prevMonth,
        year: prevYear,
      },
      _sum: { co2Kg: true, treesSaved: true },
    });

    if (userBills.length === 0) continue;

    userBills.sort((a, b) => (a._sum.co2Kg ?? 0) - (b._sum.co2Kg ?? 0));

    for (let i = 0; i < userBills.length; i++) {
      await prisma.monthlyLeaderboard.upsert({
        where: { userId_month_year: { userId: userBills[i].userId, month: prevMonth, year: prevYear } },
        update: {
          totalCo2Kg: userBills[i]._sum.co2Kg ?? 0,
          treesSaved: userBills[i]._sum.treesSaved ?? 0,
          rank: i + 1,
          neighborhoodId: neighborhood.id,
        },
        create: {
          userId: userBills[i].userId,
          neighborhoodId: neighborhood.id,
          month: prevMonth,
          year: prevYear,
          totalCo2Kg: userBills[i]._sum.co2Kg ?? 0,
          treesSaved: userBills[i]._sum.treesSaved ?? 0,
          rank: i + 1,
        },
      });
    }
  }

  // Rank neighborhoods globally by total trees saved
  const neighborhoodTotals = await prisma.monthlyLeaderboard.groupBy({
    by: ['neighborhoodId'],
    where: { month: prevMonth, year: prevYear },
    _sum: { treesSaved: true },
    orderBy: { _sum: { treesSaved: 'desc' } },
  });

  for (let i = 0; i < neighborhoodTotals.length; i++) {
    await prisma.monthlyLeaderboard.updateMany({
      where: { neighborhoodId: neighborhoodTotals[i].neighborhoodId, month: prevMonth, year: prevYear },
      data: { neighborhoodRank: i + 1 },
    });
  }

  console.log('[CRON] Leaderboard reset complete');
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = parseInt(process.env.PORT || '5000', 10);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

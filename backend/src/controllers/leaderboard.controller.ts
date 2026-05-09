import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../index';

function validateMonthYear(month: number, year: number): boolean {
  return !isNaN(month) && month >= 1 && month <= 12 && !isNaN(year) && year >= 2000;
}

type NeighborhoodResult = {
  neighborhoodId: string;
  name: string;
  city: string;
  totalTreesSaved: number;
  avgTreesSavedPerMember: number;
  memberCount: number;
};

export async function individualLeaderboard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const month = parseInt(String(req.params.month), 10);
    const year = parseInt(String(req.params.year), 10);

    if (!validateMonthYear(month, year)) {
      res.status(400).json({ error: 'month (1-12) and year (>=2000) must be valid integers' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user?.neighborhoodId) {
      res.status(400).json({ error: 'User has no neighborhood assigned' });
      return;
    }

    const now = new Date();
    const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();

    if (isCurrentMonth) {
      const bills = await prisma.bill.groupBy({
        by: ['userId'],
        where: {
          user: { neighborhoodId: user.neighborhoodId },
          isConfirmed: true,
          month,
          year,
        },
        _sum: { co2Kg: true, treesSaved: true },
        orderBy: { _sum: { co2Kg: 'asc' } },
      });

      const userIds = bills.map((b: (typeof bills)[number]) => b.userId);
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, avatarUrl: true },
      });
      const userMap = Object.fromEntries(users.map((u: (typeof users)[number]) => [u.id, u]));

      const ranked = bills.map((b: (typeof bills)[number], i: number) => ({
        rank: i + 1,
        userId: b.userId,
        name: userMap[b.userId]?.name ?? 'Unknown',
        avatarUrl: userMap[b.userId]?.avatarUrl ?? null,
        totalCo2Kg: b._sum.co2Kg ?? 0,
        treesSaved: b._sum.treesSaved ?? 0,
      }));

      res.json({ month, year, leaderboard: ranked });
      return;
    }

    const entries = await prisma.monthlyLeaderboard.findMany({
      where: { neighborhoodId: user.neighborhoodId, month, year },
      orderBy: { rank: 'asc' },
      include: { user: { select: { name: true, avatarUrl: true } } },
    });

    res.json({
      month,
      year,
      leaderboard: entries.map((e: (typeof entries)[number]) => ({
        rank: e.rank,
        userId: e.userId,
        name: e.user.name,
        avatarUrl: e.user.avatarUrl,
        totalCo2Kg: e.totalCo2Kg,
        treesSaved: e.treesSaved,
      })),
    });
  } catch (err) {
    console.error('individualLeaderboard error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function neighborhoodLeaderboard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const month = parseInt(String(req.params.month), 10);
    const year = parseInt(String(req.params.year), 10);

    if (!validateMonthYear(month, year)) {
      res.status(400).json({ error: 'month (1-12) and year (>=2000) must be valid integers' });
      return;
    }

    const now = new Date();
    const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();

    if (isCurrentMonth) {
      const neighborhoods = await prisma.neighborhood.findMany({ select: { id: true, name: true, city: true } });
      const results: NeighborhoodResult[] = await Promise.all(
        neighborhoods.map(async (n: (typeof neighborhoods)[number]) => {
          const stats = await prisma.bill.aggregate({
            where: { user: { neighborhoodId: n.id }, isConfirmed: true, month, year },
            _avg: { treesSaved: true },
            _sum: { treesSaved: true },
            _count: { id: true },
          });
          const memberCount = await prisma.user.count({ where: { neighborhoodId: n.id } });
          return {
            neighborhoodId: n.id,
            name: n.name,
            city: n.city,
            totalTreesSaved: stats._sum.treesSaved ?? 0,
            avgTreesSavedPerMember: memberCount > 0 ? (stats._sum.treesSaved ?? 0) / memberCount : 0,
            memberCount,
          };
        })
      );
      results.sort((a: NeighborhoodResult, b: NeighborhoodResult) => b.totalTreesSaved - a.totalTreesSaved);
      res.json({ month, year, leaderboard: results.map((r: NeighborhoodResult, i: number) => ({ ...r, rank: i + 1 })) });
      return;
    }

    const entries = await prisma.monthlyLeaderboard.findMany({
      where: { month, year },
      orderBy: { neighborhoodRank: 'asc' },
      include: { neighborhood: { select: { name: true, city: true } } },
    });

    // Fetch real member counts for each neighborhood
    const neighborhoodIds: string[] = Array.from(new Set(entries.map((e: (typeof entries)[number]) => e.neighborhoodId)));
    const memberCounts = await Promise.all(
      neighborhoodIds.map(async (nid: string) => ({
        id: nid,
        count: await prisma.user.count({ where: { neighborhoodId: nid } }),
      }))
    );
    const memberCountMap = Object.fromEntries(memberCounts.map((m: { id: string; count: number }) => [m.id, m.count]));

    const grouped: Record<string, { rank: number; name: string; city: string; totalTreesSaved: number; memberCount: number }> = {};
    for (const e of entries) {
      if (!grouped[e.neighborhoodId]) {
        grouped[e.neighborhoodId] = {
          rank: e.neighborhoodRank ?? 0,
          name: e.neighborhood.name,
          city: e.neighborhood.city,
          totalTreesSaved: 0,
          memberCount: memberCountMap[e.neighborhoodId] ?? 0,
        };
      }
      grouped[e.neighborhoodId].totalTreesSaved += e.treesSaved;
    }

    const list = Object.entries(grouped)
      .map(([id, v]: [string, { rank: number; name: string; city: string; totalTreesSaved: number; memberCount: number }]) => ({ neighborhoodId: id, ...v }))
      .sort((a, b) => a.rank - b.rank);

    res.json({ month, year, leaderboard: list });
  } catch (err) {
    console.error('neighborhoodLeaderboard error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../index';

export async function individualLeaderboard(req: AuthRequest, res: Response): Promise<void> {
  const month = parseInt(req.params.month, 10);
  const year = parseInt(req.params.year, 10);

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

    const userIds = bills.map((b) => b.userId);
    const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true, avatarUrl: true } });
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

    const ranked = bills.map((b, i) => ({
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
    leaderboard: entries.map((e) => ({
      rank: e.rank,
      userId: e.userId,
      name: e.user.name,
      avatarUrl: e.user.avatarUrl,
      totalCo2Kg: e.totalCo2Kg,
      treesSaved: e.treesSaved,
    })),
  });
}

export async function neighborhoodLeaderboard(req: AuthRequest, res: Response): Promise<void> {
  const month = parseInt(req.params.month, 10);
  const year = parseInt(req.params.year, 10);

  const now = new Date();
  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();

  if (isCurrentMonth) {
    const neighborhoods = await prisma.neighborhood.findMany({ select: { id: true, name: true, city: true } });
    const results = await Promise.all(
      neighborhoods.map(async (n) => {
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
    results.sort((a, b) => b.totalTreesSaved - a.totalTreesSaved);
    res.json({ month, year, leaderboard: results.map((r, i) => ({ ...r, rank: i + 1 })) });
    return;
  }

  const entries = await prisma.monthlyLeaderboard.findMany({
    where: { month, year },
    orderBy: { neighborhoodRank: 'asc' },
    include: { neighborhood: { select: { name: true, city: true } } },
  });

  const grouped: Record<string, { rank: number; name: string; city: string; totalTreesSaved: number; memberCount: number }> = {};
  for (const e of entries) {
    if (!grouped[e.neighborhoodId]) {
      grouped[e.neighborhoodId] = {
        rank: e.neighborhoodRank ?? 0,
        name: e.neighborhood.name,
        city: e.neighborhood.city,
        totalTreesSaved: 0,
        memberCount: 0,
      };
    }
    grouped[e.neighborhoodId].totalTreesSaved += e.treesSaved;
    grouped[e.neighborhoodId].memberCount++;
  }

  const list = Object.entries(grouped)
    .map(([id, v]) => ({ neighborhoodId: id, ...v }))
    .sort((a, b) => a.rank - b.rank);

  res.json({ month, year, leaderboard: list });
}

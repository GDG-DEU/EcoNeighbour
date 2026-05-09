import { Request, Response } from 'express';
import { prisma } from '../index';

export async function listNeighborhoods(_req: Request, res: Response): Promise<void> {
  const neighborhoods = await prisma.neighborhood.findMany({
    select: { id: true, name: true, city: true, postalCode: true },
    orderBy: { name: 'asc' },
  });
  res.json(neighborhoods);
}

export async function getNeighborhoodStats(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const month = parseInt(req.params.month, 10);
  const year = parseInt(req.params.year, 10);

  const neighborhood = await prisma.neighborhood.findUnique({ where: { id } });
  if (!neighborhood) { res.status(404).json({ error: 'Neighborhood not found' }); return; }

  const memberCount = await prisma.user.count({ where: { neighborhoodId: id } });

  const stats = await prisma.bill.aggregate({
    where: {
      user: { neighborhoodId: id },
      isConfirmed: true,
      month,
      year,
    },
    _avg: { co2Kg: true },
    _sum: { co2Kg: true, treesSaved: true },
    _count: { id: true },
  });

  res.json({
    neighborhood,
    memberCount,
    month,
    year,
    avgCo2Kg: stats._avg.co2Kg ?? 0,
    totalCo2Kg: stats._sum.co2Kg ?? 0,
    totalTreesSaved: stats._sum.treesSaved ?? 0,
    billCount: stats._count.id,
  });
}

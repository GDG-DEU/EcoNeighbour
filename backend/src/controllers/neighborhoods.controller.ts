import { Request, Response } from 'express';
import { prisma } from '../index';

export async function listNeighborhoods(_req: Request, res: Response): Promise<void> {
  try {
    const neighborhoods = await prisma.neighborhood.findMany({
      select: { id: true, name: true, city: true, postalCode: true },
      orderBy: { name: 'asc' },
    });
    res.json(neighborhoods);
  } catch (err) {
    console.error('listNeighborhoods error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getNeighborhoodStats(req: Request, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const monthParam = Array.isArray(req.params.month) ? req.params.month[0] : req.params.month;
    const yearParam = Array.isArray(req.params.year) ? req.params.year[0] : req.params.year;
    
    const month = parseInt(monthParam, 10);
    const year = parseInt(yearParam, 10);

    if (isNaN(month) || month < 1 || month > 12 || isNaN(year) || year < 2000) {
      res.status(400).json({ error: 'month (1-12) and year (>=2000) must be valid integers' });
      return;
    }

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
      _count: true,
    });

    res.json({
      neighborhood,
      memberCount,
      month,
      year,
      avgCo2Kg: stats._avg?.co2Kg ?? 0,
      totalCo2Kg: stats._sum?.co2Kg ?? 0,
      totalTreesSaved: stats._sum?.treesSaved ?? 0,
      billCount: stats._count,
    });
  } catch (err) {
    console.error('getNeighborhoodStats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

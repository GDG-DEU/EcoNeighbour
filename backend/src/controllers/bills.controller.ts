import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../index';
import axios from 'axios';
import { BillType } from '@prisma/client';
import { randomBytes } from 'crypto';

function toCo2(type: BillType, usage: number): number {
  return type === 'ELECTRICITY' ? usage * 0.233 : usage * 2.04;
}

function co2ToTrees(co2Saved: number): number {
  return co2Saved / 1.75;
}

const pendingExtractions = new Map<string, { data: ExtractedBill; expiresAt: number }>();

interface ExtractedBill {
  bill_type: 'ELECTRICITY' | 'GAS';
  address: string;
  subscriber_number: string;
  period_start: string;
  period_end: string;
  usage: number;
  usage_unit: string;
  confidence: number;
}

function generateTempId(): string {
  return randomBytes(16).toString('hex');
}

export async function uploadBill(req: AuthRequest, res: Response): Promise<void> {
  if (!req.file) {
    res.status(400).json({ error: 'Image file is required' });
    return;
  }

  const base64 = req.file.buffer.toString('base64');
  const mimeType = req.file.mimetype;

  try {
    const aiResponse = await axios.post<ExtractedBill>(
      `${process.env.AI_SERVICE_URL}/extract-bill`,
      { image: base64, mime_type: mimeType },
      {
        headers: { 'X-Internal-Key': process.env.AI_SERVICE_SECRET },
        timeout: 30000,
      }
    );

    const tempId = generateTempId();
    pendingExtractions.set(tempId, { data: aiResponse.data, expiresAt: Date.now() + 10 * 60 * 1000 });

    for (const [key, val] of pendingExtractions.entries()) {
      if (val.expiresAt < Date.now()) pendingExtractions.delete(key);
    }

    res.json({ tempId, extractedData: aiResponse.data });
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 422) {
      res.status(422).json(err.response.data);
      return;
    }
    console.error('AI service error:', err);
    res.status(502).json({ error: 'AI service unavailable. Please try again.' });
  }
}

export async function confirmBill(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { tempId, confirmedData } = req.body as {
      tempId?: string;
      confirmedData: {
        type: string;
        address: string;
        subscriberNumber: string;
        usage: number;
        periodStart: string;
        periodEnd: string;
      };
    };

    if (!confirmedData) {
      res.status(400).json({ error: 'confirmedData is required' });
      return;
    }

    // Validate type
    if (confirmedData.type !== 'ELECTRICITY' && confirmedData.type !== 'GAS') {
      res.status(400).json({ error: 'type must be ELECTRICITY or GAS' });
      return;
    }

    // Validate usage
    const usage = Number(confirmedData.usage);
    if (!Number.isFinite(usage) || usage <= 0) {
      res.status(400).json({ error: 'usage must be a positive number' });
      return;
    }

    // Validate dates
    const periodStart = new Date(confirmedData.periodStart);
    const periodEnd = new Date(confirmedData.periodEnd);
    if (isNaN(periodStart.getTime()) || isNaN(periodEnd.getTime())) {
      res.status(400).json({ error: 'periodStart and periodEnd must be valid dates' });
      return;
    }
    if (periodEnd <= periodStart) {
      res.status(400).json({ error: 'periodEnd must be after periodStart' });
      return;
    }

    if (tempId) pendingExtractions.delete(tempId);

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const month = periodEnd.getMonth() + 1;
    const year = periodEnd.getFullYear();
    const billType: BillType = confirmedData.type as BillType;
    const co2Kg = toCo2(billType, usage);

    // Calculate neighborhood average CO2 for same type/month/year
    let treesSaved: number | null = null;
    if (user.neighborhoodId) {
      const neighborhoodAvg = await prisma.bill.aggregate({
        where: {
          user: { neighborhoodId: user.neighborhoodId },
          type: billType,
          isConfirmed: true,
          month,
          year,
          userId: { not: user.id },
        },
        _avg: { co2Kg: true },
        _count: { id: true },
      });
      if (neighborhoodAvg._count.id > 0 && neighborhoodAvg._avg.co2Kg !== null) {
        const saved = co2ToTrees(neighborhoodAvg._avg.co2Kg - co2Kg);
        treesSaved = saved > 0 ? saved : null;
      }
    }

    // Previous month comparison
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevBill = await prisma.bill.findUnique({
      where: { userId_type_month_year: { userId: user.id, type: billType, month: prevMonth, year: prevYear } },
    });
    const prevMonthCo2 = prevBill?.co2Kg ?? null;
    const prevMonthTreesSaved =
      prevMonthCo2 !== null
        ? Math.max(0, co2ToTrees(prevMonthCo2 - co2Kg))
        : null;

    const existingBill = await prisma.bill.findUnique({
      where: { userId_type_month_year: { userId: user.id, type: billType, month, year } },
    });

    const bill = await prisma.bill.upsert({
      where: { userId_type_month_year: { userId: user.id, type: billType, month, year } },
      update: {
        address: confirmedData.address,
        subscriberNumber: confirmedData.subscriberNumber,
        periodStart,
        periodEnd,
        usage,
        co2Kg,
        treesSaved,
        isConfirmed: true,
      },
      create: {
        userId: user.id,
        type: billType,
        address: confirmedData.address,
        subscriberNumber: confirmedData.subscriberNumber,
        periodStart,
        periodEnd,
        usage,
        co2Kg,
        treesSaved,
        month,
        year,
        isConfirmed: true,
      },
    });

    const totalTreesSaved = await prisma.bill.aggregate({
      where: { userId: user.id, isConfirmed: true, treesSaved: { gt: 0 } },
      _sum: { treesSaved: true },
    });

    const statusCode = existingBill ? 200 : 201;
    res.status(statusCode).json({
      bill,
      feedback: {
        co2Kg,
        treesSavedVsNeighborhood: treesSaved,
        treesSavedVsPrevMonth: prevMonthTreesSaved,
        totalTreesSaved: totalTreesSaved._sum.treesSaved ?? 0,
      },
    });
  } catch (err) {
    console.error('confirmBill error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

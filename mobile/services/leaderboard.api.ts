import api from './api';
import type { LeaderboardEntry } from '@/types/api';

export async function getIndividualLeaderboard(
  month: number,
  year: number
): Promise<LeaderboardEntry[]> {
  const { data } = await api.get<LeaderboardEntry[]>(`/leaderboard/individual/${month}/${year}`);
  return data;
}

export interface NeighborhoodLeaderboardEntry {
  rank: number;
  neighborhood: { id: string; name: string; city: string };
  avgCo2Kg: number;
  totalTreesSaved: number;
  activeUsers: number;
}

export async function getNeighborhoodLeaderboard(
  month: number,
  year: number
): Promise<NeighborhoodLeaderboardEntry[]> {
  const { data } = await api.get<NeighborhoodLeaderboardEntry[]>(
    `/leaderboard/neighborhoods/${month}/${year}`
  );
  return data;
}

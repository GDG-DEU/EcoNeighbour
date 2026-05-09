import api from './api';
import type { Neighborhood, NeighborhoodStats } from '@/types/api';

export async function getNeighborhoods(): Promise<Neighborhood[]> {
  const { data } = await api.get<Neighborhood[]>('/neighborhoods');
  return data;
}

export async function getNeighborhoodStats(
  id: string,
  month: number,
  year: number
): Promise<NeighborhoodStats> {
  const { data } = await api.get<NeighborhoodStats>(`/neighborhoods/${id}/stats/${month}/${year}`);
  return data;
}

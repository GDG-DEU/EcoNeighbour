/**
 * API tipleri — tüm servislerde paylaşılan
 */

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  pushToken: string | null;
  neighborhoodId: string | null;
  neighborhood?: Neighborhood;
  totalTreesSaved: number;
  createdAt: string;
}

export interface Neighborhood {
  id: string;
  name: string;
  city: string;
  postalCode: string;
  createdAt: string;
}

export interface Bill {
  id: string;
  userId: string;
  type: 'ELECTRICITY' | 'GAS';
  rawImageUrl: string;
  address: string;
  subscriberNumber: string;
  periodStart: string;
  periodEnd: string;
  usage: number;
  co2Kg: number;
  treesSaved: number | null;
  month: number;
  year: number;
  isConfirmed: boolean;
}

export interface ExtractedBillData {
  bill_type: 'ELECTRICITY' | 'GAS';
  address: string;
  subscriber_number: string;
  period_start: string;
  period_end: string;
  usage: number;
  usage_unit: 'kWh' | 'm3';
  confidence: number;
}

export interface LeaderboardEntry {
  rank: number;
  neighborhoodRank: number;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  totalCo2Kg: number;
  treesSaved: number;
  isCurrentUser?: boolean;
}

export interface NeighborhoodStats {
  neighborhoodId: string;
  name: string;
  month: number;
  year: number;
  avgCo2Kg: number;
  totalTreesSaved: number;
  activeUsers: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

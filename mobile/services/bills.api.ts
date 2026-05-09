import api from './api';
import type { Bill, ExtractedBillData } from '@/types/api';

export async function uploadBill(formData: FormData): Promise<ExtractedBillData> {
  const { data } = await api.post<ExtractedBillData>('/bills/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000, // OCR işlemi uzun sürebilir
  });
  return data;
}

export async function confirmBill(payload: {
  bill_type: 'ELECTRICITY' | 'GAS';
  address: string;
  subscriber_number: string;
  period_start: string;
  period_end: string;
  usage: number;
  usage_unit: 'kWh' | 'm3';
  rawImageUrl?: string;
}): Promise<Bill> {
  const { data } = await api.post<Bill>('/bills/confirm', payload);
  return data;
}

export async function getMyBills(): Promise<Bill[]> {
  const { data } = await api.get<Bill[]>('/users/me/bills');
  return data;
}

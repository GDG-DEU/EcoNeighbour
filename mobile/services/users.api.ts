import api from './api';
import type { User } from '@/types/api';

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>('/users/me');
  return data;
}

export async function updateMe(payload: Partial<Pick<User, 'name' | 'avatarUrl'>>): Promise<User> {
  const { data } = await api.patch<User>('/users/me', payload);
  return data;
}

export async function savePushToken(pushToken: string): Promise<void> {
  await api.patch('/notifications/push-token', { pushToken });
}

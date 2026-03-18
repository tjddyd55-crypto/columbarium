import { api, ApiResponse } from './api';

export interface QueueEntry {
  id: string;
  unitId: string;
  unitCode: string;
  facilityName: string;
  userId: string;
  queuePosition: number;
  status: string;
  activatedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export async function getOperatorQueue(facilityId?: string): Promise<QueueEntry[]> {
  const { data } = await api.get<ApiResponse<QueueEntry[]>>('/operator/queue', {
    params: facilityId ? { facilityId } : {},
  });
  if (!data.success || !data.data) return [];
  return data.data;
}

import { api } from './api';
import type { ApiResponse } from '../types/api';
import type { QueueEntry } from '../types/api';

export const queueApi = {
  async getMy(): Promise<QueueEntry[]> {
    const { data } = await api.get<ApiResponse<QueueEntry[]>>('/queue/my');
    if (!data.success || !data.data) return [];
    return data.data;
  },

  async getById(id: string): Promise<QueueEntry> {
    const { data } = await api.get<ApiResponse<QueueEntry>>(`/queue/${id}`);
    if (!data.success || !data.data) throw new Error(data.error?.message ?? '대기열 정보를 불러올 수 없습니다.');
    return data.data;
  },

  async join(unitId: string): Promise<{ id: string; unitCode: string; facilityName: string; queuePosition: number; status: string }> {
    const { data } = await api.post<ApiResponse<{ id: string; unitCode: string; facilityName: string; queuePosition: number; status: string }>>('/queue/join', { unitId });
    if (!data.success || !data.data) throw new Error(data.error?.message ?? '대기열 참여에 실패했습니다.');
    return data.data;
  },

  async cancel(id: string): Promise<void> {
    const { data } = await api.post<ApiResponse<{ cancelled: boolean }>>(`/queue/${id}/cancel`);
    if (!data.success) throw new Error(data.error?.message ?? '취소에 실패했습니다.');
  },
};

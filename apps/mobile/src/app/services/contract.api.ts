import { api } from './api';
import type { ApiResponse } from '../types/api';
import type { Contract } from '../types/api';

export const contractApi = {
  async getMy(): Promise<Contract[]> {
    const { data } = await api.get<ApiResponse<Contract[]>>('/contracts/my');
    if (!data.success || !data.data) return [];
    return data.data;
  },

  async getById(id: string): Promise<Contract> {
    const { data } = await api.get<ApiResponse<Contract>>(`/contracts/${id}`);
    if (!data.success || !data.data) throw new Error(data.error?.message ?? '계약 정보를 불러올 수 없습니다.');
    return data.data;
  },

  async create(payload: { unitId: string; queueEntryId: string }): Promise<Contract> {
    const { data } = await api.post<ApiResponse<Contract>>('/contracts', payload);
    if (!data.success || !data.data) throw new Error(data.error?.message ?? '계약 생성에 실패했습니다.');
    return data.data;
  },
};

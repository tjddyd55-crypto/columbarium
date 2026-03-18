import { api } from './api';
import type { ApiResponse } from '../types/api';
import type { Facility, Unit } from '../types/api';

export const facilityApi = {
  async getList(operatorId?: string): Promise<Facility[]> {
    const { data } = await api.get<ApiResponse<Facility[]>>('/facilities', {
      params: operatorId ? { operatorId } : undefined,
    });
    if (!data.success || !data.data) return [];
    return data.data;
  },

  async getById(id: string): Promise<Facility> {
    const { data } = await api.get<ApiResponse<Facility>>(`/facilities/${id}`);
    if (!data.success || !data.data) throw new Error(data.error?.message ?? '시설 정보를 불러올 수 없습니다.');
    return data.data;
  },

  async getUnits(facilityId: string): Promise<Unit[]> {
    const { data } = await api.get<ApiResponse<Unit[]>>(`/facilities/${facilityId}/units`);
    if (!data.success || !data.data) return [];
    return data.data;
  },
};

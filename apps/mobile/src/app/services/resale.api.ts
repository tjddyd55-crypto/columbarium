import { api } from './api';
import type { ApiResponse } from '../types/api';
import type { ResaleListing } from '../types/api';

export const resaleApi = {
  async getMy(): Promise<ResaleListing[]> {
    const { data } = await api.get<ApiResponse<ResaleListing[]>>('/resale/my');
    if (!data.success || !data.data) return [];
    return data.data;
  },

  async getListings(): Promise<ResaleListing[]> {
    const { data } = await api.get<ApiResponse<ResaleListing[]>>('/resale/listings');
    if (!data.success || !data.data) return [];
    return data.data;
  },

  async request(contractId: string, price: number): Promise<ResaleListing> {
    const { data } = await api.post<ApiResponse<ResaleListing>>('/resale', { contractId, price });
    if (!data.success || !data.data) throw new Error(data.error?.message ?? '재판매 신청에 실패했습니다.');
    return data.data;
  },

  async buy(resaleId: string): Promise<{ contractId: string; contractNo: string }> {
    const { data } = await api.post<ApiResponse<{ contractId: string; contractNo: string }>>(`/resale/${resaleId}/buy`);
    if (!data.success || !data.data) throw new Error(data.error?.message ?? '구매에 실패했습니다.');
    return data.data;
  },
};

import { api, ApiResponse } from './api';

export interface ResaleListing {
  id: string;
  unitId: string;
  unitCode: string;
  facilityName: string;
  sellerUserId: string;
  askingPrice: number;
  status: string;
  createdAt: string;
}

export async function getOperatorResaleList(status?: string): Promise<ResaleListing[]> {
  const { data } = await api.get<ApiResponse<ResaleListing[]>>('/operator/resale', { params: status ? { status } : {} });
  if (!data.success || !data.data) return [];
  return data.data;
}

export async function approveResale(id: string, operatorId: string): Promise<void> {
  const { data } = await api.post<ApiResponse<unknown>>(`/resale/${id}/approve`, { operatorId });
  if (!data.success) throw new Error(data.error?.message ?? '승인 실패');
}

export async function rejectResale(id: string, operatorId: string): Promise<void> {
  const { data } = await api.post<ApiResponse<unknown>>(`/resale/${id}/reject`, { operatorId });
  if (!data.success) throw new Error(data.error?.message ?? '반려 실패');
}

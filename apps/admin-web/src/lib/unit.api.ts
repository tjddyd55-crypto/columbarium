import { api, ApiResponse } from './api';

export interface Unit {
  id: string;
  unitCode: string;
  rowCode: string;
  colNo: number;
  x: number;
  y: number;
  width: number;
  height: number;
  status: string;
  basePrice: number;
  preSalePrice?: number;
  contractYears: number;
}

export interface BulkCreateUnitsPayload {
  facilityId: string;
  units: Array<{
    rowCode: string;
    colNo: number;
    unitCode: string;
    x: number;
    y: number;
    width: number;
    height: number;
    basePrice: number;
    preSalePrice?: number;
    contractYears?: number;
  }>;
}

export async function getUnits(facilityId: string): Promise<Unit[]> {
  const { data } = await api.get<ApiResponse<Unit[]>>(`/facilities/${facilityId}/units`);
  if (!data.success || !data.data) return [];
  return data.data;
}

export async function bulkCreateUnits(payload: BulkCreateUnitsPayload): Promise<{ count: number }> {
  const { data } = await api.post<ApiResponse<{ count: number }>>('/operator/units/bulk', payload);
  if (!data.success || !data.data) throw new Error(data.error?.message ?? '칸 일괄 생성 실패');
  return data.data;
}

export async function updateUnit(id: string, payload: Partial<{ status: string; basePrice: number; preSalePrice: number }>): Promise<Unit> {
  const { data } = await api.patch<ApiResponse<Unit>>(`/operator/units/${id}`, payload);
  if (!data.success || !data.data) throw new Error(data.error?.message ?? '수정 실패');
  return data.data;
}

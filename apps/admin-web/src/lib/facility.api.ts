import { api, ApiResponse } from './api';

export interface Facility {
  id: string;
  name: string;
  description?: string;
  phone?: string;
  addressRoad?: string;
  addressJibun?: string;
  addressDetail?: string;
  postalCode?: string;
  lat?: number;
  lng?: number;
  operatorId: string;
  operatorName?: string;
  status: string;
}

export interface CreateFacilityPayload {
  name: string;
  description?: string;
  phone?: string;
  addressRoad: string;
  addressJibun?: string;
  addressDetail?: string;
  postalCode?: string;
  lat?: number;
  lng?: number;
}

export async function getFacilities(operatorId?: string): Promise<Facility[]> {
  const { data } = await api.get<ApiResponse<Facility[]>>('/facilities', { params: operatorId ? { operatorId } : {} });
  if (!data.success || !data.data) return [];
  return data.data;
}

export async function getOperatorFacilities(): Promise<Facility[]> {
  const { data } = await api.get<ApiResponse<Facility[]>>('/operator/facilities');
  if (!data.success || !data.data) return [];
  return data.data;
}

export async function getFacilityById(id: string): Promise<Facility> {
  const { data } = await api.get<ApiResponse<Facility>>(`/facilities/${id}`);
  if (!data.success || !data.data) throw new Error(data.error?.message ?? '시설 조회 실패');
  return data.data;
}

export async function createFacility(payload: CreateFacilityPayload): Promise<Facility> {
  const { data } = await api.post<ApiResponse<Facility>>('/operator/facilities', payload);
  if (!data.success || !data.data) throw new Error(data.error?.message ?? '시설 생성 실패');
  return data.data;
}

export async function updateFacility(id: string, payload: Partial<CreateFacilityPayload>): Promise<Facility> {
  const { data } = await api.patch<ApiResponse<Facility>>(`/operator/facilities/${id}`, payload);
  if (!data.success || !data.data) throw new Error(data.error?.message ?? '수정 실패');
  return data.data;
}

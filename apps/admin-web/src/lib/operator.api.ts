import { api, ApiResponse } from './api';

export interface Operator {
  id: string;
  name: string;
  businessNo: string;
  representativeName?: string;
  contactPhone?: string;
  contactEmail?: string;
  addressRoad?: string;
  addressDetail?: string;
  postalCode?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOperatorPayload {
  name: string;
  businessNo: string;
  representativeName?: string;
  contactPhone?: string;
  contactEmail?: string;
  addressRoad?: string;
  addressDetail?: string;
  postalCode?: string;
}

export async function getOperators(): Promise<Operator[]> {
  const { data } = await api.get<ApiResponse<Operator[]>>('/admin/operators');
  if (!data.success || !data.data) return [];
  return data.data;
}

export async function createOperator(payload: CreateOperatorPayload): Promise<Operator> {
  const { data } = await api.post<ApiResponse<Operator>>('/admin/operators', payload);
  if (!data.success || !data.data) throw new Error(data.error?.message ?? '사업자 생성 실패');
  return data.data;
}

export async function updateOperator(id: string, payload: Partial<CreateOperatorPayload> & { status?: string }): Promise<Operator> {
  const { data } = await api.patch<ApiResponse<Operator>>(`/admin/operators/${id}`, payload);
  if (!data.success || !data.data) throw new Error(data.error?.message ?? '수정 실패');
  return data.data;
}

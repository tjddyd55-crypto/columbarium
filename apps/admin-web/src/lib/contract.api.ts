import { api, ApiResponse } from './api';

export interface Contract {
  id: string;
  contractNo: string;
  unitId: string;
  unitCode: string;
  facilityName: string;
  buyerUserId: string;
  status: string;
  contractType: string;
  finalPrice: number;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export async function getOperatorContracts(filters?: { facilityId?: string; status?: string }): Promise<Contract[]> {
  const { data } = await api.get<ApiResponse<Contract[]>>('/operator/contracts', { params: filters ?? {} });
  if (!data.success || !data.data) return [];
  return data.data;
}

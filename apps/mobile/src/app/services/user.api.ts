import { api } from './api';
import type { ApiResponse } from '../types/api';

export interface MeResponse {
  id: string;
  login_id: string;
  name: string;
  birthDate: string;
  phone: string;
  email?: string;
  addressRoad?: string;
  addressDetail?: string;
  postalCode?: string;
  status: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export const userApi = {
  async getMe(): Promise<MeResponse> {
    const { data } = await api.get<ApiResponse<MeResponse>>('/users/me');
    if (!data.success || !data.data) throw new Error(data.error?.message ?? '회원 정보를 불러올 수 없습니다.');
    return data.data;
  },
};

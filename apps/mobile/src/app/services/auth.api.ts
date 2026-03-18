import { api, getApiError } from './api';
import type { ApiResponse } from '../types/api';
import type { AuthResult } from '../types/api';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface SignupPayload {
  username: string;
  password: string;
  name: string;
  birthDate: string;
  phone: string;
  email?: string;
  addressRoad?: string;
  addressDetail?: string;
  postalCode?: string;
}

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthResult> {
    const { data } = await api.post<ApiResponse<AuthResult>>('/auth/login', payload);
    if (!data.success || !data.data) throw new Error(data.error?.message ?? '로그인 실패');
    return data.data;
  },

  async signup(payload: SignupPayload): Promise<AuthResult> {
    const { data } = await api.post<ApiResponse<AuthResult>>('/auth/signup', payload);
    if (!data.success || !data.data) throw new Error(data.error?.message ?? '회원가입 실패');
    return data.data;
  },
};

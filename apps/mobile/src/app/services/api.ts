import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { useAuthStore } from '../store/authStore';
import type { ApiResponse } from '../types/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<ApiResponse<unknown>>) => {
    const status = err.response?.status;
    const data = err.response?.data;
    const message = data?.error?.message ?? err.message ?? '네트워크 오류';
    if (status === 401) useAuthStore.getState().logout();
    return Promise.reject({ message, code: data?.error?.code, status });
  }
);

export function getApiError(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) return String((err as { message: string }).message);
  return '오류가 발생했습니다.';
}

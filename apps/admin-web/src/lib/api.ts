import axios, { AxiosError } from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window === 'undefined') return config;
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ success?: boolean; error?: { code: string; message: string } }>) => {
    const status = err.response?.status;
    const message = err.response?.data?.error?.message ?? err.message ?? '네트워크 오류';
    if (status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject({ message, code: err.response?.data?.error?.code, status });
  }
);

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
}

export function getApiError(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) return String((err as { message: string }).message);
  return '오류가 발생했습니다.';
}

import { api, ApiResponse } from './api';
import type { AuthUser } from './auth';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  user: { id: string; username: string; role: string };
}

export async function login(payload: LoginPayload): Promise<{ token: string; user: AuthUser }> {
  const { data } = await api.post<ApiResponse<LoginResult>>('/auth/login', payload);
  if (!data.success || !data.data) throw new Error(data.error?.message ?? '로그인 실패');
  const user: AuthUser = { id: data.data.user.id, username: data.data.user.username, role: data.data.user.role };
  return { token: data.data.accessToken, user };
}

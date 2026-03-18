import { api, ApiResponse } from './api';

export interface UserListItem {
  id: string;
  username: string;
  name: string;
  phone: string;
  email?: string;
  status: string;
  role: string;
  createdAt: string;
}

export async function getAdminUsers(): Promise<UserListItem[]> {
  const { data } = await api.get<ApiResponse<UserListItem[]>>('/admin/users');
  if (!data.success || !data.data) return [];
  return data.data;
}

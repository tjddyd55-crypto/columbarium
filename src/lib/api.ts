const API_BASE = (import.meta.env.VITE_API_URL as string) || '';
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setAuthStorage(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthStorage(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export type AuthUser = { id: string; login_id: string; name: string; role: string };
export type AuthResponse = { token: string; user: AuthUser };

// All paths are relative /api/... (proxied to backend in dev)
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: HeadersInit = { 'Content-Type': 'application/json', ...options?.headers };
  const token = getStoredToken();
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error || res.statusText);
  }
  return res.json();
}

export const api = {
  auth: {
    signup: (body: {
      login_id: string;
      password: string;
      name: string;
      birth_date?: string;
      phone: string;
      email?: string;
      address?: string;
    }) => request<AuthResponse>('/api/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
    login: (body: { login_id: string; password: string }) =>
      request<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  },
  waitlist: {
    create: (body: { seat_id: string; user_name?: string; user_phone?: string }) =>
      request<{ id: string }>('/api/waitlist', { method: 'POST', body: JSON.stringify(body) }),
    list: () => request<WaitlistRow[]>('/api/waitlist'),
    count: (seatId: string) => request<{ count: number }>(`/api/waitlist/${seatId}`),
    activate: (id: string) => request<{ ok: boolean }>(`/api/waitlist/${id}/activate`, { method: 'PATCH' }),
  },
  contracts: {
    create: (body: { seat_id: string; waitlist_id?: string; user_name?: string; price?: number }) =>
      request<{ id: string }>('/api/contracts', { method: 'POST', body: JSON.stringify(body) }),
    list: () => request<ContractRow[]>('/api/contracts'),
    hasActive: (seatId: string) => request<{ hasActive: boolean }>(`/api/contracts/${seatId}`),
    activate: (id: string) => request<{ ok: boolean }>(`/api/contracts/${id}/activate`, { method: 'PATCH' }),
  },
  seats: {
    status: (seatId: string) =>
      request<{ status: 'ACTIVE' | 'WAITING' | 'AVAILABLE'; waitingCount: number }>(`/api/seats/${seatId}/status`),
  },
  facilities: {
    list: () => request<FacilityRow[]>('/api/facilities'),
    get: (id: string) => request<FacilityRow>(`/api/facilities/${id}`),
    getSeats: (id: string) => request<{ seat_id: string; code: string | null }[]>(`/api/facilities/${id}/seats`),
  },
  my: {
    waitlist: () => request<WaitlistRow[]>('/api/my/waitlist'),
    contracts: () => request<ContractRow[]>('/api/my/contracts'),
  },
};

export type FacilityRow = {
  id: string;
  name: string;
  address: string | null;
  price_from: number | null;
  image_url: string | null;
};

export type WaitlistRow = {
  id: string;
  seat_id: string;
  user_name: string | null;
  user_phone: string | null;
  status: string;
  created_at: string;
};

export type ContractRow = {
  id: string;
  seat_id: string;
  user_name: string | null;
  price: number | null;
  status: string;
  created_at: string;
};

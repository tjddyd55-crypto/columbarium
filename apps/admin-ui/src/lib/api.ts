/** NestJS core-api 주소. 로컬 개발 시 비우면 Vite proxy(/api → localhost:4000) 사용 */
const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || '';
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

export type AuthUser = { id: string; login_id?: string; name?: string; email?: string; role: string };
export type AuthResponse = { accessToken?: string; token?: string; user: AuthUser };
type ApiEnvelope<T> =
  | { success: true; data: T; error?: null; message?: string }
  | { success: false; data?: null; error?: { code?: string; message?: string }; message?: string };

function isApiEnvelope(value: unknown): value is ApiEnvelope<unknown> {
  return !!value && typeof value === 'object' && 'success' in value;
}

function unwrapSuccessEnvelope<T>(value: unknown): T {
  let current: unknown = value;
  for (let i = 0; i < 3; i += 1) {
    if (!isApiEnvelope(current)) break;
    if (current.success === false) {
      throw new Error(current.error?.message || current.message || 'Request failed');
    }
    current = current.data;
  }
  return current as T;
}

// All paths are relative /api/... (proxied to backend in dev)
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: HeadersInit = { 'Content-Type': 'application/json', ...options?.headers };
  const token = getStoredToken();
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const body: unknown = await res.json().catch(() => null);
  const envelope = body as ApiEnvelope<T> | null;
  const isEnvelope = isApiEnvelope(envelope);

  if (!res.ok || (isEnvelope && envelope.success === false)) {
    const message =
      (isEnvelope && envelope.error?.message) ||
      (isEnvelope && envelope.message) ||
      ((body as { error?: string } | null)?.error) ||
      res.statusText ||
      'Request failed';
    throw new Error(message);
  }

  if (isEnvelope && envelope.success === true) {
    return unwrapSuccessEnvelope<T>(envelope.data);
  }
  return unwrapSuccessEnvelope<T>(body);
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

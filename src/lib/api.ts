const API = (import.meta.env.VITE_API_URL as string) || '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error || res.statusText);
  }
  return res.json();
}

export const api = {
  waitlist: {
    create: (body: { seat_id: string; user_name?: string; user_phone?: string }) =>
      request<{ id: string }>('/api/waitlist', { method: 'POST', body: JSON.stringify(body) }),
    list: () => request<WaitlistRow[]>('/api/waitlist'),
    count: (seatId: string) => request<{ count: number }>(`/api/waitlist/${seatId}`),
    activate: (id: string) => request<{ ok: boolean }>(`/api/waitlist/${id}/activate`, { method: 'PATCH' }),
  },
  contracts: {
    create: (body: { seat_id: string; user_name?: string; price?: number }) =>
      request<{ id: string }>('/api/contracts', { method: 'POST', body: JSON.stringify(body) }),
    list: () => request<ContractRow[]>('/api/contracts'),
    hasActive: (seatId: string) => request<{ hasActive: boolean }>(`/api/contracts/${seatId}`),
    activate: (id: string) => request<{ ok: boolean }>(`/api/contracts/${id}/activate`, { method: 'PATCH' }),
  },
  seats: {
    status: (seatId: string) =>
      request<{ status: 'ACTIVE' | 'WAITING' | 'AVAILABLE'; waitingCount: number }>(`/api/seats/${seatId}/status`),
  },
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

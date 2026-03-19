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

export type AuthUser = {
  id: string;
  login_id?: string;
  name?: string;
  email?: string;
  role: string;
  roles?: string[];
  companyId?: string;
  operatorId?: string;
  /** true면 비밀번호 변경 전까지 일반 API 사용 불가 */
  mustChangePassword?: boolean;
};
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
    /** ADMIN/SUPER_ADMIN 전용 — 그 외 역할은 403 */
    adminLogin: (body: { login_id: string; password: string }) =>
      request<AuthResponse>('/api/auth/admin-login', { method: 'POST', body: JSON.stringify(body) }),
    changePassword: (body: { current_password: string; new_password: string }) =>
      request<AuthResponse>('/api/auth/change-password', { method: 'POST', body: JSON.stringify(body) }),
  },
  adminAuth: {
    resetPassword: (body: { userId: string; newPassword: string }) =>
      request<{ ok: boolean; userId: string }>('/admin/reset-password', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
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

  // 시설/좌석 정책 흐름 (admin)
  adminSite: {
    getCompanies: () => request<CompanyRow[]>('/admin/companies'),
    getFacilities: () => request<SiteFacilityRow[]>('/admin/facilities'),
    getSections: (facilityId: string) => request<SectionRow[]>(`/admin/facilities/${facilityId}/sections`),
    getSeats: (sectionId: string) => request<AdminSeatRow[]>(`/admin/sections/${sectionId}/seats`),
    getPolicy: (facilityId: string) => request<PolicyRow | null>(`/admin/facilities/${facilityId}/policy`),
    createCompany: (body: { name: string }) => request<CompanyRow>('/admin/company', { method: 'POST', body: JSON.stringify(body) }),
    createFacility: (body: { name: string; address: string; companyId: number }) =>
      request<SiteFacilityRow>('/admin/facility', { method: 'POST', body: JSON.stringify(body) }),
    createSection: (body: { facilityId: number; name: string; rows: number; cols: number }) =>
      request<SectionCreatedRow>('/admin/section', { method: 'POST', body: JSON.stringify(body) }),
    updateSeatPrice: (seatId: string, price: number) =>
      request<{ id: string; price: number }>(`/admin/seat/${seatId}`, { method: 'PATCH', body: JSON.stringify({ price }) }),
    blockSeat: (seatId: string, isBlocked: boolean) =>
      request<{ id: string; isBlocked: boolean }>(`/admin/seat/${seatId}/block`, { method: 'PATCH', body: JSON.stringify({ isBlocked }) }),
    upsertPolicy: (body: { facilityId: number; maxWaiting?: number; maxYears?: number }) =>
      request<PolicyRow>('/admin/policy', { method: 'POST', body: JSON.stringify(body) }),
  },
  dashboard: {
    summary: () => request<DashboardSummary>('/dashboard/summary'),
  },
  /** 사업자(Company) 단위 포털 — 응답은 항상 해당 companyId 로 스코프됨 */
  companyPortal: {
    detail: (companyId: string) => request<CompanyPortalDetail>(`/admin/companies/${companyId}`),
    facilities: (companyId: string) =>
      request<SiteFacilityRow[]>(`/admin/companies/${companyId}/facilities`),
    createFacility: (
      companyId: string,
      body: {
        name: string;
        address: string;
        floors?: { name: string; rows: number; cols: number }[];
      },
    ) =>
      request<SiteFacilityRow>(`/admin/companies/${companyId}/facilities`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    reservations: (companyId: string, status?: string) => {
      const q = status ? `?status=${encodeURIComponent(status)}` : '';
      return request<CompanyPortalReservationRow[]>(`/admin/companies/${companyId}/reservations${q}`);
    },
    resales: (companyId: string) =>
      request<CompanyPortalResaleRow[]>(`/admin/companies/${companyId}/resales`),
    agents: (companyId: string) => request<AgentRow[]>(`/admin/companies/${companyId}/agents`),
  },
  agents: {
    list: () => request<AgentRow[]>('/admin/agents'),
    create: (body: { userId: string; companyId: string; name: string; commissionRate: number; code?: string }) =>
      request<AgentRow>('/admin/agents', { method: 'POST', body: JSON.stringify(body) }),
  },
  operatorScope: {
    myFacilities: () => request<SiteFacilityRow[]>('/admin/me/facilities'),
    createFacility: (body: { name: string; address: string }) =>
      request<SiteFacilityRow>('/admin/me/facility', { method: 'POST', body: JSON.stringify(body) }),
    getSections: (facilityId: string) => request<SectionRow[]>(`/admin/me/facilities/${facilityId}/sections`),
    getSeats: (sectionId: string) => request<AdminSeatRow[]>(`/admin/me/sections/${sectionId}/seats`),
    getPolicy: (facilityId: string) => request<PolicyRow | null>(`/admin/me/facilities/${facilityId}/policy`),
    createSection: (body: { facilityId: number; name: string; rows: number; cols: number }) =>
      request<SectionCreatedRow>('/admin/me/section', { method: 'POST', body: JSON.stringify(body) }),
    updateSeatPrice: (seatId: string, price: number) =>
      request<{ id: string; price: number }>(`/admin/me/seat/${seatId}`, { method: 'PATCH', body: JSON.stringify({ price }) }),
    blockSeat: (seatId: string, isBlocked: boolean) =>
      request<{ id: string; isBlocked: boolean }>(`/admin/me/seat/${seatId}/block`, {
        method: 'PATCH',
        body: JSON.stringify({ isBlocked }),
      }),
    upsertPolicy: (body: { facilityId: number; maxWaiting?: number; maxYears?: number }) =>
      request<PolicyRow>('/admin/me/policy', { method: 'POST', body: JSON.stringify(body) }),
  },
  onboarding: {
    companyWithOperator: (body: {
      companyName: string;
      operatorLoginId: string;
      operatorPassword?: string;
      operatorName: string;
      operatorPhone: string;
      operatorBirthDate?: string;
    }) =>
      request<CompanyOperatorOnboarded>('/admin/onboarding/company-with-operator', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    agentUser: (body: {
      companyId: string;
      loginId: string;
      password?: string;
      userName: string;
      phone: string;
      birthDate?: string;
      agentDisplayName: string;
      commissionRate: number;
    }) =>
      request<AgentUserOnboarded>('/admin/onboarding/agent-user', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },
};

export type CompanyRow = {
  id: string;
  name: string;
  businessNo?: string | null;
  status?: string;
  createdAt: string;
};

export type CompanyPortalDetail = {
  id: string;
  name: string;
  businessNo: string | null;
  status: string;
  createdAt: string;
};

export type CompanyPortalReservationRow = {
  id: string;
  status: string;
  seatId: string;
  facilityId: string;
  facilityName: string;
  sectionName: string;
  row: number;
  col: number;
  displayCode: string;
  price: number;
  queueOrder: number | null;
  createdAt: string;
  userName: string;
  userLoginId: string;
  userPhone: string;
};

export type CompanyPortalResaleRow = {
  id: string;
  reservationId: string;
  status: string;
  pricingType: string;
  price: number | null;
  createdAt: string;
  facilityName: string;
  displayCode: string;
};
export type SiteFacilityRow = {
  id: string;
  name: string;
  address: string;
  companyId: string;
  companyName: string;
  createdAt: string;
  /** 구역(Section) 개수 — 시설 목록 표시용 */
  sectionCount?: number;
};
export type SectionRow = { id: string; facilityId: string; name: string; rows: number; cols: number; seatCount: number; createdAt: string };
export type SectionCreatedRow = SectionRow & { seatCount: number };
/** 관리자 좌석 그리드 색상 (백엔드 getSeatsBySection — status === uiStatus) */
export type AdminSeatUiStatus = 'AVAILABLE' | 'WAITING' | 'BLOCKED' | 'SOLD';

export type AdminSeatRow = {
  id: string;
  sectionId: string;
  row: number;
  col: number;
  price: number;
  isBlocked: boolean;
  /** 표시 코드 (예: 1열 → 101) */
  displayCode: string;
  /** API 명세용 코드 (없으면 displayCode 와 동일) */
  code?: string;
  /** 그리드 범례·색상과 동일한 통합 상태 (없으면 uiStatus) */
  status?: AdminSeatUiStatus;
  uiStatus: AdminSeatUiStatus;
  reservationStatus: string | null;
  reservationId: string | null;
};
export type PolicyRow = { id: string; facilityId: string; maxWaiting: number | null; maxYears: number | null };

export type CompanyOperatorOnboarded = {
  company: { id: string; name: string; createdAt: string };
  operatorAccount: { userId: string; loginId: string; initialPassword: string };
};

export type AgentUserOnboarded = {
  agent: { id: string; code: string; name: string; commissionRate: number; companyId: string };
  agentAccount: { userId: string; loginId: string; initialPassword: string };
};

export type DashboardSummary =
  | {
      view: 'ADMIN';
      companyCount: number;
      siteCount: number;
      confirmedReservationCount: number;
      pendingCommissionCount: number;
    }
  | {
      view: 'OPERATOR';
      companyId: string;
      sites: { id: string; name: string; address: string }[];
      confirmedReservationCount: number;
      revenueTotal: number;
    }
  | {
      view: 'AGENT';
      agent: {
        id: string;
        code: string;
        name: string;
        commissionRate: number;
        companyId: string;
        companyName: string;
      };
      /** CONFIRMED 예약만 실적 (docs/RBAC-OPERATIONS.md) */
      confirmedSalesLinkedCount: number;
      commissionPendingTotal: number;
      commissionPendingCount: number;
      commissionPaidTotal: number;
      commissionPaidCount: number;
      recentCommissions: {
        id: string;
        reservationId: string;
        amount: number;
        status: string;
        createdAt: string;
        reservationPrice: number;
        reservationStatus: string;
      }[];
    };

export type AgentRow = {
  id: string;
  userId: string;
  loginId?: string;
  companyId: string;
  companyName?: string;
  code: string;
  name: string;
  commissionRate: number;
  createdAt: string;
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

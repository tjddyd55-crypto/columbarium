import { requestJson } from "./http";
import type { AuthUser } from "../auth/session";

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

/** 회원가입 요청: login_id=로그인용 아이디, name=개인정보(실명) */
export interface SignUpRequest {
  login_id: string;
  password: string;
  name: string;
  birth_date: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface FacilitySummary {
  id: string;
  name: string;
  address: string | null;
  price_from?: number | null;
  image_url?: string | null;
  companyName?: string;
}

export interface FacilityDetail {
  id: string;
  name: string;
  address: string | null;
  price_from?: number | null;
  image_url?: string | null;
  sectionCount?: number;
}

export interface SeatSummary {
  seat_id: string;
  code: string;
}

/** 시설 좌석 API 응답 (정책 기반 상태) */
export interface SeatWithStatus {
  id: number;
  row: number;
  col: number;
  price: number;
  status: "GREEN" | "YELLOW" | "RED";
  waitingCount: number;
}

export interface SeatStatus {
  status: "AVAILABLE" | "WAITING" | "ACTIVE";
  waitingCount: number;
}

export interface QueueEntry {
  id: string;
  unitId: string;
  unitCode: string;
  facilityName: string;
  queuePosition: number;
  aheadCount: number;
  status: "WAITING" | "ACTIVE" | "EXPIRED" | "COMPLETED" | "CANCELLED";
  activatedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface ContractEntry {
  id: string;
  contractNo: string;
  unitId: string;
  unitCode: string;
  facilityName: string;
  status: string;
  contractType: string;
  finalPrice: number;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  login_id: string;
  name: string;
  phone: string;
  email: string | null;
  addressRoad: string | null;
  addressDetail: string | null;
  roles: string[];
}

/** 백엔드 인증 응답: success/data 봉투 안의 data */
type AuthData = { accessToken?: string; token?: string; user: AuthUser };

export const api = {
  async login(body: { login_id: string; password: string }): Promise<LoginResponse> {
    const data = await requestJson<AuthData>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const token = data.accessToken ?? data.token;
    if (!token || !data.user) throw new Error("로그인 응답 형식이 올바르지 않습니다.");
    return { token, user: data.user };
  },

  async signup(body: SignUpRequest): Promise<LoginResponse> {
    const data = await requestJson<AuthData>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const token = data.accessToken ?? data.token;
    if (!token || !data.user) throw new Error("회원가입 응답 형식이 올바르지 않습니다.");
    return { token, user: data.user };
  },

  listFacilities() {
    return requestJson<FacilitySummary[]>("/facilities");
  },

  getFacility(id: string) {
    return requestJson<FacilityDetail>(`/facilities/${id}`);
  },

  listFacilitySeats(id: string) {
    return requestJson<SeatWithStatus[]>(`/facilities/${id}/seats`);
  },

  reserveSeat(seatId: string, agentCode?: string) {
    return requestJson<{
      id: string;
      seatId: string;
      status: string;
      price: number;
      agentId?: string | null;
      createdAt: string;
    }>(
      `/seats/${seatId}/reserve`,
      {
        method: "POST",
        body: JSON.stringify(agentCode?.trim() ? { agentCode: agentCode.trim() } : {}),
      },
      true,
    );
  },

  waitSeat(seatId: string) {
    return requestJson<{ id: string; seatId: string; status: string; createdAt: string }>(
      `/seats/${seatId}/wait`,
      { method: "POST" },
      true,
    );
  },

  getSeatStatus(seatId: string) {
    return requestJson<SeatStatus>(`/api/seats/${seatId}/status`);
  },

  joinQueue(unitId: string) {
    return requestJson<{ id: string }>(
      "/queue/join",
      {
        method: "POST",
        body: JSON.stringify({ unitId }),
      },
      true,
    );
  },

  getMyQueues() {
    return requestJson<QueueEntry[]>("/queue/my", undefined, true);
  },

  getQueueById(id: string) {
    return requestJson<QueueEntry>(`/queue/${id}`, undefined, true);
  },

  createContract(unitId: string, queueEntryId: string) {
    return requestJson<{ id: string }>(
      "/contracts",
      {
        method: "POST",
        body: JSON.stringify({ unitId, queueEntryId }),
      },
      true,
    );
  },

  getMyContracts() {
    return requestJson<ContractEntry[]>("/contracts/my", undefined, true);
  },

  getMyProfile() {
    return requestJson<UserProfile>("/users/me", undefined, true);
  },
};

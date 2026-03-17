import { requestJson } from "./http";
import type { AuthUser } from "../auth/session";

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

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
  price_from: number | null;
  image_url: string | null;
}

export interface FacilityDetail {
  id: string;
  name: string;
  address: string | null;
  price_from: number | null;
  image_url: string | null;
}

export interface SeatSummary {
  seat_id: string;
  code: string;
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
  username: string;
  name: string;
  phone: string;
  email: string | null;
  addressRoad: string | null;
  addressDetail: string | null;
  roles: string[];
}

export const api = {
  login(body: { login_id: string; password: string }) {
    return requestJson<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  signup(body: SignUpRequest) {
    return requestJson<LoginResponse>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  listFacilities() {
    return requestJson<FacilitySummary[]>("/api/facilities");
  },

  getFacility(id: string) {
    return requestJson<FacilityDetail>(`/api/facilities/${id}`);
  },

  listFacilitySeats(id: string) {
    return requestJson<SeatSummary[]>(`/api/facilities/${id}/seats`);
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

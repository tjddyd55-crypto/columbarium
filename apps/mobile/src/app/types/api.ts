// API 응답 포맷 (STEP 2 백엔드)
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
}

export interface User {
  id: string;
  login_id: string;
  role: string;
}

export interface AuthResult {
  accessToken: string;
  user: User;
}

export interface Facility {
  id: string;
  name: string;
  description?: string;
  phone?: string;
  addressRoad?: string;
  addressDetail?: string;
  lat?: number;
  lng?: number;
  operatorId: string;
  operatorName: string;
}

export interface Unit {
  id: string;
  unitCode: string;
  rowCode: string;
  colNo: number;
  x: number;
  y: number;
  width: number;
  height: number;
  status: 'AVAILABLE' | 'WAITING_QUEUE' | 'ACTIVE_OFFER' | 'CONTRACTED' | 'RESALE_LISTED' | 'BLOCKED';
  basePrice: number;
  preSalePrice?: number;
  contractYears: number;
}

export interface QueueEntry {
  id: string;
  unitId: string;
  unitCode: string;
  facilityName: string;
  queuePosition: number;
  aheadCount: number;
  status: 'WAITING' | 'ACTIVE' | 'EXPIRED' | 'COMPLETED' | 'CANCELLED';
  activatedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface Contract {
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
  createdAt?: string;
}

export interface ResaleListing {
  id: string;
  unitId: string;
  unitCode: string;
  facilityName: string;
  askingPrice: number;
  status: string;
  createdAt: string;
}

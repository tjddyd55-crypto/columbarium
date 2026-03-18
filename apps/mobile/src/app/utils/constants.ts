// API Base URL (환경변수 또는 기본값)
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

// 단위 상태 표시 색상 (UnitGrid)
export const UNIT_STATUS_COLORS: Record<string, string> = {
  AVAILABLE: '#22c55e',
  WAITING_QUEUE: '#eab308',
  ACTIVE_OFFER: '#f97316',
  CONTRACTED: '#ef4444',
  RESALE_LISTED: '#8b5cf6',
  BLOCKED: '#94a3b8',
};

export const UNIT_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: '가능',
  WAITING_QUEUE: '대기중',
  ACTIVE_OFFER: '구매가능',
  CONTRACTED: '계약됨',
  RESALE_LISTED: '재판매',
  BLOCKED: '비활성',
};

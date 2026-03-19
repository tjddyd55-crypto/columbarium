/**
 * 좌석 상태는 DB에 저장하지 않고 정책 기반으로 계산한다.
 * GREEN: 즉시 구매 가능
 * YELLOW: 대기 가능
 * RED: 불가 (차단/대기만료/이미 확정)
 */

export type SeatStatus = 'GREEN' | 'YELLOW' | 'RED';

export interface SeatForState {
  id: bigint;
  row: number;
  col: number;
  price: number;
  isBlocked: boolean;
}

export interface ReservationForState {
  status: string;
  /** RESERVED일 때만 사용. 만료 시 점유로 간주하지 않음 */
  expiresAt?: Date | null;
}

export interface PolicyForState {
  maxWaiting?: number | null;
  maxYears?: number | null;
}

const now = () => new Date();

/**
 * 좌석 상태 계산 (정책 기반)
 * RESERVED(예약/미결제) 또는 CONFIRMED(결제확정) 있으면 → 자리 점유 → YELLOW(대기 가능)
 * RESERVED 중 expiresAt < now 인 경우는 무시(만료된 예약).
 */
export function getSeatState(
  seat: SeatForState,
  reservations: ReservationForState[],
  policy: PolicyForState | null,
): SeatStatus {
  const occupied = reservations.some((r) => {
    if (r.status === 'CONFIRMED') return true;
    if (r.status === 'RESERVED') {
      if (r.expiresAt == null) return true;
      return r.expiresAt >= now();
    }
    return false;
  });
  const waitingCount = reservations.filter((r) => r.status === 'WAITING').length;

  if (seat.isBlocked) return 'RED';

  if (policy?.maxWaiting != null && waitingCount >= policy.maxWaiting) {
    return 'RED';
  }

  if (occupied) return 'YELLOW';

  return 'GREEN';
}

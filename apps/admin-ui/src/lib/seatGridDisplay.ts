import type { AdminSeatRow, AdminSeatUiStatus } from './api';

/**
 * 그리드·범례·모달에서 동일한 색 규칙 사용
 * - AVAILABLE: 초록
 * - WAITING: 노랑(앰버)
 * - BLOCKED: 빨강
 * - SOLD: 회색 바탕 + 파랑 테두리/링 (파랑·회색)
 */
export const SEAT_GRID_CELL_CLASS: Record<AdminSeatUiStatus, string> = {
  AVAILABLE:
    'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300',
  WAITING:
    'bg-amber-400 hover:bg-amber-500 text-gray-900 border-amber-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-300',
  BLOCKED:
    'bg-red-600 hover:bg-red-700 text-white border-red-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-300',
  SOLD:
    'bg-slate-600 hover:bg-slate-700 text-slate-50 border-2 border-blue-500 ring-2 ring-blue-400/70 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300',
};

export const SEAT_GRID_LEGEND: { status: AdminSeatUiStatus; label: string }[] = [
  { status: 'AVAILABLE', label: '판매 가능 (초록)' },
  { status: 'WAITING', label: '대기·예약중 (노랑)' },
  { status: 'BLOCKED', label: '차단 (빨강)' },
  { status: 'SOLD', label: '확정·매각 (파랑·회색)' },
];

/** 범례 작은 사각형용 (셀 클래스와 동일 색상) */
export const SEAT_GRID_LEGEND_SWATCH: Record<AdminSeatUiStatus, string> = {
  AVAILABLE: 'bg-emerald-500 border border-emerald-700',
  WAITING: 'bg-amber-400 border border-amber-600',
  BLOCKED: 'bg-red-600 border border-red-800',
  SOLD: 'bg-slate-600 border-2 border-blue-500 ring-1 ring-blue-400',
};

/** API 호환: 구버전 응답은 uiStatus 만 있을 수 있음 */
export function resolveSeatGridStatus(seat: Pick<AdminSeatRow, 'uiStatus'> & { status?: AdminSeatUiStatus }): AdminSeatUiStatus {
  return seat.status ?? seat.uiStatus;
}

export function resolveSeatCode(seat: Pick<AdminSeatRow, 'displayCode'> & { code?: string }): string {
  return seat.code ?? seat.displayCode;
}

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { AdminSeatRow } from '../../lib/api';
import { facilityAdminApi } from '../../lib/facilityAdminApi';
import { resolveSeatCode, resolveSeatGridStatus } from '../../lib/seatGridDisplay';

const UI_STATUS_KO: Record<AdminSeatRow['uiStatus'], string> = {
  AVAILABLE: '판매 가능',
  WAITING: '대기/예약중',
  BLOCKED: '차단',
  SOLD: '확정(매각)',
};

function reservationLabel(status: string | null): string {
  if (!status) return '—';
  const map: Record<string, string> = {
    RESERVED: '예약(미결제)',
    WAITING: '대기 순번',
    CONFIRMED: '결제 확정',
    CANCELLED: '취소',
  };
  return map[status] ?? status;
}

type Props = {
  seat: AdminSeatRow | null;
  scoped: boolean;
  onClose: () => void;
  onAfterMutation: () => void | Promise<void>;
};

export default function SeatDetailModal({ seat, scoped, onClose, onAfterMutation }: Props) {
  const [priceInput, setPriceInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!seat) return;
    setPriceInput(String(seat.price));
    setError('');
  }, [seat]);

  if (!seat) return null;

  const gridStatus = resolveSeatGridStatus(seat);
  const code = resolveSeatCode(seat);

  const savePrice = async () => {
    const v = parseInt(priceInput.replace(/,/g, ''), 10);
    if (Number.isNaN(v) || v < 0) {
      setError('유효한 가격을 입력하세요.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await facilityAdminApi.updateSeatPrice(scoped, seat.id, v);
      await onAfterMutation();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const toggleBlock = async () => {
    setSaving(true);
    setError('');
    try {
      await facilityAdminApi.blockSeat(scoped, seat.id, !seat.isBlocked);
      await onAfterMutation();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : '처리에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="seat-modal-title"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-[#E5E7EB]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 id="seat-modal-title" className="text-lg font-semibold text-[#1E293B]">
              봉안함 {code}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              code <span className="font-mono">{code}</span> · 행 {seat.row} · 열 {seat.col} · id{' '}
              <span className="font-mono text-xs">{seat.id}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-gray-500">가격 (원)</dt>
          <dd className="font-mono">{seat.price.toLocaleString()}</dd>
          <dt className="text-gray-500">그리드 상태 (status)</dt>
          <dd className="font-medium">
            <span className="font-mono text-xs mr-2">{gridStatus}</span>
            {UI_STATUS_KO[gridStatus]}
          </dd>
          <dt className="text-gray-500">예약 상태</dt>
          <dd>{reservationLabel(seat.reservationStatus)}</dd>
          {seat.reservationId && (
            <>
              <dt className="text-gray-500">예약 ID</dt>
              <dd className="font-mono text-xs break-all">{seat.reservationId}</dd>
            </>
          )}
        </dl>

        <div className="border-t border-gray-100 pt-4 space-y-3">
          <label className="block text-sm font-medium text-gray-700">가격 (원)</label>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value.replace(/[^\d]/g, ''))}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
            />
            <button
              type="button"
              disabled={saving}
              onClick={savePrice}
              className="px-4 py-2 rounded-lg bg-[#3B82F6] text-white text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              저장
            </button>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">상태 수정 (운영)</p>
          <p className="text-xs text-gray-500 mb-2">
            <strong>가격</strong>은 아래에서 저장합니다. <strong>차단(BLOCKED)</strong>은 토글로 바로 반영됩니다.
            AVAILABLE / WAITING / SOLD 는 예약·대기열 흐름에서 결정되며, 이 화면에서는 예약 데이터를 바꾸지 않습니다.
          </p>
          <button
            type="button"
            disabled={saving}
            onClick={toggleBlock}
            className={`w-full py-2.5 rounded-lg text-sm font-medium border ${
              seat.isBlocked
                ? 'border-emerald-600 text-emerald-700 hover:bg-emerald-50'
                : 'border-red-600 text-red-700 hover:bg-red-50'
            } disabled:opacity-50`}
          >
            {seat.isBlocked ? '차단 해제' : '좌석 차단'}
          </button>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}

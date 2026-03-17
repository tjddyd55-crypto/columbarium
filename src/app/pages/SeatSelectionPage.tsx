import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { api } from '../../lib/api';

type SeatStatus = 'AVAILABLE' | 'WAITING' | 'ACTIVE';

type SeatRow = {
  id: string;
  code: string;
  status: SeatStatus;
  waitingCount: number;
};

const SEAT_IDS_BY_FACILITY: Record<string, string[]> = {
  '1': ['S1', 'S2', 'S3'],
  '2': ['S4', 'S5', 'S6'],
};
const SEAT_CODE_MAP: Record<string, string> = {
  S1: 'A-1-001', S2: 'A-1-002', S3: 'A-1-003',
  S4: 'B-1-001', S5: 'B-1-002', S6: 'B-1-003',
};

export default function SeatSelectionPage() {
  const { id: facilityId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [seats, setSeats] = useState<SeatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const seatIds = (facilityId && SEAT_IDS_BY_FACILITY[facilityId]) || SEAT_IDS_BY_FACILITY['1'] || [];
    if (!seatIds.length) {
      setSeats([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    let cancelled = false;
    (async () => {
      try {
        const rows: SeatRow[] = await Promise.all(
          seatIds.map(async (sid) => {
            const { status, waitingCount } = await api.seats.status(sid);
            return {
              id: sid,
              code: SEAT_CODE_MAP[sid] ?? sid,
              status,
              waitingCount,
            };
          })
        );
        if (!cancelled) setSeats(rows);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : '오류 발생');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [facilityId]);

  const handleSeatClick = (seatId: string, status: SeatStatus) => {
    if (status === 'ACTIVE') return;
    navigate(`/waitlist/${seatId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate(`/facilities/${facilityId}`)}
          className="text-sm text-gray-600 hover:text-[var(--color-primary)]"
        >
          ← 시설로 돌아가기
        </button>
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate(`/facilities/${facilityId}`)}
          className="text-sm text-gray-600 hover:text-[var(--color-primary)]"
        >
          ← 시설로 돌아가기
        </button>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate(`/facilities/${facilityId}`)}
        className="text-sm text-gray-600 hover:text-[var(--color-primary)]"
      >
        ← 시설로 돌아가기
      </button>
      <h1 className="text-2xl font-bold text-[var(--color-primary)]">
        봉안함 선택
      </h1>
      {seats.length === 0 ? (
        <p className="text-gray-500">봉안함이 없습니다.</p>
      ) : (
        <ul className="grid gap-3">
          {seats.map((seat) => (
            <li key={seat.id}>
              {seat.status === 'ACTIVE' ? (
                <div className="w-full text-left bg-gray-100 border border-[var(--color-border)] rounded-lg p-4">
                  <span className="font-medium">{seat.code}</span>
                  <span className="ml-2 text-sm text-gray-600">판매 완료</span>
                  <p className="mt-2 text-sm text-gray-500">이 봉안함은 이미 계약이 완료되었습니다.</p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSeatClick(seat.id, seat.status)}
                  className="w-full text-left bg-white border border-[var(--color-border)] rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium">{seat.code}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    {seat.status === 'AVAILABLE' && '대기 신청'}
                    {seat.status === 'WAITING' && `대기 ${seat.waitingCount}명 · 대기열 등록`}
                  </span>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

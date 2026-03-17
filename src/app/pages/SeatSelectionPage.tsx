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

const SEAT_IDS = ['S1', 'S2', 'S3'];
const SEAT_CODES: Record<string, string> = { S1: 'A-1-001', S2: 'A-1-002', S3: 'A-1-003' };

export default function SeatSelectionPage() {
  const { id: facilityId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [seats, setSeats] = useState<SeatRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const rows: SeatRow[] = await Promise.all(
        SEAT_IDS.map(async (id) => {
          const { status, waitingCount } = await api.seats.status(id);
          return { id, code: SEAT_CODES[id] ?? id, status, waitingCount };
        })
      );
      if (!cancelled) {
        setSeats(rows);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSeatClick = (seatId: string, status: SeatStatus) => {
    if (status === 'WAITING') {
      navigate(`/waitlist/${seatId}`);
      return;
    }
    if (status === 'ACTIVE') {
      navigate(`/contract/${seatId}`);
      return;
    }
    navigate(`/contract/${seatId}`);
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
      <ul className="grid gap-3">
        {seats.map((seat) => (
          <li key={seat.id}>
            <button
              type="button"
              onClick={() => handleSeatClick(seat.id, seat.status)}
              className="w-full text-left bg-white border border-[var(--color-border)] rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium">{seat.code}</span>
              <span className="ml-2 text-sm text-gray-500">
                {seat.status === 'AVAILABLE' && '가능'}
                {seat.status === 'WAITING' && `대기 ${seat.waitingCount}명 → 대기열`}
                {seat.status === 'ACTIVE' && '계약 가능 → 계약'}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { useNavigate, useParams } from 'react-router';

type SeatStatus = 'AVAILABLE' | 'WAITING' | 'ACTIVE';

const MOCK_SEATS = [
  { id: 'S1', code: 'A-1-001', status: 'AVAILABLE' as SeatStatus },
  { id: 'S2', code: 'A-1-002', status: 'WAITING' as SeatStatus },
  { id: 'S3', code: 'A-1-003', status: 'ACTIVE' as SeatStatus },
];

export default function SeatSelectionPage() {
  const { id: facilityId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleSeatClick = (seatId: string, status: SeatStatus) => {
    if (status === 'WAITING') {
      navigate(`/waitlist/${seatId}`);
      return;
    }
    if (status === 'ACTIVE') {
      navigate(`/contract/${seatId}`);
      return;
    }
    // AVAILABLE: could go to contract or waitlist flow
    navigate(`/contract/${seatId}`);
  };

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
        {MOCK_SEATS.map((seat) => (
          <li key={seat.id}>
            <button
              type="button"
              onClick={() => handleSeatClick(seat.id, seat.status)}
              className="w-full text-left bg-white border border-[var(--color-border)] rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium">{seat.code}</span>
              <span className="ml-2 text-sm text-gray-500">
                {seat.status === 'AVAILABLE' && '가능'}
                {seat.status === 'WAITING' && '대기 → 대기열'}
                {seat.status === 'ACTIVE' && '계약 가능 → 계약'}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

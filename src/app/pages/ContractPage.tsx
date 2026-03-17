import { useNavigate, useParams } from 'react-router';

export default function ContractPage() {
  const { seatId } = useParams<{ seatId: string }>();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-sm text-gray-600 hover:text-[var(--color-primary)]"
      >
        ← 이전
      </button>
      <h1 className="text-2xl font-bold text-[var(--color-primary)]">
        계약
      </h1>
      <p className="text-gray-600">
        봉안함 <strong>{seatId}</strong> 계약을 진행합니다.
      </p>
      <div className="bg-white border border-[var(--color-border)] rounded-lg p-6 space-y-4">
        <p className="text-sm text-gray-500">계약서/결제 폼 (추가 연동 가능)</p>
        <button
          type="button"
          onClick={() => navigate('/facilities')}
          className="w-full max-w-sm bg-[var(--color-primary)] text-white py-3 rounded-lg font-medium hover:bg-[var(--color-primary-dark)]"
        >
          계약 완료
        </button>
      </div>
    </div>
  );
}

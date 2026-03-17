import { useNavigate, useParams } from 'react-router';

export default function WaitlistPage() {
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
        대기열 신청
      </h1>
      <p className="text-gray-600">
        봉안함 <strong>{seatId}</strong> 대기열에 신청합니다.
      </p>
      <div className="bg-white border border-[var(--color-border)] rounded-lg p-6 space-y-4">
        <p className="text-sm text-gray-500">대기열 등록 폼 (추가 입력 필드 연동 가능)</p>
        <button
          type="button"
          onClick={() => navigate('/facilities')}
          className="w-full max-w-sm bg-[var(--color-primary)] text-white py-3 rounded-lg font-medium hover:bg-[var(--color-primary-dark)]"
        >
          신청 완료
        </button>
      </div>
    </div>
  );
}

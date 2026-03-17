import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { api } from '../../lib/api';

export default function ContractPage() {
  const { seatId } = useParams<{ seatId: string }>();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [price, setPrice] = useState(30000000);
  const [submitting, setSubmitting] = useState(false);

  const handleContract = async () => {
    if (!seatId) return;
    setSubmitting(true);
    try {
      const { hasActive } = await api.contracts.hasActive(seatId);
      if (hasActive) {
        alert('이미 활성 계약이 있는 봉안함입니다. 다른 봉안함을 선택해 주세요.');
        setSubmitting(false);
        return;
      }
      await api.contracts.create({
        seat_id: seatId,
        user_name: userName || '홍길동',
        price,
      });
      alert('계약 요청 완료');
      navigate('/facilities');
    } catch {
      alert('오류 발생');
    } finally {
      setSubmitting(false);
    }
  };

  if (!seatId) {
    return (
      <div className="space-y-6">
        <button type="button" onClick={() => navigate('/facilities')} className="text-sm text-gray-600 hover:text-[var(--color-primary)]">
          ← 시설 목록
        </button>
        <p className="text-gray-500">봉안함 정보가 없습니다.</p>
      </div>
    );
  }

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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="홍길동"
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">금액 (원)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg"
          />
        </div>
        <button
          type="button"
          onClick={handleContract}
          disabled={submitting}
          className="w-full max-w-sm bg-[var(--color-primary)] text-white py-3 rounded-lg font-medium hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
        >
          {submitting ? '처리 중...' : '계약 완료'}
        </button>
      </div>
    </div>
  );
}

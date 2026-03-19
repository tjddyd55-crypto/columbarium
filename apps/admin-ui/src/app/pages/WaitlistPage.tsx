import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { api } from '../../lib/api';

export default function WaitlistPage() {
  const { seatId } = useParams<{ seatId: string }>();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!seatId) return;
    setSubmitting(true);
    try {
      await api.waitlist.create({
        seat_id: seatId,
        user_name: userName.trim() || undefined,
        user_phone: userPhone.trim() || undefined,
      });
      alert('대기열 등록 완료');
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
        대기열 신청
      </h1>
      <p className="text-gray-600">
        봉안함 <strong>{seatId}</strong> 대기열에 신청합니다.
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
          <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
          <input
            type="tel"
            value={userPhone}
            onChange={(e) => setUserPhone(e.target.value)}
            placeholder="010-0000-0000"
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg"
          />
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full max-w-sm bg-[var(--color-primary)] text-white py-3 rounded-lg font-medium hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
        >
          {submitting ? '처리 중...' : '신청 완료'}
        </button>
      </div>
    </div>
  );
}

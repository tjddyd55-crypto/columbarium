import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { supabase } from '../../lib/supabase';

export default function WaitlistPage() {
  const { seatId } = useParams<{ seatId: string }>();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!seatId) return;
    setSubmitting(true);
    const { error } = await supabase.from('waitlist').insert([
      {
        seat_id: seatId,
        user_name: userName || '홍길동',
        user_phone: userPhone || '010-0000-0000',
        status: 'WAITING',
      },
    ]);
    setSubmitting(false);
    if (!error) {
      alert('대기열 신청 완료');
      navigate('/facilities');
    } else {
      alert('신청 실패: ' + error.message);
    }
  };

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

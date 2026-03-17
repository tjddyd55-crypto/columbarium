import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { api, getStoredUser, type WaitlistRow, type ContractRow } from '../../lib/api';

const statusLabelWaitlist: Record<string, string> = { WAITING: '대기', ACTIVE: '활성' };
const statusLabelContract: Record<string, string> = { PENDING: '대기', ACTIVE: '활성', COMPLETED: '완료' };

export default function MyPage() {
  const user = getStoredUser();
  const [waitlist, setWaitlist] = useState<WaitlistRow[]>([]);
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    Promise.all([api.my.waitlist(), api.my.contracts()])
      .then(([wl, ct]) => {
        if (!cancelled) {
          setWaitlist(wl);
          setContracts(ct);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : '오류 발생');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [user]);

  if (!user) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">마이페이지</h1>
        <p className="text-gray-600">로그인 후 이용할 수 있습니다.</p>
        <Link to="/login" className="text-[var(--color-primary)] hover:underline">로그인</Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">마이페이지</h1>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[var(--color-primary)]">마이페이지</h1>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">내 정보</h2>
        <div className="bg-white border border-[var(--color-border)] rounded-lg p-4">
          <p><span className="text-gray-600">이름</span> {user.name}</p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">내 대기열</h2>
        {loading ? (
          <p className="text-gray-500">로딩 중...</p>
        ) : waitlist.length === 0 ? (
          <p className="text-gray-500">대기열 신청 내역이 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {waitlist.map((row) => (
              <li key={row.id} className="bg-white border border-[var(--color-border)] rounded-lg p-3 flex justify-between items-center">
                <span>{row.seat_id}</span>
                <span className="text-sm text-gray-600">{statusLabelWaitlist[row.status] ?? row.status}</span>
                <span className="text-sm text-gray-500">{row.created_at ? new Date(row.created_at).toLocaleDateString('ko-KR') : ''}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">내 계약</h2>
        {loading ? (
          <p className="text-gray-500">로딩 중...</p>
        ) : contracts.length === 0 ? (
          <p className="text-gray-500">계약 내역이 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {contracts.map((row) => (
              <li key={row.id} className="bg-white border border-[var(--color-border)] rounded-lg p-3 flex justify-between items-center">
                <span>{row.seat_id}</span>
                <span className="text-sm">{row.price != null ? row.price.toLocaleString() + '원' : '-'}</span>
                <span className="text-sm text-gray-600">{statusLabelContract[row.status] ?? row.status}</span>
                <span className="text-sm text-gray-500">{row.created_at ? new Date(row.created_at).toLocaleDateString('ko-KR') : ''}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

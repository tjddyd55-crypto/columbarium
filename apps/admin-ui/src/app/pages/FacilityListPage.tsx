import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { api, type FacilityRow } from '../../lib/api';

export default function FacilityListPage() {
  const navigate = useNavigate();
  const [list, setList] = useState<FacilityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.facilities
      .list()
      .then((data) => {
        if (!cancelled) setList(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : '오류 발생');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <p className="text-gray-500">로딩 중...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--color-primary)]">
        시설 목록
      </h1>
      {list.length === 0 ? (
        <p className="text-gray-500">등록된 시설이 없습니다.</p>
      ) : (
        <ul className="space-y-4">
          {list.map((f) => (
            <li
              key={f.id}
              className="bg-white border border-[var(--color-border)] rounded-lg p-4 shadow-sm"
            >
              <h2 className="font-semibold text-gray-900">{f.name}</h2>
              <p className="text-sm text-gray-600 mt-1">{f.address ?? '-'}</p>
              {f.price_from != null && (
                <p className="text-sm text-gray-500 mt-1">가격 from {f.price_from.toLocaleString()}원</p>
              )}
              <button
                type="button"
                onClick={() => navigate(`/facilities/${f.id}`)}
                className="mt-3 text-sm font-medium text-[var(--color-primary)] hover:underline"
              >
                상세 보기 →
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

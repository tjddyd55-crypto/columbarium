import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { api, type FacilityRow } from '../../lib/api';

export default function FacilityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [facility, setFacility] = useState<FacilityRow | null>(null);
  const [seatsCount, setSeatsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    Promise.all([api.facilities.get(id), api.facilities.getSeats(id)])
      .then(([fac, seats]) => {
        if (!cancelled) {
          setFacility(fac);
          setSeatsCount(seats.length);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : '오류 발생');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  const handleSelectSeat = () => {
    navigate(`/seats/${id}`);
  };

  if (loading) return <p className="text-gray-500">로딩 중...</p>;
  if (error) {
    return (
      <div className="space-y-6">
        <button type="button" onClick={() => navigate('/facilities')} className="text-sm text-gray-600 hover:text-[var(--color-primary)]">
          ← 시설 목록
        </button>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }
  if (!facility) {
    return (
      <div className="space-y-6">
        <button type="button" onClick={() => navigate('/facilities')} className="text-sm text-gray-600 hover:text-[var(--color-primary)]">
          ← 시설 목록
        </button>
        <p className="text-gray-500">시설을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate('/facilities')}
        className="text-sm text-gray-600 hover:text-[var(--color-primary)]"
      >
        ← 시설 목록
      </button>
      <h1 className="text-2xl font-bold text-[var(--color-primary)]">
        {facility.name}
      </h1>
      <p className="text-gray-600">{facility.address ?? '-'}</p>
      {facility.price_from != null && (
        <p className="text-sm text-gray-500">가격 from {facility.price_from.toLocaleString()}원</p>
      )}
      <p className="text-sm text-gray-500">봉안함 {seatsCount}개</p>
      <button
        type="button"
        onClick={handleSelectSeat}
        className="w-full max-w-sm bg-[var(--color-primary)] text-white py-3 px-6 rounded-lg font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
      >
        봉안함 선택하기
      </button>
    </div>
  );
}

import { useNavigate } from 'react-router';

const MOCK_FACILITIES = [
  { id: '1', name: '강남점 1호점', address: '서울 강남구 테헤란로 123', units: 50 },
  { id: '2', name: '서초 본점', address: '서울 서초구 서초대로 789', units: 60 },
];

export default function FacilityListPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--color-primary)]">
        시설 목록
      </h1>
      <ul className="space-y-4">
        {MOCK_FACILITIES.map((f) => (
          <li
            key={f.id}
            className="bg-white border border-[var(--color-border)] rounded-lg p-4 shadow-sm"
          >
            <h2 className="font-semibold text-gray-900">{f.name}</h2>
            <p className="text-sm text-gray-600 mt-1">{f.address}</p>
            <p className="text-sm text-gray-500 mt-1">봉안함 {f.units}개</p>
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
    </div>
  );
}

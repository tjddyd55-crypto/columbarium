import { useNavigate, useParams } from 'react-router';

const MOCK_FACILITY = {
  id: '1',
  name: '강남점 1호점',
  address: '서울 강남구 테헤란로 123',
  units: 50,
  description: '편안한 환경의 낙골당 시설입니다.',
};

export default function FacilityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const facility = MOCK_FACILITY;

  const handleSelectSeat = () => {
    navigate(`/seats/${id ?? facility.id}`);
  };

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
      <p className="text-gray-600">{facility.address}</p>
      <p className="text-gray-600">{facility.description}</p>
      <p className="text-sm text-gray-500">봉안함 {facility.units}개</p>
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

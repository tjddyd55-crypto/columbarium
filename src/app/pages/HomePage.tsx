import { useNavigate } from 'react-router';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-10 py-8">
      <section className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-[var(--color-primary)]">
          낙골당 서비스
        </h1>
        <p className="text-gray-600 max-w-lg mx-auto">
          안심하고 봉안할 수 있는 시설을 찾아보세요.
        </p>
      </section>

      <section className="flex flex-col items-center gap-6">
        <button
          type="button"
          onClick={() => navigate('/facilities')}
          className="w-full max-w-sm bg-[var(--color-primary)] text-white py-4 px-6 rounded-xl font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          시설 목록 보기
        </button>
        <p className="text-sm text-gray-500">
          가까운 낙골당 시설을 검색하고 봉안함을 예약할 수 있습니다.
        </p>
      </section>
    </div>
  );
}

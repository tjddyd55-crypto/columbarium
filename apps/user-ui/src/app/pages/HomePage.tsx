import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Search } from "lucide-react";
import { FacilityCard } from "../components/FacilityCard";
import { api, type FacilitySummary } from "../../shared/api/service";
import { ApiError } from "../../shared/api/http";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1740815320875-6b72c87dcd1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

function toCardModel(item: FacilitySummary) {
  return {
    id: item.id,
    name: item.name,
    location: item.address ?? "주소 정보 없음",
    price: item.price_from ? `${item.price_from.toLocaleString()}원~` : "가격 문의",
    image: item.image_url ?? FALLBACK_IMAGE,
  };
}

export function HomePage() {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState<FacilitySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadFacilities() {
      try {
        const result = await api.listFacilities();
        if (!cancelled) {
          setFacilities(result);
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError) {
            setError(err.message);
          } else {
            setError("시설 정보를 불러오지 못했습니다.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadFacilities();
    return () => {
      cancelled = true;
    };
  }, []);

  const recommendedFacilities = useMemo(
    () => facilities.slice(0, 3).map(toCardModel),
    [facilities],
  );
  const popularFacilities = useMemo(
    () => facilities.slice(3, 8).map(toCardModel),
    [facilities],
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 pt-6 pb-4">
        <h1 className="text-2xl mb-4 text-gray-900">낙골당</h1>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="지역, 시설명으로 검색"
            onClick={() => navigate("/facilities")}
            className="w-full h-12 pl-12 pr-4 bg-gray-100 border-0 rounded-xl text-gray-900 placeholder:text-gray-500"
            readOnly
          />
        </div>
      </div>

      {/* Banner */}
      <div className="mx-6 my-4">
        <div className="bg-gradient-to-r from-[#1E3A8A] to-[#3B5BA5] rounded-2xl p-6 text-white">
          <h2 className="text-xl mb-2">선분양 안내</h2>
          <p className="text-sm opacity-90">최대 20% 할인 혜택</p>
          <button
            onClick={() => navigate("/promotion/pre-sale")}
            className="mt-4 px-6 py-2 bg-white text-[#1E3A8A] rounded-lg"
          >
            자세히 보기
          </button>
        </div>
      </div>

      {/* Recommended */}
      <div className="px-6 py-4">
        <h2 className="text-xl mb-4 text-gray-900">추천 낙골당</h2>
        {loading ? (
          <p className="text-sm text-gray-500">시설 정보를 불러오는 중...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : recommendedFacilities.length === 0 ? (
          <p className="text-sm text-gray-500">등록된 시설이 없습니다.</p>
        ) : (
          <div className="flex overflow-x-auto gap-4 pb-2 -mx-6 px-6">
            {recommendedFacilities.map((facility) => (
              <div key={facility.id} className="flex-shrink-0 w-72">
                <FacilityCard facility={facility} />
              </div>
            ))}
            </div>
        )}
      </div>

      {/* Popular */}
      <div className="px-6 py-4 pb-8">
        <h2 className="text-xl mb-4 text-gray-900">인기 시설</h2>
        {loading ? null : popularFacilities.length === 0 ? (
          <p className="text-sm text-gray-500">인기 시설 정보가 없습니다.</p>
        ) : (
          <div className="space-y-4">
            {popularFacilities.map((facility) => (
              <FacilityCard key={facility.id} facility={facility} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

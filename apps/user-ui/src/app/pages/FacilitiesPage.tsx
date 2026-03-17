import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { FacilityCard } from "../components/FacilityCard";
import { Button } from "../components/ui/button";
import { api, type FacilitySummary } from "../../shared/api/service";
import { ApiError } from "../../shared/api/http";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1740815320875-6b72c87dcd1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

function parseRegion(address: string | null): string {
  if (!address) return "기타";
  return address.split(" ")[0] ?? "기타";
}

export function FacilitiesPage() {
  const [allFacilities, setAllFacilities] = useState<FacilitySummary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [showFilter, setShowFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadFacilities() {
      try {
        const result = await api.listFacilities();
        if (!cancelled) {
          setAllFacilities(result);
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

  const regions = useMemo(() => {
    const dynamicRegions = Array.from(
      new Set(allFacilities.map((facility) => parseRegion(facility.address))),
    );
    return ["전체", ...dynamicRegions];
  }, [allFacilities]);

  const filteredFacilities = allFacilities.filter((facility) => {
    const location = facility.address ?? "";
    const matchesSearch = facility.name.includes(searchQuery) || location.includes(searchQuery);
    const matchesRegion = selectedRegion === "전체" || parseRegion(facility.address) === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 pt-6 pb-4 sticky top-0 z-10">
        <h1 className="text-2xl mb-4 text-gray-900">시설 검색</h1>
        
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="지역, 시설명으로 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-gray-100 border-0 rounded-xl text-gray-900 placeholder:text-gray-500"
            />
          </div>
          <Button
            onClick={() => setShowFilter(!showFilter)}
            variant="outline"
            className="h-12 w-12 p-0 rounded-xl border-gray-200"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
        </div>

        {/* Filter */}
        {showFilter && (
          <div className="mt-4 pb-2">
            <p className="text-sm text-gray-600 mb-2">지역 선택</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {regions.map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedRegion === region
                      ? "bg-[#1E3A8A] text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="px-6 py-4 space-y-4">
        {loading ? (
          <p className="text-sm text-gray-500">시설 정보를 불러오는 중...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <>
            <p className="text-sm text-gray-600">총 {filteredFacilities.length}개의 시설</p>
            {filteredFacilities.map((facility) => (
              <FacilityCard
                key={facility.id}
                facility={{
                  id: facility.id,
                  name: facility.name,
                  location: facility.address ?? "주소 정보 없음",
                  price: facility.price_from ? `${facility.price_from.toLocaleString()}원~` : "가격 문의",
                  image: facility.image_url ?? FALLBACK_IMAGE,
                }}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

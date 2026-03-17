import { useEffect, useState } from "react";
import { MapPin, Calendar } from "lucide-react";
import { useNavigate } from "react-router";
import { api, type ContractEntry } from "../../shared/api/service";
import { ApiError } from "../../shared/api/http";

export function MyContractsPage() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<ContractEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadContracts() {
      try {
        const result = await api.getMyContracts();
        if (!cancelled) {
          setContracts(result);
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError && err.status === 401) {
            navigate("/login");
            return;
          }
          if (err instanceof ApiError) {
            setError(err.message);
          } else {
            setError("계약 정보를 불러오지 못했습니다.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadContracts();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 pt-6 pb-4 sticky top-0 z-10">
        <h1 className="text-2xl text-gray-900">내 계약</h1>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {loading ? (
          <p className="text-sm text-gray-500">계약 정보를 불러오는 중...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : contracts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500">계약 내역이 없습니다</p>
          </div>
        ) : (
          contracts.map((contract) => (
            <div
              key={contract.id}
              className="bg-white rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg text-gray-900 mb-1">
                    {contract.facilityName}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">시설 상세에서 위치 확인</span>
                  </div>
                </div>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  {contract.status}
                </span>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">좌석</span>
                  <span className="text-gray-900">{contract.unitCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">계약일</span>
                  <span className="text-gray-900">{contract.createdAt.slice(0, 10)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">계약금액</span>
                  <span className="text-[#1E3A8A]">
                    {contract.finalPrice.toLocaleString()}원
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/contracts/${contract.id}/document`)}
                className="w-full mt-4 h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
              >
                계약서 보기
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

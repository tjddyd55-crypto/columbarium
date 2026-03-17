import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Clock, MapPin } from "lucide-react";
import { api, type QueueEntry } from "../../shared/api/service";
import { ApiError } from "../../shared/api/http";

export function WaitlistPage() {
  const navigate = useNavigate();
  const [waitlist, setWaitlist] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadWaitlist() {
      try {
        const result = await api.getMyQueues();
        if (!cancelled) {
          setWaitlist(result);
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
            setError("대기열 정보를 불러오지 못했습니다.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadWaitlist();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 pt-6 pb-4 sticky top-0 z-10">
        <h1 className="text-2xl text-gray-900">내 대기열</h1>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {loading ? (
          <p className="text-sm text-gray-500">대기열 정보를 불러오는 중...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : waitlist.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">신청한 대기열이 없습니다</p>
          </div>
        ) : (
          waitlist.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/waitlist/${item.id}`)}
              className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg text-gray-900 mb-1">
                    {item.facilityName}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">시설 상세에서 위치를 확인하세요</span>
                  </div>
                </div>
                {item.status === "ACTIVE" && (
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
                    계약가능
                  </span>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">좌석</span>
                  <span className="text-gray-900">{item.unitCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">내 순번</span>
                  <span className="text-[#1E3A8A]">{item.queuePosition}번</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">대기 인원</span>
                  <span className="text-gray-900">{item.aheadCount + 1}명</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">가격</span>
                  <span className="text-gray-900">가격 정보 준비 중</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

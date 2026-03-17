import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Clock } from "lucide-react";
import { Button } from "../components/ui/button";
import { api, type QueueEntry } from "../../shared/api/service";
import { ApiError } from "../../shared/api/http";

export function WaitlistDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [entry, setEntry] = useState<QueueEntry | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!id) {
      setError("페이지 없습니다");
      setLoading(false);
      return;
    }

    async function loadDetail() {
      try {
        const result = await api.getQueueById(id);
        if (!cancelled) {
          setEntry(result);
          if (result.expiresAt) {
            const nextTimeLeft = Math.max(
              0,
              Math.floor((new Date(result.expiresAt).getTime() - Date.now()) / 1000),
            );
            setTimeLeft(nextTimeLeft);
          }
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

    loadDetail();
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  useEffect(() => {
    if (!entry || entry.status !== "ACTIVE" || !entry.expiresAt) return;

    const timer = setInterval(() => {
      const next = Math.max(
        0,
        Math.floor((new Date(entry.expiresAt as string).getTime() - Date.now()) / 1000),
      );
      setTimeLeft(next);
    }, 1000);

    return () => clearInterval(timer);
  }, [entry]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  if (loading) {
    return <div className="p-6 text-gray-500">대기열 정보를 불러오는 중...</div>;
  }

  if (error || !entry) {
    return <div className="p-6 text-red-600">{error || "페이지 없습니다"}</div>;
  }

  const isActive = entry.status === "ACTIVE";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 px-4 py-4 flex items-center border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="mr-4">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl text-gray-900">대기열 상세</h1>
      </div>

      <div className="p-6">
        {/* Status Badge */}
        <div className="flex justify-center mb-8">
          {isActive ? (
            <div className="bg-orange-100 text-orange-700 px-6 py-3 rounded-full">
              계약 가능
            </div>
          ) : (
            <div className="bg-yellow-100 text-yellow-700 px-6 py-3 rounded-full">
              대기 중
            </div>
          )}
        </div>

        {/* My Position */}
        <div className="bg-gradient-to-br from-[#1E3A8A] to-[#3B5BA5] rounded-3xl p-8 text-white mb-6 text-center">
          <p className="text-lg mb-2 opacity-90">내 순번</p>
          <p className="text-6xl mb-4">{entry.queuePosition}</p>
          <p className="text-sm opacity-80">
            총 {entry.aheadCount + 1}명 대기 중
          </p>
        </div>

        {/* Timer for Active Status */}
        {isActive && (
          <div className="bg-orange-50 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-center mb-3">
              <Clock className="w-6 h-6 text-orange-600 mr-2" />
              <h3 className="text-lg text-orange-900">계약 가능 시간</h3>
            </div>
            <p className="text-4xl text-center text-orange-600 mb-2">
              {formatTime(timeLeft)}
            </p>
            <p className="text-sm text-center text-orange-700">
              시간 내에 계약을 진행해주세요
            </p>
          </div>
        )}

        {/* Facility Info */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-6 space-y-4">
          <h3 className="text-lg text-gray-900 mb-3">신청 정보</h3>
          <div className="flex justify-between">
            <span className="text-gray-600">시설명</span>
            <span className="text-gray-900">{entry.facilityName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">좌석</span>
            <span className="text-gray-900">{entry.unitCode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">위치</span>
            <span className="text-gray-900">시설 상세에서 확인</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">가격</span>
            <span className="text-[#1E3A8A]">가격 정보 준비 중</span>
          </div>
        </div>

        {/* Expected Wait Info */}
        {!isActive && (
          <div className="bg-blue-50 rounded-2xl p-6 mb-6">
            <h3 className="text-lg text-blue-900 mb-2">예상 안내</h3>
            <p className="text-sm text-blue-700">
              앞에 {entry.aheadCount}명이 대기 중입니다.
              <br />
              순번이 되면 알림을 드립니다.
            </p>
          </div>
        )}

        {/* Action Button */}
        {isActive && (
          <Button
            onClick={() => navigate(`/contract/${entry.unitId}?queueId=${entry.id}`)}
            className="w-full h-14 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white rounded-xl"
          >
            계약하기
          </Button>
        )}
      </div>
    </div>
  );
}

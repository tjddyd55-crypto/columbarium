import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { api, type SeatSummary } from "../../shared/api/service";
import { ApiError } from "../../shared/api/http";

type SeatStatus = "AVAILABLE" | "WAITING" | "SOLD";

interface Seat {
  id: string;
  row: string;
  number: number;
  status: SeatStatus;
  price: number;
  waitingCount?: number;
}

const statusColors = {
  AVAILABLE: "bg-green-500",
  WAITING: "bg-yellow-500",
  SOLD: "bg-red-500",
};

const statusLabels = {
  AVAILABLE: "예약가능",
  WAITING: "대기중",
  SOLD: "판매완료",
};

function parseSeatCode(code: string): { row: string; number: number } {
  const match = code.match(/^([A-Za-z]+)-?(\d+)$/);
  if (!match) return { row: "기타", number: 0 };
  return {
    row: match[1].toUpperCase(),
    number: Number(match[2]),
  };
}

async function mapSeat(seat: SeatSummary): Promise<Seat> {
  const status = await api.getSeatStatus(seat.seat_id);
  const parsed = parseSeatCode(seat.code);
  const uiStatus: SeatStatus = status.status === "ACTIVE" ? "SOLD" : status.status;
  return {
    id: seat.seat_id,
    row: parsed.row,
    number: parsed.number,
    status: uiStatus,
    price: 25000000,
    waitingCount: status.waitingCount,
  };
}

export function SeatSelectionPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!id) {
      setError("페이지 없습니다");
      setLoading(false);
      return;
    }

    async function loadSeats() {
      try {
        const baseSeats = await api.listFacilitySeats(id);
        const mapped = await Promise.all(baseSeats.map((seat) => mapSeat(seat)));
        if (!cancelled) {
          setSeats(mapped.sort((a, b) => a.row.localeCompare(b.row) || a.number - b.number));
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError) {
            setError(err.message);
          } else {
            setError("좌석 정보를 불러오지 못했습니다.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSeats();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const rows = useMemo(
    () => Array.from(new Set(seats.map((seat) => seat.row))).filter((row) => row !== "기타"),
    [seats],
  );

  const handleSeatClick = (seat: Seat) => {
    if (seat.status !== "SOLD") {
      setSelectedSeat(seat);
    }
  };

  const handleJoinWaitlist = async () => {
    if (selectedSeat) {
      setActionLoading(true);
      try {
        const created = await api.joinQueue(selectedSeat.id);
        navigate(`/waitlist/${created.id}`);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          navigate("/login");
          return;
        }
        alert(err instanceof ApiError ? err.message : "대기열 신청에 실패했습니다.");
      } finally {
        setActionLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 px-4 py-4 flex items-center border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="mr-4">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl text-gray-900">좌석 선택</h1>
      </div>

      <div className="p-6">
        {loading ? (
          <p className="text-sm text-gray-500">좌석 정보를 불러오는 중...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <>
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-gray-200">
          {Object.entries(statusLabels).map(([status, label]) => (
            <div key={status} className="flex items-center">
              <div
                className={`w-4 h-4 rounded ${
                  statusColors[status as SeatStatus]
                } mr-2`}
              />
              <span className="text-sm text-gray-700">{label}</span>
            </div>
          ))}
        </div>

        {/* Seat Grid */}
        <div className="mb-6">
          <div className="bg-gray-100 rounded-lg p-4 mb-4 text-center text-sm text-gray-600">
            전면
          </div>

          <div className="space-y-3">
            {rows.map((row) => (
              <div key={row} className="flex items-center gap-2">
                <div className="w-6 text-center text-gray-600">{row}</div>
                <div className="flex gap-2 flex-1 justify-center">
                  {seats
                    .filter((seat) => seat.row === row)
                    .map((seat) => (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat)}
                        disabled={seat.status === "SOLD"}
                        className={`w-10 h-10 rounded-lg ${
                          statusColors[seat.status]
                        } ${
                          seat.status === "SOLD"
                            ? "opacity-40 cursor-not-allowed"
                            : "hover:opacity-80 transition-all"
                        } ${
                          selectedSeat?.id === seat.id
                            ? "ring-4 ring-[#1E3A8A] scale-110 shadow-lg"
                            : ""
                        } flex items-center justify-center text-white text-xs`}
                      >
                        {seat.number}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
          </>
        )}
      </div>

      {/* Seat Detail Modal */}
      {selectedSeat && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl text-gray-900">좌석 정보</h3>
              <button onClick={() => setSelectedSeat(null)}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">위치</span>
                <span className="text-gray-900">{selectedSeat.id}</span>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">가격</span>
                  <div className="text-right">
                    <p className="text-xl font-bold text-[#1E3A8A]">
                      {selectedSeat.price.toLocaleString()}원
                    </p>
                    <p className="text-sm text-gray-500">(30년 기준 · 재판매 가능)</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">상태</span>
                <span className="text-gray-900">
                  {statusLabels[selectedSeat.status]}
                </span>
              </div>
              {selectedSeat.waitingCount && selectedSeat.waitingCount > 0 && (
                <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 -mx-1">
                  <p className="text-lg font-semibold text-orange-600">
                    현재 {selectedSeat.waitingCount}명 대기 중 · 예상 {selectedSeat.waitingCount * 2}~{selectedSeat.waitingCount * 3}개월 소요
                  </p>
                </div>
              )}
            </div>

            {/* 희소성 메시지 */}
            {selectedSeat.status !== "SOLD" && (
              <p className="text-sm text-gray-600 text-center mb-2">
                이 구역은 빠르게 마감되고 있습니다
              </p>
            )}

            {selectedSeat.status === "AVAILABLE" && (
              <Button
                onClick={handleJoinWaitlist}
                disabled={actionLoading}
                className="w-full h-14 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white rounded-xl text-lg font-semibold"
              >
                {actionLoading ? "신청 중..." : "지금 신청해서 순번 잡기"}
              </Button>
            )}
            {selectedSeat.status === "WAITING" && (
              <>
                <Button
                  onClick={handleJoinWaitlist}
                  disabled={actionLoading}
                  className="w-full h-14 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-lg font-semibold"
                >
                  {actionLoading ? "신청 중..." : "대기열 등록하고 순번 확보하기"}
                </Button>
              </>
            )}
            {selectedSeat.status === "SOLD" && (
              <p className="text-center text-sm text-gray-500">
                이미 분양 완료된 자리입니다
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
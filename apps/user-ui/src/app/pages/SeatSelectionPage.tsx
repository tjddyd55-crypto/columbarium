import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { api, type SeatWithStatus } from "../../shared/api/service";
import { ApiError } from "../../shared/api/http";

const statusColors: Record<"GREEN" | "YELLOW" | "RED", string> = {
  GREEN: "bg-green-500",
  YELLOW: "bg-yellow-500",
  RED: "bg-red-500",
};

const statusLabels: Record<"GREEN" | "YELLOW" | "RED", string> = {
  GREEN: "즉시 구매 가능",
  YELLOW: "대기 가능",
  RED: "구매/대기 불가",
};

export function SeatSelectionPage() {
  const navigate = useNavigate();
  const { id: facilityId } = useParams();
  const [seats, setSeats] = useState<SeatWithStatus[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<SeatWithStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!facilityId) {
      setError("페이지 없습니다");
      setLoading(false);
      return;
    }

    async function loadSeats() {
      try {
        const list = await api.listFacilitySeats(facilityId);
        if (!cancelled) setSeats(list);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "좌석 정보를 불러오지 못했습니다.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSeats();
    return () => { cancelled = true; };
  }, [facilityId]);

  const rows = useMemo(() => {
    if (!seats.length) return [];
    const maxRow = Math.max(...seats.map((s) => s.row));
    return Array.from({ length: maxRow }, (_, i) => i + 1);
  }, [seats]);

  const cols = useMemo(() => {
    if (!seats.length) return [];
    const maxCol = Math.max(...seats.map((s) => s.col));
    return Array.from({ length: maxCol }, (_, i) => i + 1);
  }, [seats]);

  const seatByPos = useMemo(() => {
    const m = new Map<string, SeatWithStatus>();
    seats.forEach((s) => m.set(`${s.row}-${s.col}`, s));
    return m;
  }, [seats]);

  const handleSeatClick = (seat: SeatWithStatus) => {
    setSelectedSeat(seat);
  };

  const handleReserve = async () => {
    if (!selectedSeat || selectedSeat.status !== "GREEN") return;
    setActionLoading(true);
    try {
      await api.reserveSeat(String(selectedSeat.id));
      alert("즉시 구매가 완료되었습니다.");
      setSelectedSeat(null);
      if (facilityId) {
        const list = await api.listFacilitySeats(facilityId);
        setSeats(list);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        navigate("/login");
        return;
      }
      alert(err instanceof ApiError ? err.message : "즉시 구매에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleWait = async () => {
    if (!selectedSeat || selectedSeat.status !== "YELLOW") return;
    setActionLoading(true);
    try {
      await api.waitSeat(String(selectedSeat.id));
      alert("대기 등록이 완료되었습니다.");
      setSelectedSeat(null);
      if (facilityId) {
        const list = await api.listFacilitySeats(facilityId);
        setSeats(list);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        navigate("/login");
        return;
      }
      alert(err instanceof ApiError ? err.message : "대기 등록에 실패했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
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
            <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-gray-200">
              {(Object.keys(statusLabels) as Array<keyof typeof statusLabels>).map((status) => (
                <div key={status} className="flex items-center">
                  <div className={`w-4 h-4 rounded ${statusColors[status]} mr-2`} />
                  <span className="text-sm text-gray-700">{statusLabels[status]}</span>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <div className="bg-gray-100 rounded-lg p-4 mb-4 text-center text-sm text-gray-600">전면</div>
              <div className="space-y-2">
                {rows.map((row) => (
                  <div key={row} className="flex items-center gap-2">
                    <div className="w-6 text-center text-gray-600 text-sm">{row}</div>
                    <div className="flex gap-1 flex-wrap">
                      {cols.map((col) => {
                        const seat = seatByPos.get(`${row}-${col}`);
                        if (!seat) return null;
                        const isRed = seat.status === "RED";
                        const isSelected = selectedSeat?.id === seat.id;
                        return (
                          <button
                            key={seat.id}
                            type="button"
                            onClick={() => handleSeatClick(seat)}
                            disabled={isRed}
                            className={`w-10 h-10 rounded-lg ${statusColors[seat.status]} ${
                              isRed ? "opacity-50 cursor-not-allowed" : "hover:opacity-90 transition-all"
                            } ${isSelected ? "ring-4 ring-[#1E3A8A] scale-110 shadow-lg" : ""} flex items-center justify-center text-white text-xs`}
                          >
                            {col}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {selectedSeat && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl text-gray-900">좌석 정보</h3>
              <button type="button" onClick={() => setSelectedSeat(null)}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">위치</span>
                <span className="text-gray-900">{selectedSeat.row}행 {selectedSeat.col}열</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">가격</span>
                <span className="font-semibold">{selectedSeat.price.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">상태</span>
                <span className="text-gray-900">{statusLabels[selectedSeat.status]}</span>
              </div>
              {selectedSeat.waitingCount > 0 && (
                <p className="text-sm text-amber-700">현재 {selectedSeat.waitingCount}명 대기 중</p>
              )}
            </div>
            {selectedSeat.status === "GREEN" && (
              <Button
                onClick={handleReserve}
                disabled={actionLoading}
                className="w-full h-14 bg-green-600 hover:bg-green-700 text-white rounded-xl text-lg font-semibold"
              >
                {actionLoading ? "처리 중..." : "즉시 구매"}
              </Button>
            )}
            {selectedSeat.status === "YELLOW" && (
              <Button
                onClick={handleWait}
                disabled={actionLoading}
                className="w-full h-14 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-lg font-semibold"
              >
                {actionLoading ? "처리 중..." : "대기 등록"}
              </Button>
            )}
            {selectedSeat.status === "RED" && (
              <p className="text-center text-gray-500">구매 및 대기 등록이 불가한 좌석입니다.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { api, type SiteFacilityRow, type SectionRow, type AdminSeatRow } from '../../lib/api';

export default function SeatManagementPage() {
  const [facilities, setFacilities] = useState<SiteFacilityRow[]>([]);
  const [sections, setSections] = useState<SectionRow[]>([]);
  const [seats, setSeats] = useState<AdminSeatRow[]>([]);
  const [facilityId, setFacilityId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [editingPrice, setEditingPrice] = useState<{ seatId: string; value: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    api.adminSite.getFacilities().then(setFacilities).catch(() => setFacilities([]));
  }, []);

  useEffect(() => {
    if (!facilityId) {
      setSections([]);
      setSectionId('');
      setSeats([]);
      return;
    }
    api.adminSite.getSections(facilityId).then(setSections).catch(() => setSections([]));
    setSectionId('');
    setSeats([]);
  }, [facilityId]);

  useEffect(() => {
    if (!sectionId) {
      setSeats([]);
      return;
    }
    api.adminSite.getSeats(sectionId).then(setSeats).catch(() => setSeats([]));
  }, [sectionId]);

  const handleSavePrice = async (seatId: string, price: number) => {
    if (Number.isNaN(price) || price < 0) return;
    setLoading(true);
    setMessage(null);
    try {
      await api.adminSite.updateSeatPrice(seatId, price);
      setMessage({ type: 'ok', text: '가격이 저장되었습니다.' });
      setEditingPrice(null);
      if (sectionId) api.adminSite.getSeats(sectionId).then(setSeats);
    } catch (err) {
      setMessage({ type: 'err', text: err instanceof Error ? err.message : '저장에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async (seatId: string, isBlocked: boolean) => {
    setLoading(true);
    setMessage(null);
    try {
      await api.adminSite.blockSeat(seatId, isBlocked);
      setMessage({ type: 'ok', text: isBlocked ? '좌석을 차단했습니다.' : '좌석 차단을 해제했습니다.' });
      if (sectionId) api.adminSite.getSeats(sectionId).then(setSeats);
    } catch (err) {
      setMessage({ type: 'err', text: err instanceof Error ? err.message : '처리에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const rows = seats.length ? Math.max(...seats.map((s) => s.row)) : 0;
  const cols = seats.length ? Math.max(...seats.map((s) => s.col)) : 0;
  const byPos = new Map(seats.map((s) => [`${s.row}-${s.col}`, s]));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#1E293B]">좌석 관리</h3>
        <p className="text-sm text-gray-600">구역을 선택한 뒤 좌석별 가격 수정·차단/해제를 할 수 있습니다.</p>
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">시설</label>
          <select
            value={facilityId}
            onChange={(e) => setFacilityId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 min-w-[200px]"
          >
            <option value="">선택</option>
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">구역</label>
          <select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 min-w-[120px]"
          >
            <option value="">선택</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.seatCount}석)</option>
            ))}
          </select>
        </div>
      </div>

      {message && (
        <p className={message.type === 'ok' ? 'text-sm text-green-600' : 'text-sm text-red-600'}>{message.text}</p>
      )}

      {sectionId && (
        <div className="bg-white rounded-lg p-4 border border-[#E5E7EB]">
          <p className="text-sm text-gray-600 mb-3">전면</p>
          <div className="overflow-x-auto">
            <div className="inline-block space-y-1">
              {Array.from({ length: rows }, (_, r) => r + 1).map((row) => (
                <div key={row} className="flex items-center gap-1">
                  <span className="w-6 text-center text-sm text-gray-500">{row}</span>
                  {Array.from({ length: cols }, (_, c) => c + 1).map((col) => {
                    const seat = byPos.get(`${row}-${col}`);
                    if (!seat) return <div key={`${row}-${col}`} className="w-14 h-10" />;
                    const isEditing = editingPrice?.seatId === seat.id;
                    return (
                      <div
                        key={seat.id}
                        className={`w-14 h-10 rounded flex flex-col items-center justify-center text-xs border ${
                          seat.isBlocked ? 'bg-red-200 border-red-400' : 'bg-gray-100 border-gray-300'
                        }`}
                      >
                        {isEditing ? (
                          <input
                            type="number"
                            value={editingPrice.value}
                            onChange={(e) => setEditingPrice({ seatId: seat.id, value: e.target.value })}
                            onBlur={() => {
                              const v = parseInt(editingPrice.value, 10);
                              if (!Number.isNaN(v)) handleSavePrice(seat.id, v);
                              setEditingPrice(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const v = parseInt(editingPrice.value, 10);
                                if (!Number.isNaN(v)) handleSavePrice(seat.id, v);
                                setEditingPrice(null);
                              }
                            }}
                            className="w-12 text-center py-0.5"
                            autoFocus
                          />
                        ) : (
                          <>
                            <span className="font-medium">{seat.row}-{seat.col}</span>
                            <span className="text-gray-600">{seat.price > 0 ? `${(seat.price / 10000).toFixed(0)}만` : '-'}</span>
                          </>
                        )}
                        <div className="flex gap-0.5 mt-0.5">
                          <button
                            type="button"
                            onClick={() => setEditingPrice({ seatId: seat.id, value: String(seat.price) })}
                            className="text-[10px] px-1 text-blue-600"
                          >
                            가격
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBlock(seat.id, !seat.isBlocked)}
                            className="text-[10px] px-1 text-red-600"
                          >
                            {seat.isBlocked ? '해제' : '차단'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

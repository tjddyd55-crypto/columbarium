import { useEffect, useState } from 'react';
import { type SiteFacilityRow, type SectionRow } from '../../lib/api';
import { facilityAdminApi } from '../../lib/facilityAdminApi';
import { isCompanyScopedOperator } from '../../lib/operatorScope';

export default function SectionCreatePage() {
  const scoped = isCompanyScopedOperator();
  const [facilities, setFacilities] = useState<SiteFacilityRow[]>([]);
  const [facilityId, setFacilityId] = useState('');
  const [name, setName] = useState('');
  const [rows, setRows] = useState(6);
  const [cols, setCols] = useState(8);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [lastCreated, setLastCreated] = useState<{ name: string; seatCount: number } | null>(null);

  useEffect(() => {
    facilityAdminApi.getFacilities(scoped).then(setFacilities).catch(() => setFacilities([]));
  }, [scoped]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facilityId || !name.trim()) {
      setMessage({ type: 'err', text: '시설과 구역명을 입력하세요.' });
      return;
    }
    if (rows < 1 || cols < 1) {
      setMessage({ type: 'err', text: '행/열은 1 이상이어야 합니다.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    setLastCreated(null);
    try {
      const res = await facilityAdminApi.createSection(scoped, {
        facilityId: Number(facilityId),
        name: name.trim(),
        rows,
        cols,
      });
      setMessage({ type: 'ok', text: `구역이 생성되었습니다. 좌석 ${res.seatCount}개 생성됨.` });
      setLastCreated({ name: res.name, seatCount: res.seatCount });
      setName('');
    } catch (err) {
      setMessage({ type: 'err', text: err instanceof Error ? err.message : '생성에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#1E293B]">구역 생성</h3>
        <p className="text-sm text-gray-600">시설을 선택하고 구역명·행·열을 입력하면 rows × cols 만큼 좌석이 자동 생성됩니다.</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 border border-[#E5E7EB] max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">시설</label>
          <select
            value={facilityId}
            onChange={(e) => setFacilityId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3B82F6]"
          >
            <option value="">선택</option>
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">구역명 (A, B, 1층 등)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="예: A"
          />
        </div>
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">행(rows)</label>
            <input
              type="number"
              min={1}
              value={rows}
              onChange={(e) => setRows(Number(e.target.value) || 1)}
              className="w-24 border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">열(cols)</label>
            <input
              type="number"
              min={1}
              value={cols}
              onChange={(e) => setCols(Number(e.target.value) || 1)}
              className="w-24 border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>
        <p className="text-sm text-gray-500">생성될 좌석 수: {rows * cols}개</p>
        {message && (
          <p className={message.type === 'ok' ? 'text-sm text-green-600' : 'text-sm text-red-600'}>{message.text}</p>
        )}
        {lastCreated && (
          <p className="text-sm text-green-600">구역 &quot;{lastCreated.name}&quot; — 좌석 {lastCreated.seatCount}개 생성됨</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="bg-[#3B82F6] text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? '생성 중...' : '구역 생성'}
        </button>
      </form>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { type SiteFacilityRow, type PolicyRow } from '../../lib/api';
import { facilityAdminApi } from '../../lib/facilityAdminApi';
import { isCompanyScopedOperator } from '../../lib/operatorScope';

export default function PolicySettingPage() {
  const scoped = isCompanyScopedOperator();
  const [facilities, setFacilities] = useState<SiteFacilityRow[]>([]);
  const [facilityId, setFacilityId] = useState('');
  const [policy, setPolicy] = useState<PolicyRow | null>(null);
  const [maxWaiting, setMaxWaiting] = useState<string>('');
  const [maxYears, setMaxYears] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    facilityAdminApi.getFacilities(scoped).then(setFacilities).catch(() => setFacilities([]));
  }, [scoped]);

  useEffect(() => {
    if (!facilityId) {
      setPolicy(null);
      setMaxWaiting('');
      setMaxYears('');
      return;
    }
    facilityAdminApi.getPolicy(scoped, facilityId).then((p) => {
      setPolicy(p ?? null);
      setMaxWaiting(p?.maxWaiting != null ? String(p.maxWaiting) : '');
      setMaxYears(p?.maxYears != null ? String(p.maxYears) : '');
    }).catch(() => {
      setPolicy(null);
      setMaxWaiting('');
      setMaxYears('');
    });
  }, [facilityId, scoped]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facilityId) {
      setMessage({ type: 'err', text: '시설을 선택하세요.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      await facilityAdminApi.upsertPolicy(scoped, {
        facilityId: Number(facilityId),
        maxWaiting: maxWaiting.trim() ? parseInt(maxWaiting, 10) : undefined,
        maxYears: maxYears.trim() ? parseInt(maxYears, 10) : undefined,
      });
      setMessage({ type: 'ok', text: '정책이 저장되었습니다.' });
      if (facilityId) facilityAdminApi.getPolicy(scoped, facilityId).then((p) => setPolicy(p ?? null));
    } catch (err) {
      setMessage({ type: 'err', text: err instanceof Error ? err.message : '저장에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#1E293B]">정책 설정</h3>
        <p className="text-sm text-gray-600">시설별 대기 인원 상한(maxWaiting), 이용 연한(maxYears) 등을 설정합니다.</p>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">대기 인원 상한 (maxWaiting)</label>
          <input
            type="number"
            min={0}
            value={maxWaiting}
            onChange={(e) => setMaxWaiting(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="예: 3"
          />
          <p className="text-xs text-gray-500 mt-1">비우면 제한 없음. 숫자 입력 시 해당 좌석 대기 인원이 이 수 이상이면 RED 처리.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이용 연한 (maxYears)</label>
          <input
            type="number"
            min={0}
            value={maxYears}
            onChange={(e) => setMaxYears(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="예: 30"
          />
        </div>
        {message && (
          <p className={message.type === 'ok' ? 'text-sm text-green-600' : 'text-sm text-red-600'}>{message.text}</p>
        )}
        <button
          type="submit"
          disabled={loading || !facilityId}
          className="bg-[#3B82F6] text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? '저장 중...' : '저장'}
        </button>
      </form>
    </div>
  );
}

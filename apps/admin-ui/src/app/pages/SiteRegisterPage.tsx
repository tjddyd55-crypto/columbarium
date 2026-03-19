import { useEffect, useState } from 'react';
import { api, type CompanyRow, type SiteFacilityRow } from '../../lib/api';

export default function SiteRegisterPage() {
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    api.adminSite.getCompanies().then(setCompanies).catch(() => setCompanies([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim() || !companyId) {
      setMessage({ type: 'err', text: '시설명, 주소, 사업자를 입력/선택하세요.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.adminSite.createFacility({
        name: name.trim(),
        address: address.trim(),
        companyId: Number(companyId),
      });
      setMessage({ type: 'ok', text: `등록되었습니다. (ID: ${res.id})` });
      setName('');
      setAddress('');
    } catch (err) {
      setMessage({ type: 'err', text: err instanceof Error ? err.message : '등록에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#1E293B]">시설 등록</h3>
        <p className="text-sm text-gray-600">시설명, 주소, 사업자를 입력하여 등록합니다.</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 border border-[#E5E7EB] max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">사업자</label>
          <select
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3B82F6]"
          >
            <option value="">선택</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">시설명</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="예: 서울 강남 봉안당"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="예: 서울특별시 강남구 테헤란로 123"
          />
        </div>
        {message && (
          <p className={message.type === 'ok' ? 'text-sm text-green-600' : 'text-sm text-red-600'}>{message.text}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="bg-[#3B82F6] text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? '등록 중...' : '등록'}
        </button>
      </form>
    </div>
  );
}

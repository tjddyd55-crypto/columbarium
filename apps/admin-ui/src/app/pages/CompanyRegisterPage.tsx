import { useState } from 'react';
import { api } from '../../lib/api';

type Tab = 'simple' | 'onboard';

export default function CompanyRegisterPage() {
  const [tab, setTab] = useState<Tab>('onboard');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [cName, setCName] = useState('');
  const [opLogin, setOpLogin] = useState('');
  const [opPass, setOpPass] = useState('');
  const [opName, setOpName] = useState('');
  const [opPhone, setOpPhone] = useState('');
  const [opBirth, setOpBirth] = useState('');
  const [onboardResult, setOnboardResult] = useState<string | null>(null);

  const handleSimple = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage({ type: 'err', text: '사업자명을 입력하세요.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.adminSite.createCompany({ name: name.trim() });
      setMessage({ type: 'ok', text: `등록되었습니다. (ID: ${res.id})` });
      setName('');
    } catch (err) {
      setMessage({ type: 'err', text: err instanceof Error ? err.message : '등록에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName.trim() || !opLogin.trim() || !opName.trim() || !opPhone.trim()) {
      setMessage({ type: 'err', text: '사업자명, 운영자 로그인ID, 이름, 연락처는 필수입니다.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    setOnboardResult(null);
    try {
      const res = await api.onboarding.companyWithOperator({
        companyName: cName.trim(),
        operatorLoginId: opLogin.trim(),
        operatorPassword: opPass.trim() || undefined,
        operatorName: opName.trim(),
        operatorPhone: opPhone.trim(),
        operatorBirthDate: opBirth.trim() || undefined,
      });
      setOnboardResult(
        `Company: ${res.company.name} (id=${res.company.id})\n운영자 로그인: ${res.operatorAccount.loginId}\n초기 비밀번호: ${res.operatorAccount.initialPassword}\n(이 화면을 닫기 전에 복사해 두세요)`,
      );
      setMessage({ type: 'ok', text: '사업자 및 운영자 계정이 생성되었습니다.' });
    } catch (err) {
      setMessage({ type: 'err', text: err instanceof Error ? err.message : '통합 등록에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#1E293B]">사업자 등록</h3>
        <p className="text-sm text-gray-600">단순 등록 또는 사업자+운영자(OPERATOR) 통합 발급</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => setTab('onboard')}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium ${
            tab === 'onboard' ? 'bg-[#3B82F6] text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          통합 등록 (권장)
        </button>
        <button
          type="button"
          onClick={() => setTab('simple')}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium ${
            tab === 'simple' ? 'bg-[#3B82F6] text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          사업자만
        </button>
      </div>

      {tab === 'simple' && (
        <form onSubmit={handleSimple} className="bg-white rounded-lg p-6 border border-[#E5E7EB] max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">사업자명</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="예: 서울 부동산"
            />
          </div>
          {message && tab === 'simple' && (
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
      )}

      {tab === 'onboard' && (
        <form onSubmit={handleOnboard} className="bg-white rounded-lg p-6 border border-[#E5E7EB] max-w-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">사업자(Company) 이름</label>
            <input
              type="text"
              value={cName}
              onChange={(e) => setCName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">운영자 로그인 ID</label>
              <input
                type="text"
                value={opLogin}
                onChange={(e) => setOpLogin(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">초기 비밀번호 (비우면 자동)</label>
              <input
                type="password"
                value={opPass}
                onChange={(e) => setOpPass(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">운영자 이름</label>
            <input type="text" value={opName} onChange={(e) => setOpName(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
            <input type="text" value={opPhone} onChange={(e) => setOpPhone(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">생년월일 (선택, YYYY-MM-DD)</label>
            <input type="text" value={opBirth} onChange={(e) => setOpBirth(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          </div>
          {message && (
            <p className={message.type === 'ok' ? 'text-sm text-green-600' : 'text-sm text-red-600'}>{message.text}</p>
          )}
          {onboardResult && (
            <pre className="text-xs bg-amber-50 border border-amber-200 rounded-lg p-3 whitespace-pre-wrap">{onboardResult}</pre>
          )}
          <button
            type="submit"
            disabled={loading}
            className="bg-[#3B82F6] text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '처리 중...' : '통합 등록 실행'}
          </button>
        </form>
      )}
    </div>
  );
}

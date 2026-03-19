import { useEffect, useState } from 'react';
import { api, type CompanyRow } from '../../lib/api';

export default function AgentOnboardPage() {
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [companyId, setCompanyId] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [agentDisplayName, setAgentDisplayName] = useState('');
  const [commissionRate, setCommissionRate] = useState('5');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [resultBox, setResultBox] = useState<string | null>(null);

  useEffect(() => {
    api.adminSite.getCompanies().then(setCompanies).catch(() => setCompanies([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rate = parseInt(commissionRate, 10);
    if (!companyId || !loginId.trim() || !userName.trim() || !phone.trim() || !agentDisplayName.trim()) {
      setMessage({ type: 'err', text: '사업자, 로그인ID, 사용자명, 연락처, 에이전트 표시명은 필수입니다.' });
      return;
    }
    if (Number.isNaN(rate) || rate < 0 || rate > 100) {
      setMessage({ type: 'err', text: '커미션율은 0~100 정수입니다.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    setResultBox(null);
    try {
      const res = await api.onboarding.agentUser({
        companyId,
        loginId: loginId.trim(),
        password: password.trim() || undefined,
        userName: userName.trim(),
        phone: phone.trim(),
        birthDate: birthDate.trim() || undefined,
        agentDisplayName: agentDisplayName.trim(),
        commissionRate: rate,
      });
      setResultBox(
        `에이전트 코드: ${res.agent.code}\n로그인 ID: ${res.agentAccount.loginId}\n초기 비밀번호: ${res.agentAccount.initialPassword}\n(복사 후 보관)`,
      );
      setMessage({ type: 'ok', text: 'AGENT 계정이 발급되었습니다.' });
    } catch (err) {
      setMessage({ type: 'err', text: err instanceof Error ? err.message : '발급에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#1E293B]">에이전트(AGENT) 발급</h3>
        <p className="text-sm text-gray-600">User + Agent + 자동 코드 + 커미션율을 한 번에 생성합니다.</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 border border-[#E5E7EB] max-w-lg space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">소속 사업자(Company)</label>
          <select
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">선택</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">로그인 ID</label>
            <input
              type="text"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">초기 비밀번호 (선택)</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">사용자 실명 (User.name)</label>
          <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">생년월일 (선택)</label>
          <input type="text" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="YYYY-MM-DD" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">에이전트 표시명 (Agent.name)</label>
          <input type="text" value={agentDisplayName} onChange={(e) => setAgentDisplayName(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">커미션율 (%)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={commissionRate}
            onChange={(e) => setCommissionRate(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        {message && <p className={message.type === 'ok' ? 'text-sm text-green-600' : 'text-sm text-red-600'}>{message.text}</p>}
        {resultBox && <pre className="text-xs bg-amber-50 border border-amber-200 rounded-lg p-3 whitespace-pre-wrap">{resultBox}</pre>}
        <button type="submit" disabled={loading} className="bg-[#3B82F6] text-white px-4 py-2 rounded-lg disabled:opacity-50">
          {loading ? '처리 중...' : '발급'}
        </button>
      </form>
    </div>
  );
}

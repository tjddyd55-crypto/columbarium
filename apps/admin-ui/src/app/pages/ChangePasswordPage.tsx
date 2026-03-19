import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Lock } from 'lucide-react';
import { api, setAuthStorage, getStoredToken } from '../../lib/api';

const ADMIN_TOKEN_KEY = 'admin_token';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminFlow = location.pathname.startsWith('/admin/change-password');

  const [current, setCurrent] = useState('');
  const [nextPw, setNextPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const t = getStoredToken();
    if (!t) {
      navigate(isAdminFlow ? '/admin/login' : '/login', { replace: true });
    }
  }, [isAdminFlow, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (nextPw.length < 8) {
      setError('새 비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (nextPw !== confirm) {
      setError('새 비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.auth.changePassword({
        current_password: current,
        new_password: nextPw,
      });
      const token = res.accessToken ?? res.token;
      const user = res.user;
      if (!token || !user) throw new Error('응답이 올바르지 않습니다.');
      setAuthStorage(token, user);
      if (isAdminFlow) {
        localStorage.setItem(ADMIN_TOKEN_KEY, token);
      }
      navigate(isAdminFlow ? '/admin' : '/', { replace: true });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : typeof err === 'string' ? err : '비밀번호 변경에 실패했습니다.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-secondary-dark)] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--color-primary)] mb-2">비밀번호 변경</h1>
          <p className="text-gray-600 text-sm">보안을 위해 새 비밀번호를 설정해 주세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">현재 비밀번호</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                autoComplete="current-password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">새 비밀번호 (8자 이상)</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                autoComplete="new-password"
                value={nextPw}
                onChange={(e) => setNextPw(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                required
                minLength={8}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">새 비밀번호 확인</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                required
                minLength={8}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg font-medium hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50"
          >
            {submitting ? '처리 중...' : '변경하기'}
          </button>
        </form>
      </div>
    </div>
  );
}

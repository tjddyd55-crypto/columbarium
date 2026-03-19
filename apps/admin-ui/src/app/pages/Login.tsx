import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Lock, User } from 'lucide-react';
import { api, setAuthStorage } from '../../lib/api';

const ADMIN_TOKEN_KEY = 'admin_token';

export default function Login() {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await api.auth.login({ login_id: loginId.trim(), password });
      const token = res.accessToken ?? res.token;
      const user = res.user;
      if (!token || !user) throw new Error('Invalid login response');
      if (user.role !== 'SUPER_ADMIN' && user.role !== 'OPERATOR_ADMIN') {
        setError('관리자만 접근할 수 있습니다.');
        return;
      }
      setAuthStorage(token, user);
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
      navigate('/admin');
    } catch (err) {
      const msg = err instanceof Error ? err.message : typeof err === 'string' ? err : '로그인에 실패했습니다.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-secondary-dark)] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[var(--color-primary)] mb-2">봉안당</h1>
          <p className="text-gray-600">관리자 대시보드</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">아이디</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                autoComplete="username"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                placeholder="아이디 (예: superadmin)"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg font-medium hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50"
          >
            {submitting ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { api, setAuthStorage } from '../../lib/api';

export default function UserLoginPage() {
  const navigate = useNavigate();
  const [login_id, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!login_id.trim() || !password) {
      setError('아이디와 비밀번호를 입력하세요.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.auth.login({ login_id: login_id.trim(), password });
      setAuthStorage(res.token, res.user);
      navigate('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : '로그인에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[var(--color-primary)]">로그인</h1>
      <form onSubmit={handleSubmit} className="bg-white border border-[var(--color-border)] rounded-lg p-6 space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">아이디 *</label>
          <input
            type="text"
            value={login_id}
            onChange={(e) => setLoginId(e.target.value)}
            placeholder="아이디"
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 *</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg"
            required
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg font-medium hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
        >
          {submitting ? '처리 중...' : '로그인'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-600">
        계정이 없으신가요? <Link to="/signup" className="text-[var(--color-primary)] hover:underline">회원가입</Link>
      </p>
    </div>
  );
}

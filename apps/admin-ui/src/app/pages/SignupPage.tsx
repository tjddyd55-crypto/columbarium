import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { api, setAuthStorage } from '../../lib/api';

export default function SignupPage() {
  const navigate = useNavigate();
  const [login_id, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [birth_date, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!login_id.trim()) {
      setError('아이디를 입력하세요.');
      return;
    }
    if (!password) {
      setError('비밀번호를 입력하세요.');
      return;
    }
    if (!phone.trim()) {
      setError('연락처를 입력하세요.');
      return;
    }
    if (!name.trim()) {
      setError('이름을 입력하세요.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.auth.signup({
        login_id: login_id.trim(),
        password,
        name: name.trim(),
        birth_date: birth_date || undefined,
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim() || undefined,
      });
      const token = res.accessToken ?? res.token;
      if (!token || !res.user) throw new Error('가입 응답이 올바르지 않습니다.');
      setAuthStorage(token, res.user);
      navigate('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full px-4 space-y-6">
      <h1 className="text-2xl font-bold text-[var(--color-primary)]">회원가입</h1>
      <form onSubmit={handleSubmit} className="bg-white border border-[var(--color-border)] rounded-lg p-6 space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">아이디 *</label>
          <input
            type="text"
            value={login_id}
            onChange={(e) => setLoginId(e.target.value)}
            placeholder="로그인에 사용할 아이디"
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름"
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">생년월일</label>
          <input
            type="date"
            value={birth_date}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">연락처 *</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="010-0000-0000"
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="주소"
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg font-medium hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
        >
          {submitting ? '처리 중...' : '가입하기'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-600">
        이미 계정이 있으신가요? <Link to="/login" className="text-[var(--color-primary)] hover:underline">로그인</Link>
      </p>
    </div>
  );
}

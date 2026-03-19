import { useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router';
import { getStoredUser, clearAuthStorage, getStoredToken } from '../../lib/api';

export default function UserLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getStoredUser();

  useEffect(() => {
    const token = getStoredToken();
    if (!token || !user?.mustChangePassword) return;
    if (location.pathname === '/change-password') return;
    navigate('/change-password', { replace: true });
  }, [location.pathname, navigate, user?.mustChangePassword]);

  const handleLogout = () => {
    clearAuthStorage();
    navigate('/');
  };

  return (
    <div className="w-full min-h-screen bg-[var(--color-bg)] flex flex-col">
      <header className="sticky top-0 z-10 bg-white border-b border-[var(--color-border)] w-full px-4 py-3 shrink-0">
        <div className="w-full flex items-center justify-between">
          <Link to="/" className="text-lg font-bold text-[var(--color-primary)]">
            낙골당
          </Link>
          <nav className="text-sm text-gray-600 flex items-center gap-4">
            <Link to="/facilities" className="hover:text-[var(--color-primary)]">
              시설 보기
            </Link>
            <Link to="/mypage" className="hover:text-[var(--color-primary)]">
              마이페이지
            </Link>
            {user ? (
              <>
                <span className="text-gray-800">{user.name}</span>
                <button type="button" onClick={handleLogout} className="hover:text-[var(--color-primary)]">
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-[var(--color-primary)]">로그인</Link>
                <Link to="/signup" className="hover:text-[var(--color-primary)]">회원가입</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1 w-full px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

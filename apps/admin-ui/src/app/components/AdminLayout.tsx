import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import Sidebar from './Sidebar';
import Header from './Header';
import { getStoredUser, clearAuthStorage } from '../../lib/api';
import { canAccessAdminPortal } from '../../lib/adminPortalAccess';

/**
 * 관리자 콘솔 레이아웃 + RoleGuard: ADMIN/SUPER_ADMIN 만 /admin/* 하위 라우트 접근.
 * (토큰 없음·역할 불일치 시 /admin/login 으로 replace)
 */
export default function AdminLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const user = getStoredUser();
    if (!token) {
      navigate('/admin/login');
      return;
    }
    if (user?.mustChangePassword === true) {
      navigate('/admin/change-password', { replace: true });
      return;
    }
    if (!canAccessAdminPortal(user)) {
      clearAuthStorage();
      localStorage.removeItem('admin_token');
      navigate('/admin/login', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="flex w-full min-h-screen bg-[var(--color-bg)]">
      <Sidebar />
      <div className="flex-1 w-full flex flex-col overflow-hidden ml-64">
        <Header />
        <main className="flex-1 w-full overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

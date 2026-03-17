import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AdminLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('admin_token');
    if (!isLoggedIn) {
      navigate('/admin/login');
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

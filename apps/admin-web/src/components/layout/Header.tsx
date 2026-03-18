'use client';

import { useRouter } from 'next/navigation';
import { getUser, clearAuth } from '@/lib/auth';

export function Header() {
  const router = useRouter();
  const user = getUser();

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-4">
      <span className="text-gray-600 text-sm">봉안당 플랫폼 관리자</span>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700">{user?.login_id}</span>
        <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-600">{user?.role}</span>
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm text-red-600 hover:underline"
        >
          로그아웃
        </button>
      </div>
    </header>
  );
}

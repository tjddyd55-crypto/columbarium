'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { canAccessOperators } from '@/lib/auth';

const menus: { href: string; label: string; roles?: string[] }[] = [
  { href: '/dashboard', label: '대시보드' },
  { href: '/operators', label: '사업자 관리', roles: ['SUPER_ADMIN'] },
  { href: '/facilities', label: '시설 관리' },
  { href: '/units', label: '좌석(칸) 관리' },
  { href: '/queue', label: '대기열 관리' },
  { href: '/contracts', label: '계약 관리' },
  { href: '/resale', label: '재판매 관리' },
  { href: '/users', label: '회원 관리' },
  { href: '/notifications', label: '알림 관리' },
];

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-gray-900 text-gray-300 min-h-screen">
      <div className="p-4 font-semibold text-white">납골당 관리자</div>
      <nav className="px-2">
        {menus.map((m) => {
          if (m.roles && !m.roles.includes(role)) return null;
          const active = pathname === m.href || pathname.startsWith(m.href + '/');
          return (
            <Link
              key={m.href}
              href={m.href}
              className={`block px-3 py-2 rounded mb-0.5 ${active ? 'bg-gray-700 text-white' : 'hover:bg-gray-800'}`}
            >
              {m.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

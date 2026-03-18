'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getUser } from '@/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const token = getToken();
  const user = getUser();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!token || !user) {
      router.replace('/login');
      return;
    }
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'OPERATOR_ADMIN') {
      router.replace('/login');
    }
  }, [token, user, router]);

  if (!token || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">확인 중...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role={user.role} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 bg-gray-50 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { getAdminUsers } from '@/lib/user.api';
import { DataTable } from '@/components/table/DataTable';

export default function UsersPage() {
  const { data: list = [], isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: getAdminUsers,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">회원 관리</h1>
      {isLoading ? <p className="text-gray-500">로딩 중...</p> : (
        <DataTable
          data={list}
          keyExtractor={(r: { id: string }) => r.id}
          columns={[
            { key: 'username', label: '아이디' },
            { key: 'name', label: '이름' },
            { key: 'phone', label: '연락처' },
            { key: 'email', label: '이메일' },
            { key: 'status', label: '상태' },
            { key: 'role', label: '역할' },
            { key: 'createdAt', label: '가입일', render: (r: { createdAt: string }) => r.createdAt?.slice(0, 10) },
          ]}
        />
      )}
    </div>
  );
}

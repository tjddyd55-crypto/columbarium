import { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { api, type WaitlistRow } from '../../lib/api';

const statusLabel: Record<string, string> = {
  WAITING: '대기',
  ACTIVE: '활성',
  CANCELLED: '취소',
};

export default function QueueManagement() {
  const [rows, setRows] = useState<WaitlistRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await api.waitlist.list();
      setRows(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approveWaitlist = async (id: string) => {
    await api.waitlist.activate(id);
    await load();
  };

  const columns = [
    { key: 'seat_id', label: '봉안함 ID' },
    { key: 'user_name', label: '신청자', render: (_: unknown, row: WaitlistRow) => row.user_name ?? '-' },
    { key: 'user_phone', label: '연락처', render: (_: unknown, row: WaitlistRow) => row.user_phone ?? '-' },
    {
      key: 'status',
      label: '상태',
      render: (_: unknown, row: WaitlistRow) => <StatusBadge status={statusLabel[row.status] ?? row.status} />,
    },
    {
      key: 'created_at',
      label: '신청일',
      render: (_: unknown, row: WaitlistRow) =>
        row.created_at ? new Date(row.created_at).toLocaleDateString('ko-KR') : '-',
    },
    {
      key: 'actions',
      label: '관리',
      render: (_: unknown, row: WaitlistRow) =>
        row.status === 'WAITING' ? (
          <button
            type="button"
            onClick={() => approveWaitlist(row.id)}
            className="text-sm text-[var(--color-primary)] hover:underline"
          >
            승인
          </button>
        ) : (
          '-'
        ),
    },
  ];

  if (loading) return <p className="text-gray-500">로딩 중...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--color-primary)]">대기열 관리</h1>
      <DataTable columns={columns} data={rows} />
    </div>
  );
}

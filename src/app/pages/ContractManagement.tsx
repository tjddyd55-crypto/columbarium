import { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { api, type ContractRow } from '../../lib/api';

const statusLabel: Record<string, string> = {
  PENDING: '대기',
  ACTIVE: '활성',
  COMPLETED: '완료',
};

export default function ContractManagement() {
  const [rows, setRows] = useState<ContractRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await api.contracts.list();
      setRows(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approveContract = async (id: string) => {
    await api.contracts.activate(id);
    await load();
  };

  const columns = [
    { key: 'id', label: '계약번호', render: (_: unknown, row: ContractRow) => String(row.id).slice(0, 8) },
    { key: 'seat_id', label: '납골단위' },
    { key: 'user_name', label: '회원명', render: (_: unknown, row: ContractRow) => row.user_name ?? '-' },
    {
      key: 'price',
      label: '금액 (원)',
      render: (_: unknown, row: ContractRow) => (row.price != null ? row.price.toLocaleString() : '-'),
    },
    {
      key: 'status',
      label: '상태',
      render: (_: unknown, row: ContractRow) => <StatusBadge status={statusLabel[row.status] ?? row.status} />,
    },
    {
      key: 'created_at',
      label: '신청일',
      render: (_: unknown, row: ContractRow) =>
        row.created_at ? new Date(row.created_at).toLocaleDateString('ko-KR') : '-',
    },
    {
      key: 'actions',
      label: '관리',
      render: (_: unknown, row: ContractRow) =>
        row.status === 'PENDING' ? (
          <button
            type="button"
            onClick={() => approveContract(row.id)}
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
      <h1 className="text-2xl font-bold text-[var(--color-primary)]">계약 관리</h1>
      <DataTable columns={columns} data={rows} />
    </div>
  );
}

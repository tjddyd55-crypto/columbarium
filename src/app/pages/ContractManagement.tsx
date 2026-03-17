import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

const mockContracts = [
  { id: 'C001', memberName: '홍길동', unitCode: 'A-1-001', startDate: '2024-01-01', endDate: '2034-01-01', status: '활성' },
  { id: 'C002', memberName: '김철수', unitCode: 'B-2-001', startDate: '2024-06-01', endDate: '2034-06-01', status: '활성' },
  { id: 'C003', memberName: '이영희', unitCode: 'A-1-003', startDate: '2023-01-01', endDate: '2025-01-01', status: '만료' },
];

export default function ContractManagement() {
  const columns = [
    { key: 'id', label: '계약번호' },
    { key: 'memberName', label: '회원명' },
    { key: 'unitCode', label: '납골단위' },
    { key: 'startDate', label: '시작일' },
    { key: 'endDate', label: '종료일' },
    { key: 'status', label: '상태', render: (_: unknown, row: { status: string }) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--color-primary)]">계약 관리</h1>
      <DataTable columns={columns} data={mockContracts} />
    </div>
  );
}

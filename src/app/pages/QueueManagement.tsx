import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

const mockQueues = [
  { id: 1, applicantName: '이영희', facilityName: 'A동', requestedAt: '2025-03-01', status: '대기' },
  { id: 2, applicantName: '박민수', facilityName: 'B동', requestedAt: '2025-03-05', status: '처리중' },
  { id: 3, applicantName: '최지훈', facilityName: 'A동', requestedAt: '2025-03-10', status: '완료' },
];

export default function QueueManagement() {
  const columns = [
    { key: 'id', label: '번호' },
    { key: 'applicantName', label: '신청자' },
    { key: 'facilityName', label: '희망 시설' },
    { key: 'requestedAt', label: '신청일' },
    { key: 'status', label: '상태', render: (_: unknown, row: { status: string }) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--color-primary)]">대기열 관리</h1>
      <DataTable columns={columns} data={mockQueues} />
    </div>
  );
}

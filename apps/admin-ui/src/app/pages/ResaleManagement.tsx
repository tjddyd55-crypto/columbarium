import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

const mockResales = [
  { id: 1, sellerName: '홍길동', unitCode: 'A-1-001', listPrice: 5000000, status: '판매중', listedAt: '2025-02-01' },
  { id: 2, sellerName: '김철수', unitCode: 'B-2-002', listPrice: 4500000, status: '거래완료', listedAt: '2025-01-15' },
  { id: 3, sellerName: '이영희', unitCode: 'A-1-005', listPrice: 5200000, status: '대기', listedAt: '2025-03-01' },
];

export default function ResaleManagement() {
  const columns = [
    { key: 'id', label: '번호' },
    { key: 'sellerName', label: '판매자' },
    { key: 'unitCode', label: '납골단위' },
    { key: 'listPrice', label: '희망가 (원)', render: (_: unknown, row: { listPrice: number }) => row.listPrice?.toLocaleString() ?? '-' },
    { key: 'status', label: '상태', render: (_: unknown, row: { status: string }) => <StatusBadge status={row.status} /> },
    { key: 'listedAt', label: '등록일' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--color-primary)]">재판매 관리</h1>
      <DataTable columns={columns} data={mockResales} />
    </div>
  );
}

import { useState } from 'react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

const mockUnits = [
  { id: 'U001', facilityName: 'A동', section: '1층-A', unitCode: 'A-1-001', status: '활성', occupant: '홍길동' },
  { id: 'U002', facilityName: 'A동', section: '1층-A', unitCode: 'A-1-002', status: '대기', occupant: '-' },
  { id: 'U003', facilityName: 'B동', section: '2층-B', unitCode: 'B-2-001', status: '활성', occupant: '김철수' },
];

export default function UnitManagement() {
  const [search, setSearch] = useState('');

  const columns = [
    { key: 'unitCode', label: '단위코드', sortable: true },
    { key: 'facilityName', label: '시설' },
    { key: 'section', label: '구역' },
    { key: 'status', label: '상태', render: (_: unknown, row: { status: string }) => <StatusBadge status={row.status} /> },
    { key: 'occupant', label: '입주자' },
  ];

  const filtered = mockUnits.filter(
    (u) =>
      u.unitCode.toLowerCase().includes(search.toLowerCase()) ||
      u.facilityName.includes(search) ||
      u.occupant.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">납골단위 관리</h1>
      </div>
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="단위코드, 시설, 입주자 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-md px-4 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
      </div>
      <DataTable columns={columns} data={filtered} />
    </div>
  );
}

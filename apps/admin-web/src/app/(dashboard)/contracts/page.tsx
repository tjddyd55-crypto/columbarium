'use client';

import { useState } from 'react';
import { useFacilities } from '@/hooks/useFacilities';
import { useOperatorContracts } from '@/hooks/useOperatorContracts';
import { DataTable } from '@/components/table/DataTable';

export default function ContractsPage() {
  const { data: facilities = [] } = useFacilities();
  const [facilityId, setFacilityId] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const { data: list = [], isLoading } = useOperatorContracts({ facilityId: facilityId || undefined, status: status || undefined });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">계약 관리</h1>
        <div className="flex gap-2">
          <select value={facilityId} onChange={(e) => setFacilityId(e.target.value)} className="border rounded px-3 py-2">
            <option value="">전체 시설</option>
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded px-3 py-2">
            <option value="">전체 상태</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PENDING">PENDING</option>
            <option value="TRANSFERRED">TRANSFERRED</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>
        </div>
      </div>
      {isLoading ? <p className="text-gray-500">로딩 중...</p> : (
        <DataTable
          data={list}
          keyExtractor={(r: { id: string }) => r.id}
          columns={[
            { key: 'contractNo', label: '계약번호' },
            { key: 'facilityName', label: '시설' },
            { key: 'unitCode', label: '칸' },
            { key: 'finalPrice', label: '금액', render: (r: { finalPrice: number }) => Number(r.finalPrice).toLocaleString() + '원' },
            { key: 'status', label: '상태' },
            { key: 'contractType', label: '유형' },
            { key: 'startDate', label: '시작일', render: (r: { startDate: string }) => r.startDate?.slice(0, 10) },
            { key: 'endDate', label: '종료일', render: (r: { endDate: string }) => r.endDate?.slice(0, 10) },
          ]}
        />
      )}
    </div>
  );
}

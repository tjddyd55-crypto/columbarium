'use client';

import { useFacilities } from '@/hooks/useFacilities';
import { useOperatorQueue } from '@/hooks/useOperatorQueue';
import { DataTable } from '@/components/table/DataTable';
import { useState } from 'react';

export default function QueuePage() {
  const { data: facilities = [] } = useFacilities();
  const [facilityId, setFacilityId] = useState<string>('');
  const { data: list = [], isLoading } = useOperatorQueue(facilityId || undefined);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">대기열 관리</h1>
        <select
          value={facilityId}
          onChange={(e) => setFacilityId(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">전체 시설</option>
          {facilities.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      </div>
      {isLoading ? <p className="text-gray-500">로딩 중...</p> : (
        <DataTable
          data={list}
          keyExtractor={(r) => r.id}
          columns={[
            { key: 'facilityName', label: '시설' },
            { key: 'unitCode', label: '칸' },
            { key: 'queuePosition', label: '순번' },
            {
              key: 'status',
              label: '상태',
              render: (r: { status: string }) => (
                <span className={`px-2 py-0.5 rounded text-xs ${
                  r.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  r.status === 'WAITING' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'
                }`}>{r.status}</span>
              ),
            },
            { key: 'createdAt', label: '참여일', render: (r: { createdAt: string }) => new Date(r.createdAt).toLocaleDateString('ko-KR') },
          ]}
        />
      )}
    </div>
  );
}

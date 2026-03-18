'use client';

import { useFacilities } from '@/hooks/useFacilities';
import { useOperatorContracts } from '@/hooks/useOperatorContracts';
import { useOperatorQueue } from '@/hooks/useOperatorQueue';
import { getUser } from '@/lib/auth';

export default function DashboardPage() {
  const user = getUser();
  const { data: facilities = [] } = useFacilities();
  const { data: contracts = [] } = useOperatorContracts();
  const { data: queueEntries = [] } = useOperatorQueue();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">대시보드</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">시설 수</div>
          <div className="text-2xl font-bold">{facilities.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">계약 수</div>
          <div className="text-2xl font-bold">{contracts.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">대기열 건수</div>
          <div className="text-2xl font-bold">{queueEntries.length}</div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold p-4 border-b">최근 계약</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3">계약번호</th>
                <th className="text-left p-3">시설/칸</th>
                <th className="text-left p-3">금액</th>
                <th className="text-left p-3">상태</th>
              </tr>
            </thead>
            <tbody>
              {contracts.slice(0, 10).map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="p-3">{c.contractNo}</td>
                  <td className="p-3">{c.facilityName} / {c.unitCode}</td>
                  <td className="p-3">{Number(c.finalPrice).toLocaleString()}원</td>
                  <td className="p-3">{c.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {contracts.length === 0 && (
          <p className="p-4 text-gray-500 text-center">계약 내역이 없습니다.</p>
        )}
      </div>
    </div>
  );
}

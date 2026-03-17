import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import KPICard from '../components/KPICard';
import { Building2, ListOrdered, FileText } from 'lucide-react';
import { api } from '../../lib/api';

export default function Dashboard() {
  const [facilityCount, setFacilityCount] = useState<number>(0);
  const [waitlistCount, setWaitlistCount] = useState<number>(0);
  const [contractCount, setContractCount] = useState<number>(0);
  const [pieData, setPieData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.facilities.list(), api.waitlist.list(), api.contracts.list()])
      .then(([facilities, waitlist, contracts]) => {
        if (cancelled) return;
        setFacilityCount(facilities.length);
        setWaitlistCount(waitlist.length);
        setContractCount(contracts.length);
        const byStatus: Record<string, number> = {};
        contracts.forEach((c) => {
          byStatus[c.status] = (byStatus[c.status] ?? 0) + 1;
        });
        setPieData([
          { name: 'ACTIVE', value: byStatus.ACTIVE ?? 0, color: '#22c55e' },
          { name: 'PENDING', value: byStatus.PENDING ?? 0, color: '#eab308' },
          { name: '기타', value: contracts.length - (byStatus.ACTIVE ?? 0) - (byStatus.PENDING ?? 0), color: '#94a3b8' },
        ].filter((d) => d.value > 0));
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : '대시보드 로딩 중 오류가 발생했습니다.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <p className="text-gray-500">로딩 중...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[var(--color-primary)]">대시보드</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="시설 수" value={String(facilityCount)} icon={Building2} />
        <KPICard title="대기열 수" value={String(waitlistCount)} icon={ListOrdered} />
        <KPICard title="계약 수" value={String(contractCount)} icon={FileText} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-[var(--color-border)] p-6">
          <h2 className="text-lg font-semibold text-[var(--color-primary)] mb-4">계약 상태</h2>
          <ResponsiveContainer width="100%" height={300}>
            {pieData.length > 0 ? (
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name} ${value}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            ) : (
              <p className="text-gray-500 flex items-center justify-center h-full">계약 데이터 없음</p>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import KPICard from '../components/KPICard';
import { Users, Building2, Box, FileText } from 'lucide-react';

const barData = [
  { name: '1월', 계약: 12, 해지: 2 },
  { name: '2월', 계약: 18, 해지: 1 },
  { name: '3월', 계약: 15, 해지: 3 },
  { name: '4월', 계약: 22, 해지: 2 },
  { name: '5월', 계약: 19, 해지: 4 },
];

const pieData = [
  { name: '활성', value: 85, color: '#22c55e' },
  { name: '대기', value: 10, color: '#eab308' },
  { name: '만료', value: 5, color: '#94a3b8' },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[var(--color-primary)]">대시보드</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="총 회원 수" value="1,234" icon={Users} change="전월 대비 +5%" />
        <KPICard title="시설 수" value="12" icon={Building2} />
        <KPICard title="총 납골단위" value="3,456" icon={Box} change="가용 120개" />
        <KPICard title="이번 달 계약" value="42" icon={FileText} change="전월 대비 +8%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-[var(--color-border)] p-6">
          <h2 className="text-lg font-semibold text-[var(--color-primary)] mb-4">월별 계약/해지</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="계약" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="해지" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-lg border border-[var(--color-border)] p-6">
          <h2 className="text-lg font-semibold text-[var(--color-primary)] mb-4">계약 상태 비율</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value}%`, '비율']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import KPICard from '../components/KPICard';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { Building2, ListOrdered, FileText, Wallet, Users, Store } from 'lucide-react';
import { api, type CompanyRow, type DashboardSummary, getStoredUser } from '../../lib/api';

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [facilityCount, setFacilityCount] = useState<number>(0);
  const [waitlistCount, setWaitlistCount] = useState<number>(0);
  const [contractCount, setContractCount] = useState<number>(0);
  const [pieData, setPieData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<CompanyRow[]>([]);

  const user = getStoredUser();
  const isLegacyAdmin =
    user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setSummaryError(null);
      try {
        const s = await api.dashboard.summary();
        if (!cancelled) setSummary(s);
      } catch (e) {
        if (!cancelled) {
          setSummaryError(e instanceof Error ? e.message : '대시보드 요약을 불러오지 못했습니다.');
        }
      }

      if (isLegacyAdmin) {
        try {
          const [facilities, waitlist, contracts] = await Promise.all([
            api.facilities.list(),
            api.waitlist.list(),
            api.contracts.list(),
          ]);
          if (cancelled) return;
          setFacilityCount(facilities.length);
          setWaitlistCount(waitlist.length);
          setContractCount(contracts.length);
          const byStatus: Record<string, number> = {};
          contracts.forEach((c) => {
            byStatus[c.status] = (byStatus[c.status] ?? 0) + 1;
          });
          setPieData(
            [
              { name: 'ACTIVE', value: byStatus.ACTIVE ?? 0, color: '#22c55e' },
              { name: 'PENDING', value: byStatus.PENDING ?? 0, color: '#eab308' },
              {
                name: '기타',
                value:
                  contracts.length - (byStatus.ACTIVE ?? 0) - (byStatus.PENDING ?? 0),
                color: '#94a3b8',
              },
            ].filter((d) => d.value > 0),
          );
        } catch {
          /* 레거시 API 없으면 무시 */
        }
      }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [isLegacyAdmin]);

  useEffect(() => {
    if (!isLegacyAdmin) return;
    let cancelled = false;
    api.adminSite
      .getCompanies()
      .then((list) => {
        if (!cancelled) setCompanies(list);
      })
      .catch(() => {
        if (!cancelled) setCompanies([]);
      });
    return () => {
      cancelled = true;
    };
  }, [isLegacyAdmin]);

  const companyListColumns = useMemo(
    () => [
      {
        key: 'name',
        label: '사업자명',
        sortable: true,
        render: (v: string, row: CompanyRow) => (
          <Link to={`/admin/companies/${row.id}`} className="font-medium text-blue-600 hover:underline">
            {v}
          </Link>
        ),
      },
      { key: 'businessNo', label: '사업자번호', sortable: true, render: (v: string | null | undefined) => v ?? '—' },
      {
        key: 'status',
        label: '상태',
        sortable: true,
        render: (v: string | undefined) => (v ? <StatusBadge status={v} /> : '—'),
      },
      {
        key: 'createdAt',
        label: '생성일',
        sortable: true,
        render: (v: string) => v.slice(0, 10),
      },
    ],
    [],
  );

  if (loading) return <p className="text-gray-500">로딩 중...</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[var(--color-primary)]">대시보드</h1>

      {summaryError && (
        <p className="text-sm text-amber-700 bg-amber-50 px-4 py-2 rounded-lg">{summaryError}</p>
      )}

      {summary?.view === 'ADMIN' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard title="사업자(Company)" value={String(summary.companyCount)} icon={Store} />
            <KPICard title="시설(Site)" value={String(summary.siteCount)} icon={Building2} />
            <KPICard
              title="확정 예약"
              value={String(summary.confirmedReservationCount)}
              icon={ListOrdered}
            />
            <KPICard
              title="대기 중 커미션 건"
              value={String(summary.pendingCommissionCount)}
              icon={Wallet}
            />
          </div>
          {companies.length > 0 && (
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
              <h3 className="text-lg font-semibold text-[#1E293B] mb-1">사업자 목록</h3>
              <p className="text-sm text-gray-600 mb-4">사업자명을 클릭하면 해당 사업자 상세 콘솔로 이동합니다.</p>
              <DataTable columns={companyListColumns} data={companies} />
            </div>
          )}
        </>
      )}

      {summary?.view === 'OPERATOR' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KPICard title="소속 시설 수" value={String(summary.sites.length)} icon={Building2} />
            <KPICard
              title="확정 예약(매출 건)"
              value={String(summary.confirmedReservationCount)}
              icon={ListOrdered}
            />
            <KPICard
              title="확정 예약 매출 합"
              value={`${summary.revenueTotal.toLocaleString()}원`}
              icon={Wallet}
            />
          </div>
          <div className="bg-white rounded-lg border border-[var(--color-border)] p-6">
            <h2 className="text-lg font-semibold text-[var(--color-primary)] mb-4">내 시설</h2>
            <ul className="divide-y divide-gray-100">
              {summary.sites.map((s) => (
                <li key={s.id} className="py-3 flex justify-between text-sm">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-gray-500">{s.address}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {summary?.view === 'AGENT' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-[var(--color-border)] p-6">
            <h2 className="text-lg font-semibold text-[var(--color-primary)] mb-2">내 에이전트</h2>
            <p className="text-sm text-gray-600">
              코드 <span className="font-mono font-semibold">{summary.agent.code}</span> ·{' '}
              {summary.agent.name} · 커미션 {summary.agent.commissionRate}% ·{' '}
              {summary.agent.companyName}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="확정 실적 예약(CONFIRMED)"
              value={String(summary.confirmedSalesLinkedCount)}
              icon={Users}
            />
            <KPICard
              title="대기 커미션"
              value={`${summary.commissionPendingTotal.toLocaleString()}원 (${summary.commissionPendingCount}건)`}
              icon={Wallet}
            />
            <KPICard
              title="정산 완료 커미션"
              value={`${summary.commissionPaidTotal.toLocaleString()}원 (${summary.commissionPaidCount}건)`}
              icon={Wallet}
            />
          </div>
          <div className="bg-white rounded-lg border border-[var(--color-border)] p-6 overflow-x-auto">
            <h2 className="text-lg font-semibold text-[var(--color-primary)] mb-4">최근 커미션</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">예약</th>
                  <th className="pb-2">금액</th>
                  <th className="pb-2">상태</th>
                  <th className="pb-2">일시</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentCommissions.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50">
                    <td className="py-2 font-mono text-xs">{c.reservationId}</td>
                    <td className="py-2">{c.amount.toLocaleString()}원</td>
                    <td className="py-2">{c.status}</td>
                    <td className="py-2 text-gray-500">{c.createdAt.slice(0, 19)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {summary.recentCommissions.length === 0 && (
              <p className="text-gray-500 text-sm">내역이 없습니다.</p>
            )}
          </div>
        </div>
      )}

      {isLegacyAdmin && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard title="시설 수(레거시)" value={String(facilityCount)} icon={Building2} />
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
        </>
      )}
    </div>
  );
}

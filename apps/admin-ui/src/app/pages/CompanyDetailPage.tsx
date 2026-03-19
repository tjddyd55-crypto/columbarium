import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
  api,
  getStoredUser,
  type AgentRow,
  type CompanyPortalDetail,
  type CompanyPortalReservationRow,
  type CompanyPortalResaleRow,
  type SiteFacilityRow,
} from '../../lib/api';
import {
  clearSelectedFacilityId,
  getSelectedFacilityId,
  setSelectedFacilityId as persistSelectedFacilityId,
} from '../../lib/companyPortalStorage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { hasAnyOperatorRole, isPlatformAdminRole } from '../../lib/adminPortalAccess';

const RESERVATION_STATUS_LABEL: Record<string, string> = {
  RESERVED: '예약(미결제)',
  CONFIRMED: '확정',
  WAITING: '대기',
  CANCELLED: '취소',
};

const INPUT_CLASS =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent';

const TAB_LIST_CLASS =
  'flex flex-wrap h-auto w-full sm:w-fit gap-0 rounded-lg border border-[#E5E7EB] bg-white p-0 !bg-white text-gray-600';

const TAB_TRIGGER_CLASS =
  'rounded-none border-0 border-r border-[#E5E7EB] last:border-r-0 px-4 py-2 text-sm font-medium text-gray-600 shadow-none data-[state=active]:bg-[#3B82F6] data-[state=active]:text-white data-[state=active]:shadow-none';

type FloorDraft = { name: string; rows: string; cols: string };

function CreateFacilityForm({
  companyId,
  onCreated,
}: {
  companyId: string;
  onCreated: (row: SiteFacilityRow) => void;
}) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [useFloors, setUseFloors] = useState(false);
  const [floorRows, setFloorRows] = useState<FloorDraft[]>([
    { name: '1층', rows: '4', cols: '8' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const n = name.trim();
    const a = address.trim();
    if (!n || !a) {
      setFormError('시설명과 주소를 입력하세요.');
      return;
    }
    setSubmitting(true);
    try {
      const floorsPayload = useFloors
        ? floorRows
            .filter((r) => r.name.trim())
            .map((r) => ({
              name: r.name.trim(),
              rows: Math.min(200, Math.max(1, parseInt(r.rows, 10) || 1)),
              cols: Math.min(200, Math.max(1, parseInt(r.cols, 10) || 1)),
            }))
        : undefined;
      const row = await api.companyPortal.createFacility(companyId, {
        name: n,
        address: a,
        floors: floorsPayload?.length ? floorsPayload : undefined,
      });
      onCreated(row);
      setName('');
      setAddress('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '시설 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg border border-[#E5E7EB] p-4">
      <h3 className="text-lg font-semibold text-[#1E293B]">시설 등록</h3>
      {formError && <p className="text-sm text-red-600">{formError}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">시설명</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={INPUT_CLASS}
            placeholder="예: OO 추모공원"
            maxLength={200}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={INPUT_CLASS}
            placeholder="도로명 주소"
            maxLength={500}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={useFloors} onChange={(e) => setUseFloors(e.target.checked)} />
        층·구역 초기 구조 함께 생성 (선택)
      </label>
      {useFloors && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">
            각 줄은 구역(Section) 하나로 생성되며, 그리드 행·열에 맞춰 빈 좌석이 만들어집니다.
          </p>
          {floorRows.map((row, i) => (
            <div key={i} className="flex flex-wrap gap-2 items-end">
              <div className="flex-1 min-w-[120px]">
                <label className="block text-xs text-gray-500 mb-1">구역명</label>
                <input
                  value={row.name}
                  onChange={(e) => {
                    const next = [...floorRows];
                    next[i] = { ...next[i], name: e.target.value };
                    setFloorRows(next);
                  }}
                  className={INPUT_CLASS}
                  placeholder="1층 A"
                />
              </div>
              <div className="w-20">
                <label className="block text-xs text-gray-500 mb-1">행</label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={row.rows}
                  onChange={(e) => {
                    const next = [...floorRows];
                    next[i] = { ...next[i], rows: e.target.value };
                    setFloorRows(next);
                  }}
                  className={INPUT_CLASS}
                />
              </div>
              <div className="w-20">
                <label className="block text-xs text-gray-500 mb-1">열</label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={row.cols}
                  onChange={(e) => {
                    const next = [...floorRows];
                    next[i] = { ...next[i], cols: e.target.value };
                    setFloorRows(next);
                  }}
                  className={INPUT_CLASS}
                />
              </div>
              {floorRows.length > 1 && (
                <button
                  type="button"
                  className="flex items-center gap-1 px-3 py-1 text-red-600 border border-red-600 rounded hover:bg-red-50 transition-colors text-sm"
                  onClick={() => setFloorRows(floorRows.filter((_, j) => j !== i))}
                >
                  삭제
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="text-sm text-blue-600 hover:underline"
            onClick={() => setFloorRows([...floorRows, { name: '', rows: '4', cols: '8' }])}
          >
            + 구역 줄 추가
          </button>
        </div>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="flex items-center gap-2 bg-[#3B82F6] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium disabled:opacity-50"
      >
        {submitting ? '등록 중…' : '시설 등록'}
      </button>
    </form>
  );
}

export default function CompanyDetailPage() {
  const { companyId = '' } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<CompanyPortalDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [facilities, setFacilities] = useState<SiteFacilityRow[]>([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(false);
  const [waiting, setWaiting] = useState<CompanyPortalReservationRow[]>([]);
  const [confirmed, setConfirmed] = useState<CompanyPortalReservationRow[]>([]);
  const [resales, setResales] = useState<CompanyPortalResaleRow[]>([]);
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [tabLoading, setTabLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('facilities');
  const [selectedFacilityId, setSelectedFacilityId] = useState('');

  useEffect(() => {
    const u = getStoredUser();
    if (!u?.companyId) return;
    if (!hasAnyOperatorRole(u)) return;
    if (companyId && u.companyId !== companyId) {
      navigate(`/admin/companies/${u.companyId}`, { replace: true });
    }
  }, [companyId, navigate]);

  useEffect(() => {
    if (!companyId) {
      setError('사업자 ID가 없습니다.');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.companyPortal
      .detail(companyId)
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : '불러오기 실패');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  useEffect(() => {
    if (!companyId || !detail) return;
    let cancelled = false;
    setFacilitiesLoading(true);
    api.companyPortal
      .facilities(companyId)
      .then((f) => {
        if (!cancelled) setFacilities(f);
      })
      .catch(() => {
        if (!cancelled) setFacilities([]);
      })
      .finally(() => {
        if (!cancelled) setFacilitiesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [companyId, detail]);

  useEffect(() => {
    if (!companyId) {
      setSelectedFacilityId('');
      return;
    }
    const stored = getSelectedFacilityId(companyId);
    setSelectedFacilityId(stored ?? '');
  }, [companyId]);

  useEffect(() => {
    if (!selectedFacilityId || facilities.length === 0) return;
    if (!facilities.some((f) => f.id === selectedFacilityId)) {
      setSelectedFacilityId('');
      if (companyId) clearSelectedFacilityId(companyId);
    }
  }, [facilities, selectedFacilityId, companyId]);

  const refreshFacilities = useCallback(async () => {
    if (!companyId || !detail) return;
    setFacilitiesLoading(true);
    try {
      setFacilities(await api.companyPortal.facilities(companyId));
    } catch {
      setFacilities([]);
    } finally {
      setFacilitiesLoading(false);
    }
  }, [companyId, detail]);

  const handleSelectFacility = useCallback(
    (f: SiteFacilityRow) => {
      persistSelectedFacilityId(companyId, f.id);
      setSelectedFacilityId(f.id);
      setActiveTab('seats');
    },
    [companyId],
  );

  const loadTab = useCallback(
    async (tab: 'wait' | 'contracts' | 'resales' | 'agents') => {
      if (!companyId) return;
      setTabLoading(tab);
      try {
        if (tab === 'wait') {
          setWaiting(await api.companyPortal.reservations(companyId, 'WAITING'));
        } else if (tab === 'contracts') {
          setConfirmed(await api.companyPortal.reservations(companyId, 'CONFIRMED'));
        } else if (tab === 'resales') {
          setResales(await api.companyPortal.resales(companyId));
        } else if (tab === 'agents') {
          setAgents(await api.companyPortal.agents(companyId));
        }
      } catch {
        if (tab === 'wait') setWaiting([]);
        if (tab === 'contracts') setConfirmed([]);
        if (tab === 'resales') setResales([]);
        if (tab === 'agents') setAgents([]);
      } finally {
        setTabLoading(null);
      }
    },
    [companyId],
  );

  const handleTabChange = (v: string) => {
    setActiveTab(v);
    if (v === 'wait') void loadTab('wait');
    if (v === 'contracts') void loadTab('contracts');
    if (v === 'resales') void loadTab('resales');
    if (v === 'agents') void loadTab('agents');
  };

  const user = getStoredUser();
  const showGlobalSeatLink = isPlatformAdminRole(user);

  const facilityColumns = useMemo(
    () => [
      { key: 'name', label: '시설명', sortable: true },
      { key: 'address', label: '주소', sortable: true },
      {
        key: 'sectionCount',
        label: '구역 수',
        sortable: true,
        render: (v: number | undefined) => String(v ?? 0),
      },
      {
        key: 'id',
        label: '그리드',
        render: (_id: string, row: SiteFacilityRow) => (
          <Link
            to={`/admin/seat-management?companyId=${encodeURIComponent(companyId)}&facilityId=${encodeURIComponent(row.id)}`}
            onClick={(e) => e.stopPropagation()}
            className="text-blue-600 hover:underline text-sm"
          >
            바로 열기
          </Link>
        ),
      },
    ],
    [companyId],
  );

  const reservationColumns = useMemo(
    () => [
      {
        key: 'status',
        label: '상태',
        sortable: true,
        render: (v: string, row: CompanyPortalReservationRow) => (
          <>
            {RESERVATION_STATUS_LABEL[v] ?? v}
            {v === 'WAITING' && row.queueOrder != null ? ` (#${row.queueOrder})` : ''}
          </>
        ),
      },
      {
        key: 'facilityName',
        label: '시설',
        sortable: true,
        render: (_: string, row: CompanyPortalReservationRow) => `${row.facilityName} / ${row.sectionName}`,
      },
      {
        key: 'displayCode',
        label: '칸',
        sortable: true,
        render: (v: string) => <span className="font-mono text-sm">{v}</span>,
      },
      {
        key: 'price',
        label: '금액',
        sortable: true,
        render: (v: number) => `${v.toLocaleString()}원`,
      },
      {
        key: 'userName',
        label: '고객',
        sortable: true,
        render: (_: string, row: CompanyPortalReservationRow) => (
          <span>
            {row.userName}
            <span className="text-gray-500 text-xs block">{row.userPhone}</span>
          </span>
        ),
      },
      {
        key: 'createdAt',
        label: '생성일',
        sortable: true,
        render: (v: string) => v.slice(0, 19),
      },
    ],
    [],
  );

  const resaleColumns = useMemo(
    () => [
      { key: 'status', label: '상태', sortable: true },
      {
        key: 'facilityName',
        label: '시설·칸',
        sortable: true,
        render: (_: string, row: CompanyPortalResaleRow) => (
          <>
            {row.facilityName} · <span className="font-mono">{row.displayCode}</span>
          </>
        ),
      },
      { key: 'pricingType', label: '가격유형', sortable: true },
      {
        key: 'price',
        label: '가격',
        sortable: true,
        render: (v: number | null) => (v != null ? `${v.toLocaleString()}원` : '—'),
      },
      {
        key: 'createdAt',
        label: '등록일',
        sortable: true,
        render: (v: string) => v.slice(0, 19),
      },
    ],
    [],
  );

  const agentColumns = useMemo(
    () => [
      {
        key: 'code',
        label: '코드',
        sortable: true,
        render: (v: string) => <span className="font-mono font-semibold">{v}</span>,
      },
      { key: 'name', label: '표시명', sortable: true },
      {
        key: 'loginId',
        label: '로그인',
        sortable: true,
        render: (v: string | undefined) => v ?? '—',
      },
      {
        key: 'commissionRate',
        label: '커미션',
        sortable: true,
        render: (v: number) => `${v}%`,
      },
      {
        key: 'createdAt',
        label: '등록일',
        sortable: true,
        render: (v: string) => v.slice(0, 19),
      },
    ],
    [],
  );

  if (loading) {
    return <p className="text-gray-500">로딩 중...</p>;
  }

  if (error || !detail) {
    return (
      <div className="space-y-4">
        <p className="text-red-600">{error ?? '사업자를 찾을 수 없습니다.'}</p>
        <Link to="/admin" className="text-blue-600 hover:underline text-sm">
          대시보드로
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/admin" className="text-sm text-gray-600 hover:text-gray-800 inline-block mb-1">
            ← 대시보드
          </Link>
          <h3 className="text-lg font-semibold text-[#1E293B]">{detail.name}</h3>
          <p className="text-sm text-gray-600">사업자 상세 · 시설 및 봉안함 관리</p>
        </div>
        {showGlobalSeatLink && (
          <Link
            to={`/admin/seat-management?companyId=${encodeURIComponent(companyId)}`}
            className="flex items-center gap-2 bg-[#3B82F6] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            봉안함 그리드 (이 사업자 고정)
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-gray-600">사업자번호</p>
          <p className="text-lg font-bold text-[#1E293B] mt-1">{detail.businessNo ?? '—'}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-gray-600">상태</p>
          <p className="mt-2">
            <StatusBadge status={detail.status} />
          </p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-gray-600">생성일</p>
          <p className="text-lg font-bold text-[#1E293B] mt-1">{detail.createdAt.slice(0, 10)}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className={TAB_LIST_CLASS}>
          <TabsTrigger value="facilities" className={TAB_TRIGGER_CLASS}>
            시설 관리
          </TabsTrigger>
          <TabsTrigger value="seats" className={TAB_TRIGGER_CLASS}>
            봉안함 관리
          </TabsTrigger>
          <TabsTrigger value="wait" className={TAB_TRIGGER_CLASS}>
            대기열 관리
          </TabsTrigger>
          <TabsTrigger value="contracts" className={TAB_TRIGGER_CLASS}>
            계약 관리
          </TabsTrigger>
          <TabsTrigger value="resales" className={TAB_TRIGGER_CLASS}>
            재판매 관리
          </TabsTrigger>
          <TabsTrigger value="agents" className={TAB_TRIGGER_CLASS}>
            에이전트 관리
          </TabsTrigger>
        </TabsList>

        <TabsContent value="facilities" className="mt-4 space-y-6">
          <CreateFacilityForm
            companyId={companyId}
            onCreated={async (row) => {
              await refreshFacilities();
              handleSelectFacility(row);
            }}
          />
          {facilitiesLoading && <p className="text-sm text-gray-500">목록 불러오는 중…</p>}
          <p className="text-sm text-gray-600">
            행을 클릭하면 시설이 선택되고 「봉안함 관리」 탭으로 이동합니다.
          </p>
          {facilities.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">등록된 시설이 없습니다.</p>
          ) : (
            <DataTable
              columns={facilityColumns}
              data={facilities}
              onRowClick={(row) => handleSelectFacility(row as SiteFacilityRow)}
              rowClassName={(row) => (selectedFacilityId === (row as SiteFacilityRow).id ? 'bg-blue-50' : undefined)}
            />
          )}
        </TabsContent>

        <TabsContent value="seats" className="mt-4 space-y-4">
          <p className="text-sm text-gray-600">
            좌석 그리드에서 가격·차단·예약 상태를 관리합니다. 시설 관리 탭에서 행을 클릭하면 이 탭으로 오며 선택이
            유지됩니다.
          </p>
          {selectedFacilityId ? (
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
              <p className="text-sm text-gray-900">
                <span className="font-medium text-[#1E293B]">선택된 시설: </span>
                {facilities.find((f) => f.id === selectedFacilityId)?.name ?? `(ID ${selectedFacilityId})`}
                <Link
                  to={`/admin/seat-management?companyId=${encodeURIComponent(companyId)}&facilityId=${encodeURIComponent(selectedFacilityId)}`}
                  className="ml-3 text-blue-600 hover:underline text-sm font-medium"
                >
                  봉안함 그리드 열기 →
                </Link>
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
              <p className="text-sm text-gray-600">
                시설이 선택되지 않았습니다. 「시설 관리」 탭에서 시설 행을 클릭하세요.
              </p>
            </div>
          )}
          {facilitiesLoading && <p className="text-sm text-gray-500">시설 목록 불러오는 중…</p>}
          {!facilitiesLoading && facilities.length === 0 && (
            <p className="text-sm text-gray-500">등록된 시설이 없습니다. 위 폼에서 시설을 등록하세요.</p>
          )}
          {facilities.length > 0 && (
            <DataTable
              columns={facilityColumns}
              data={facilities}
              onRowClick={(row) => handleSelectFacility(row as SiteFacilityRow)}
              rowClassName={(row) => (selectedFacilityId === (row as SiteFacilityRow).id ? 'bg-blue-50' : undefined)}
            />
          )}
        </TabsContent>

        <TabsContent value="wait" className="mt-4">
          {tabLoading === 'wait' && <p className="text-sm text-gray-500">불러오는 중…</p>}
          {waiting.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">데이터가 없습니다.</p>
          ) : (
            <DataTable columns={reservationColumns} data={waiting} />
          )}
        </TabsContent>

        <TabsContent value="contracts" className="mt-4">
          {tabLoading === 'contracts' && <p className="text-sm text-gray-500">불러오는 중…</p>}
          <p className="text-sm text-gray-600 mb-2">확정(CONFIRMED) 예약을 계약 확정 건으로 표시합니다.</p>
          {confirmed.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">데이터가 없습니다.</p>
          ) : (
            <DataTable columns={reservationColumns} data={confirmed} />
          )}
        </TabsContent>

        <TabsContent value="resales" className="mt-4">
          {tabLoading === 'resales' && <p className="text-sm text-gray-500">불러오는 중…</p>}
          {resales.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">데이터가 없습니다.</p>
          ) : (
            <DataTable columns={resaleColumns} data={resales} />
          )}
        </TabsContent>

        <TabsContent value="agents" className="mt-4">
          {tabLoading === 'agents' && <p className="text-sm text-gray-500">불러오는 중…</p>}
          {agents.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">데이터가 없습니다.</p>
          ) : (
            <DataTable columns={agentColumns} data={agents} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

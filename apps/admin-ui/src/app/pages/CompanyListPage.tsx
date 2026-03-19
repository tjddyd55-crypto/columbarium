import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Plus, Search, Settings2 } from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { api, type CompanyRow } from '../../lib/api';

function normalizeSearch(s: string): string {
  return s.trim().toLowerCase();
}

/**
 * 플랫폼 관리자용 사업자(Company) 목록 — GET /admin/companies
 * 관리 버튼 → /admin/companies/:companyId
 */
export default function CompanyListPage() {
  const [rows, setRows] = useState<CompanyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await api.adminSite.getCompanies());
    } catch (e) {
      setRows([]);
      setError(e instanceof Error ? e.message : '사업자 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const q = normalizeSearch(searchTerm);
  const filtered = useMemo(() => {
    if (!q) return rows;
    return rows.filter((r) => {
      const name = r.name?.toLowerCase() ?? '';
      const no = (r.businessNo ?? '').toLowerCase();
      return name.includes(q) || no.includes(q);
    });
  }, [rows, q]);

  const activeCount = useMemo(() => rows.filter((r) => r.status === 'ACTIVE').length, [rows]);
  const inactiveCount = useMemo(() => rows.filter((r) => r.status === 'INACTIVE').length, [rows]);

  const columns = useMemo(
    () => [
      {
        key: 'name',
        label: '사업자명',
        sortable: true,
        render: (v: string) => <span className="font-medium text-[#1E293B]">{v}</span>,
      },
      {
        key: 'businessNo',
        label: '사업자번호',
        sortable: true,
        render: (v: string | null | undefined) => (
          <span className="font-mono text-sm">{v?.trim() ? v : '—'}</span>
        ),
      },
      {
        key: 'status',
        label: '상태',
        sortable: true,
        render: (v: string | undefined) =>
          v ? <StatusBadge status={v} /> : <span className="text-gray-400">—</span>,
      },
      {
        key: 'createdAt',
        label: '생성일',
        sortable: true,
        render: (v: string) => v.slice(0, 10),
      },
      {
        key: 'id',
        label: '관리',
        render: (_id: string, row: CompanyRow) => (
          <Link
            to={`/admin/companies/${row.id}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-[#3B82F6] rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Settings2 className="w-4 h-4" />
            관리
          </Link>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-[#1E293B]">사업자 관리</h1>
          <p className="text-sm text-gray-600 mt-0.5">등록된 사업자(Company) 목록 · API: GET /admin/companies</p>
        </div>
        <Link
          to="/admin/company"
          className="inline-flex items-center gap-2 bg-[#3B82F6] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          <Plus className="w-5 h-5" />
          사업자 추가
        </Link>
      </div>

      <div className="bg-white rounded-lg p-4 border border-[#E5E7EB]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="search"
            placeholder="사업자명 · 사업자번호 검색…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
            aria-label="사업자 검색"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-gray-600">전체 사업자</p>
          <p className="text-2xl font-bold text-[#1E293B] mt-1">{rows.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-gray-600">활성 (ACTIVE)</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-gray-600">비활성 (INACTIVE)</p>
          <p className="text-2xl font-bold text-slate-600 mt-1">{inactiveCount}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
          <button
            type="button"
            onClick={() => void load()}
            className="ml-3 text-red-900 underline font-medium"
          >
            다시 시도
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500 py-6">불러오는 중…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-500 py-6 border border-dashed border-gray-200 rounded-lg text-center">
          {rows.length === 0
            ? '등록된 사업자가 없습니다. 「사업자 추가」로 등록하세요.'
            : '검색 조건에 맞는 사업자가 없습니다.'}
        </p>
      ) : (
        <DataTable columns={columns} data={filtered} />
      )}
    </div>
  );
}

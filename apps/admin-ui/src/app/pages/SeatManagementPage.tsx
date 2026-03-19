import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import {
  type SiteFacilityRow,
  type SectionRow,
  type AdminSeatRow,
  type CompanyRow,
  api,
} from '../../lib/api';
import { facilityAdminApi } from '../../lib/facilityAdminApi';
import { isCompanyScopedOperator } from '../../lib/operatorScope';
import { inferLineLabel, listUniqueFloors, sectionsForFloor } from '../../lib/sectionFloorGrouping';
import {
  resolveSeatCode,
  resolveSeatGridStatus,
  SEAT_GRID_CELL_CLASS,
  SEAT_GRID_LEGEND,
  SEAT_GRID_LEGEND_SWATCH,
} from '../../lib/seatGridDisplay';
import SeatDetailModal from '../components/SeatDetailModal';

export default function SeatManagementPage() {
  const scoped = isCompanyScopedOperator();
  const [searchParams] = useSearchParams();
  const lockCompanyId = scoped ? '' : (searchParams.get('companyId')?.trim() ?? '');
  const lockFacilityId = searchParams.get('facilityId')?.trim() ?? '';
  const companyLockedByUrl = Boolean(lockCompanyId);

  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [companyId, setCompanyId] = useState('');
  const [allFacilities, setAllFacilities] = useState<SiteFacilityRow[]>([]);
  const [facilityId, setFacilityId] = useState('');
  const [sections, setSections] = useState<SectionRow[]>([]);
  const [floor, setFloor] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [seats, setSeats] = useState<AdminSeatRow[]>([]);
  const [modalSeat, setModalSeat] = useState<AdminSeatRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    if (scoped || companyLockedByUrl) return;
    api.adminSite
      .getCompanies()
      .then(setCompanies)
      .catch(() => setCompanies([]));
  }, [scoped, companyLockedByUrl]);

  useEffect(() => {
    if (companyLockedByUrl) {
      setCompanyId(lockCompanyId);
      return;
    }
    if (scoped || companies.length !== 1) return;
    setCompanyId((c) => c || companies[0].id);
  }, [scoped, companies, companyLockedByUrl, lockCompanyId]);

  useEffect(() => {
    if (!companyLockedByUrl) return;
    if (!lockFacilityId) setFacilityId('');
  }, [companyLockedByUrl, lockCompanyId, lockFacilityId]);

  useEffect(() => {
    facilityAdminApi.getFacilities(scoped).then(setAllFacilities).catch(() => setAllFacilities([]));
  }, [scoped]);

  const facilities = useMemo(() => {
    if (scoped) return allFacilities;
    if (!companyId) return [];
    return allFacilities.filter((f) => f.companyId === companyId);
  }, [allFacilities, companyId, scoped]);

  useEffect(() => {
    if (!lockFacilityId || facilities.length === 0) return;
    if (facilities.some((f) => f.id === lockFacilityId)) {
      setFacilityId(lockFacilityId);
    }
  }, [lockFacilityId, facilities]);

  useEffect(() => {
    if (!facilityId) {
      setSections([]);
      setFloor('');
      setSectionId('');
      setSeats([]);
      return;
    }
    setLoading(true);
    facilityAdminApi
      .getSections(scoped, facilityId)
      .then(setSections)
      .catch(() => setSections([]))
      .finally(() => setLoading(false));
    setFloor('');
    setSectionId('');
    setSeats([]);
  }, [facilityId, scoped]);

  const floors = useMemo(() => listUniqueFloors(sections), [sections]);

  useEffect(() => {
    if (sections.length === 0) {
      setFloor('');
      setSectionId('');
      return;
    }
    setFloor((prev) => (prev && floors.includes(prev) ? prev : floors[0] ?? ''));
  }, [sections, floors]);

  const sectionsInFloor = useMemo(
    () => (floor ? sectionsForFloor(sections, floor) : []),
    [sections, floor],
  );

  useEffect(() => {
    if (sectionsInFloor.length === 0) {
      setSectionId('');
      setSeats([]);
      return;
    }
    setSectionId((prev) =>
      prev && sectionsInFloor.some((s) => s.id === prev) ? prev : sectionsInFloor[0].id,
    );
  }, [sectionsInFloor]);

  const refreshSeats = useCallback(async () => {
    if (!sectionId) {
      setSeats([]);
      return;
    }
    setLoading(true);
    try {
      const list = await facilityAdminApi.getSeats(scoped, sectionId);
      setSeats(list);
    } catch {
      setSeats([]);
    } finally {
      setLoading(false);
    }
  }, [sectionId, scoped]);

  useEffect(() => {
    void refreshSeats();
  }, [refreshSeats]);

  const selectedSectionMeta = sectionsInFloor.find((s) => s.id === sectionId);
  const gridRows = selectedSectionMeta?.rows ?? 0;
  const gridCols = selectedSectionMeta?.cols ?? 0;
  const byPos = useMemo(() => new Map(seats.map((s) => [`${s.row}-${s.col}`, s])), [seats]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#1E293B]">봉안함 관리 (그리드)</h3>
        <p className="text-sm text-gray-600">
          목록이 아니라 <strong>행·열 그리드</strong>로 표시됩니다. 필터로 시설·층·구역을 고른 뒤 칸을 클릭하면 모달에서
          가격·차단(상태)을 수정할 수 있습니다.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
        <p className="text-sm font-semibold text-[#1E293B] mb-3">상단 필터</p>
        <div className="flex flex-wrap gap-4 items-end">
        {!scoped && !companyLockedByUrl && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">사업자 (Company)</label>
            <select
              value={companyId}
              onChange={(e) => {
                setCompanyId(e.target.value);
                setFacilityId('');
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 min-w-[220px]"
            >
              <option value="">선택</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">시설 (Facility)</label>
          <select
            value={facilityId}
            onChange={(e) => setFacilityId(e.target.value)}
            disabled={!scoped && !companyId && !companyLockedByUrl}
            className="border border-gray-300 rounded-lg px-3 py-2 min-w-[240px] disabled:opacity-50"
          >
            <option value="">
              {scoped ? '선택' : companyId || companyLockedByUrl ? '선택' : '사업자를 먼저 선택'}
            </option>
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">층</label>
          <select
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            disabled={!facilityId || floors.length === 0}
            className="border border-gray-300 rounded-lg px-3 py-2 min-w-[140px] disabled:opacity-50"
          >
            {floors.map((fl) => (
              <option key={fl} value={fl}>
                {fl}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">구역 (라인)</label>
          <select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            disabled={sectionsInFloor.length === 0}
            className="border border-gray-300 rounded-lg px-3 py-2 min-w-[200px] disabled:opacity-50"
          >
            {sectionsInFloor.map((s) => (
              <option key={s.id} value={s.id}>
                {inferLineLabel(s.name)} ({s.seatCount}석)
              </option>
            ))}
          </select>
        </div>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        구역명이 <code className="bg-gray-100 px-1 rounded">1층 A</code> 형태면 층/라인으로 나뉩니다. 단일 이름(
        <code className="bg-gray-100 px-1">A</code>)이면 층은 &quot;전체&quot;로 묶입니다.
      </p>

      {message && (
        <p className={message.type === 'ok' ? 'text-sm text-green-600' : 'text-sm text-red-600'}>
          {message.text}
        </p>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-600 items-center">
        <span className="font-medium text-gray-700">범례 (status):</span>
        {SEAT_GRID_LEGEND.map(({ status, label }) => (
          <span key={status} className="inline-flex items-center gap-1.5">
            <span className={`w-4 h-4 rounded shrink-0 ${SEAT_GRID_LEGEND_SWATCH[status]}`} />
            {label}
          </span>
        ))}
        {loading && <span className="text-gray-400">불러오는 중…</span>}
      </div>

      {sectionId && gridRows > 0 && gridCols > 0 && (
        <div className="bg-white rounded-xl p-4 border border-[#E5E7EB] overflow-x-auto">
          <p className="text-sm text-gray-500 mb-3 text-center">
            구역 그리드 (행 {gridRows} × 열 {gridCols}) · 전면 (앞쪽)
          </p>
          <div className="inline-flex flex-col gap-1.5 min-w-min">
            <div className="flex items-stretch gap-1.5">
              <span className="w-8 shrink-0" aria-hidden />
              <div
                className="grid gap-1.5"
                style={{
                  gridTemplateColumns: `repeat(${gridCols}, minmax(3rem, 3.25rem))`,
                }}
              >
                {Array.from({ length: gridCols }, (_, c) => c + 1).map((col) => (
                  <div
                    key={`col-head-${col}`}
                    className="h-6 flex items-end justify-center text-[11px] font-semibold text-gray-500 pb-0.5"
                  >
                    {col}
                  </div>
                ))}
              </div>
            </div>
            {Array.from({ length: gridRows }, (_, r) => r + 1).map((row) => (
              <div key={row} className="flex items-stretch gap-1.5">
                <span className="w-8 shrink-0 flex items-center justify-end text-sm text-gray-500 pr-1">
                  {row}
                </span>
                <div
                  className="grid gap-1.5"
                  style={{
                    gridTemplateColumns: `repeat(${gridCols}, minmax(3rem, 3.25rem))`,
                  }}
                >
                  {Array.from({ length: gridCols }, (_, c) => c + 1).map((col) => {
                    const seat = byPos.get(`${row}-${col}`);
                    if (!seat) {
                      return (
                        <div
                          key={`${row}-${col}`}
                          className="h-12 rounded-md border border-dashed border-gray-200 bg-gray-50/80"
                          title="좌석 없음"
                        />
                      );
                    }
                    const gridStatus = resolveSeatGridStatus(seat);
                    const code = resolveSeatCode(seat);
                    return (
                      <button
                        key={seat.id}
                        type="button"
                        onClick={() => {
                          setMessage(null);
                          setModalSeat(seat);
                        }}
                        className={`h-12 rounded-md border text-xs font-semibold flex flex-col items-center justify-center leading-tight ${SEAT_GRID_CELL_CLASS[gridStatus]}`}
                        title={`${code} · status=${gridStatus} · ${seat.price.toLocaleString()}원`}
                      >
                        <span>{code}</span>
                        <span className="text-[10px] font-normal opacity-90">
                          {seat.price > 0 ? `${Math.round(seat.price / 10000)}만` : '-'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sectionId && (gridRows === 0 || gridCols === 0) && !loading && (
        <p className="text-sm text-amber-700">선택한 구역의 행/열 정보가 없습니다.</p>
      )}

      <SeatDetailModal
        seat={modalSeat}
        scoped={scoped}
        onClose={() => setModalSeat(null)}
        onAfterMutation={async () => {
          setMessage({ type: 'ok', text: '반영되었습니다.' });
          await refreshSeats();
        }}
      />
    </div>
  );
}

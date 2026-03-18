'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useFacilities } from '@/hooks/useFacilities';
import { useUnits } from '@/hooks/useUnits';
import { DataTable } from '@/components/table/DataTable';
import { Modal } from '@/components/modal/Modal';
import { FormInput } from '@/components/form/FormInput';
import { bulkCreateUnits, updateUnit } from '@/lib/unit.api';
import { useQueryClient } from '@tanstack/react-query';
import type { Unit } from '@/lib/unit.api';

function UnitsContent() {
  const searchParams = useSearchParams();
  const facilityId = searchParams.get('facilityId') ?? '';
  const { data: facilities = [] } = useFacilities();
  const { data: units = [], isLoading } = useUnits(facilityId || undefined);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleBulkCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facilityId) { toast.error('시설을 선택하세요.'); return; }
    const lines = bulkText.trim().split('\n').filter(Boolean);
    const unitsToCreate = lines.map((line, i) => {
      const [rowCode, colNo, basePrice] = line.split(/\s+/);
      return {
        rowCode: rowCode ?? `R${i + 1}`,
        colNo: parseInt(colNo ?? '0', 10) || i + 1,
        unitCode: `${rowCode ?? i + 1}-${colNo ?? i + 1}`,
        x: i % 10 * 50,
        y: Math.floor(i / 10) * 50,
        width: 40,
        height: 40,
        basePrice: parseInt(basePrice ?? '0', 10) || 0,
      };
    });
    if (!unitsToCreate.length) { toast.error('한 줄에 rowCode colNo basePrice 형식으로 입력하세요.'); return; }
    setSubmitting(true);
    try {
      await bulkCreateUnits({ facilityId, units: unitsToCreate });
      toast.success(`${unitsToCreate.length}개 칸이 생성되었습니다.`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'units'] });
      setOpen(false);
      setBulkText('');
    } catch (err: any) {
      toast.error(err?.message ?? '생성 실패');
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor: Record<string, string> = {
    AVAILABLE: 'bg-green-100 text-green-800',
    WAITING_QUEUE: 'bg-yellow-100 text-yellow-800',
    ACTIVE_OFFER: 'bg-orange-100 text-orange-800',
    CONTRACTED: 'bg-red-100 text-red-800',
    BLOCKED: 'bg-gray-100 text-gray-800',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">좌석(칸) 관리</h1>
        <div className="flex gap-2">
          <select
            value={facilityId}
            onChange={(e) => window.location.href = `/units?facilityId=${e.target.value}`}
            className="border rounded px-3 py-2"
          >
            <option value="">시설 선택</option>
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          {facilityId && (
            <button type="button" onClick={() => setOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              칸 일괄 생성
            </button>
          )}
        </div>
      </div>
      {!facilityId ? (
        <p className="text-gray-500">시설을 선택하세요.</p>
      ) : isLoading ? (
        <p className="text-gray-500">로딩 중...</p>
      ) : (
        <DataTable<Unit>
          data={units}
          keyExtractor={(r) => r.id}
          columns={[
            { key: 'unitCode', label: '칸코드' },
            { key: 'rowCode', label: '행' },
            { key: 'colNo', label: '열' },
            {
              key: 'basePrice',
              label: '분양가',
              render: (r) => Number(r.basePrice).toLocaleString() + '원',
            },
            {
              key: 'status',
              label: '상태',
              render: (r) => (
                <span className={`px-2 py-0.5 rounded text-xs ${statusColor[r.status] ?? 'bg-gray-100'}`}>
                  {r.status}
                </span>
              ),
            },
          ]}
        />
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="칸 일괄 생성">
        <p className="text-sm text-gray-600 mb-2">한 줄에: 행코드 열번호 분양가 (예: A 1 1000000)</p>
        <form onSubmit={handleBulkCreate}>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={10}
            className="w-full border rounded p-2 font-mono text-sm"
            placeholder="A 1 1000000&#10;A 2 1000000"
          />
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 border rounded">취소</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">생성</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function UnitsPage() {
  return (
    <Suspense fallback={<p>로딩 중...</p>}>
      <UnitsContent />
    </Suspense>
  );
}

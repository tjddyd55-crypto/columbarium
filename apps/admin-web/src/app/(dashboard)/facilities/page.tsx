'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useFacilities } from '@/hooks/useFacilities';
import { DataTable } from '@/components/table/DataTable';
import { Modal } from '@/components/modal/Modal';
import { FormInput } from '@/components/form/FormInput';
import { createFacility } from '@/lib/facility.api';
import { useQueryClient } from '@tanstack/react-query';
import type { Facility } from '@/lib/facility.api';

export default function FacilitiesPage() {
  const queryClient = useQueryClient();
  const { data: list = [], isLoading } = useFacilities();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', phone: '', addressRoad: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.addressRoad.trim()) { toast.error('도로명 주소를 입력하세요.'); return; }
    setSubmitting(true);
    try {
      await createFacility({ ...form, addressRoad: form.addressRoad });
      toast.success('시설이 등록되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'facilities'] });
      setOpen(false);
      setForm({ name: '', description: '', phone: '', addressRoad: '' });
    } catch (err: any) {
      toast.error(err?.message ?? '등록 실패');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">시설 관리</h1>
        <button type="button" onClick={() => setOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          시설 등록
        </button>
      </div>
      {isLoading ? <p className="text-gray-500">로딩 중...</p> : (
        <DataTable<Facility>
          data={list}
          keyExtractor={(r) => r.id}
          columns={[
            { key: 'name', label: '시설명' },
            { key: 'operatorName', label: '사업자' },
            { key: 'addressRoad', label: '주소' },
            {
              key: 'id',
              label: '관리',
              render: (r) => <Link href={`/units?facilityId=${r.id}`} className="text-blue-600 hover:underline">좌석 관리</Link>,
            },
          ]}
        />
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="시설 등록">
        <form onSubmit={handleCreate}>
          <FormInput label="시설명" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <FormInput label="설명" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <FormInput label="연락처" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <FormInput label="도로명 주소" value={form.addressRoad} onChange={(e) => setForm((f) => ({ ...f, addressRoad: e.target.value }))} required />
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 border rounded">취소</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">등록</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

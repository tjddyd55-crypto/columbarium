'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useOperators } from '@/hooks/useOperators';
import { DataTable } from '@/components/table/DataTable';
import { Modal } from '@/components/modal/Modal';
import { FormInput } from '@/components/form/FormInput';
import { createOperator } from '@/lib/operator.api';
import { useQueryClient } from '@tanstack/react-query';
import type { Operator } from '@/lib/operator.api';

function OperatorTable({ list }: { list: Operator[] }) {
  return (
    <DataTable<Operator>
      data={list}
      keyExtractor={(r) => r.id}
      columns={[
        { key: 'name', label: '사업자명' },
        { key: 'businessNo', label: '사업자번호' },
        { key: 'contactPhone', label: '연락처' },
        {
          key: 'status',
          label: '상태',
          render: (r) => (
            <span className={`px-2 py-0.5 rounded text-xs ${r.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
              {r.status}
            </span>
          ),
        },
      ]}
    />
  );
}

export default function OperatorsPage() {
  const queryClient = useQueryClient();
  const { data: list = [], isLoading } = useOperators();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', businessNo: '', contactPhone: '', contactEmail: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createOperator(form);
      toast.success('사업자가 등록되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'operators'] });
      setOpen(false);
      setForm({ name: '', businessNo: '', contactPhone: '', contactEmail: '' });
    } catch (err: any) {
      toast.error(err?.message ?? '등록 실패');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">사업자 관리</h1>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          사업자 등록
        </button>
      </div>
      {isLoading ? <p className="text-gray-500">로딩 중...</p> : <OperatorTable list={list} />}

      <Modal open={open} onClose={() => setOpen(false)} title="사업자 등록">
        <form onSubmit={handleCreate}>
          <FormInput label="사업자명" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <FormInput label="사업자번호" value={form.businessNo} onChange={(e) => setForm((f) => ({ ...f, businessNo: e.target.value }))} required />
          <FormInput label="연락처" value={form.contactPhone} onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))} />
          <FormInput label="이메일" type="email" value={form.contactEmail} onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))} />
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 border rounded">취소</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">등록</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

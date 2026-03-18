'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useOperatorResale } from '@/hooks/useOperatorResale';
import { DataTable } from '@/components/table/DataTable';
import { approveResale, rejectResale } from '@/lib/resale.api';
import { useQueryClient } from '@tanstack/react-query';
import { getUser } from '@/lib/auth';

export default function ResalePage() {
  const [status, setStatus] = useState<string>('REQUESTED');
  const { data: list = [], isLoading } = useOperatorResale(status);
  const queryClient = useQueryClient();
  const user = getUser();
  const operatorId = user?.operatorId ?? user?.id ?? '';

  const handleApprove = async (id: string) => {
    try {
      await approveResale(id, operatorId);
      toast.success('승인되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'resale'] });
    } catch (err: any) {
      toast.error(err?.message ?? '승인 실패');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectResale(id, operatorId);
      toast.success('반려되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'resale'] });
    } catch (err: any) {
      toast.error(err?.message ?? '반려 실패');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">재판매 관리</h1>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded px-3 py-2">
          <option value="REQUESTED">승인 대기</option>
          <option value="LISTED">판매 중</option>
          <option value="SOLD">판매 완료</option>
          <option value="REJECTED">반려</option>
        </select>
      </div>
      {isLoading ? <p className="text-gray-500">로딩 중...</p> : (
        <DataTable
          data={list}
          keyExtractor={(r: { id: string }) => r.id}
          columns={[
            { key: 'facilityName', label: '시설' },
            { key: 'unitCode', label: '칸' },
            { key: 'askingPrice', label: '희망가', render: (r: { askingPrice: number }) => Number(r.askingPrice).toLocaleString() + '원' },
            { key: 'status', label: '상태' },
            { key: 'createdAt', label: '신청일', render: (r: { createdAt: string }) => new Date(r.createdAt).toLocaleDateString('ko-KR') },
            ...(status === 'REQUESTED'
              ? [
                  {
                    key: 'actions',
                    label: '처리',
                    render: (r: { id: string }) => (
                      <span className="flex gap-2">
                        <button type="button" onClick={() => handleApprove(r.id)} className="text-green-600 hover:underline">승인</button>
                        <button type="button" onClick={() => handleReject(r.id)} className="text-red-600 hover:underline">반려</button>
                      </span>
                    ),
                  },
                ]
              : []),
          ]}
        />
      )}
    </div>
  );
}

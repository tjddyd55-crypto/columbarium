import { useState } from 'react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { Plus, Search, Eye, Edit, Ban } from 'lucide-react';

const members = [
  { id: 1, name: '홍길동', email: 'hong@example.com', phone: '010-1234-5678', contracts: 1, status: 'ACTIVE', joinDate: '2024-01-15' },
  { id: 2, name: '김민수', email: 'kim@example.com', phone: '010-2345-6789', contracts: 2, status: 'ACTIVE', joinDate: '2024-02-01' },
  { id: 3, name: '이영희', email: 'lee@example.com', phone: '010-3456-7890', contracts: 0, status: 'INACTIVE', joinDate: '2023-12-10' },
];

export default function MemberManagement() {
  const [searchTerm, setSearchTerm] = useState('');

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: '이름', sortable: true },
    { key: 'email', label: '이메일', sortable: true },
    { key: 'phone', label: '연락처', sortable: true },
    { key: 'contracts', label: '계약 수', sortable: true },
    {
      key: 'status',
      label: '상태',
      sortable: true,
      render: (value: string) => <StatusBadge status={value === 'INACTIVE' ? '휴면' : value} />
    },
    { key: 'joinDate', label: '가입일', sortable: true },
    {
      key: 'actions',
      label: '관리',
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          <button className="flex items-center gap-1 px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors text-sm">
            <Eye className="w-4 h-4" />
            상세
          </button>
          <button className="flex items-center gap-1 px-3 py-1 text-gray-600 border border-gray-600 rounded hover:bg-gray-50 transition-colors text-sm">
            <Edit className="w-4 h-4" />
            수정
          </button>
          {row.status === 'ACTIVE' && (
            <button className="flex items-center gap-1 px-3 py-1 text-red-600 border border-red-600 rounded hover:bg-red-50 transition-colors text-sm">
              <Ban className="w-4 h-4" />
              정지
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#1E293B]">회원 관리</h3>
          <p className="text-sm text-gray-600">회원 정보를 확인하고 관리하세요</p>
        </div>
        <button className="flex items-center gap-2 bg-[#3B82F6] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
          <Plus className="w-5 h-5" />
          회원 추가
        </button>
      </div>

      <div className="bg-white rounded-lg p-4 border border-[#E5E7EB]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="이름, 이메일 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-gray-600">전체 회원</p>
          <p className="text-2xl font-bold text-[#1E293B] mt-1">3,456</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-gray-600">활성 회원</p>
          <p className="text-2xl font-bold text-green-600 mt-1">3,120</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-gray-600">휴면 회원</p>
          <p className="text-2xl font-bold text-gray-600 mt-1">336</p>
        </div>
      </div>

      <DataTable columns={columns} data={members} />
    </div>
  );
}

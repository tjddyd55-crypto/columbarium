import { useState } from 'react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { Plus, Search, Eye, Edit, Ban } from 'lucide-react';

const operators = [
  { id: 1, name: '강남 봉안당', owner: '김철수', email: 'gangnam@nakgoldang.com', phone: '010-1234-5678', facilities: 3, status: 'ACTIVE', createdAt: '2024-01-15' },
  { id: 2, name: '서초 봉안당', owner: '이영희', email: 'seocho@nakgoldang.com', phone: '010-2345-6789', facilities: 2, status: 'ACTIVE', createdAt: '2024-02-20' },
  { id: 3, name: '역삼 봉안당', owner: '박민수', email: 'yeoksam@nakgoldang.com', phone: '010-3456-7890', facilities: 1, status: 'PENDING', createdAt: '2024-03-10' },
];

export default function OperatorManagement() {
  const [searchTerm, setSearchTerm] = useState('');

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: '사업자명', sortable: true },
    { key: 'owner', label: '대표자', sortable: true },
    { key: 'email', label: '이메일', sortable: true },
    { key: 'phone', label: '연락처', sortable: true },
    { key: 'facilities', label: '시설 수', sortable: true },
    {
      key: 'status',
      label: '상태',
      sortable: true,
      render: (value: string) => <StatusBadge status={value} />
    },
    { key: 'createdAt', label: '등록일', sortable: true },
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
          <h3 className="text-lg font-semibold text-[#1E293B]">사업자 관리</h3>
          <p className="text-sm text-gray-600">등록된 사업자를 관리하세요</p>
        </div>
        <button className="flex items-center gap-2 bg-[#3B82F6] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
          <Plus className="w-5 h-5" />
          사업자 추가
        </button>
      </div>

      <div className="bg-white rounded-lg p-4 border border-[#E5E7EB]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="사업자명, 대표자 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-gray-600">전체 사업자</p>
          <p className="text-2xl font-bold text-[#1E293B] mt-1">3</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-gray-600">활성 사업자</p>
          <p className="text-2xl font-bold text-green-600 mt-1">2</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-gray-600">승인 대기</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">1</p>
        </div>
      </div>

      <DataTable columns={columns} data={operators} />
    </div>
  );
}

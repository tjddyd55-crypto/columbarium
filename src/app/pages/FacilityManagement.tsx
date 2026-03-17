import { useState } from 'react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { Plus, Search, MapPin, Eye, Edit } from 'lucide-react';

const facilities = [
  { id: 1, name: '강남점 1호점', operator: '강남 낙골당', address: '서울 강남구 테헤란로 123', units: 50, status: 'ACTIVE', occupancy: '85%' },
  { id: 2, name: '강남점 2호점', operator: '강남 낙골당', address: '서울 강남구 역삼로 456', units: 40, status: 'ACTIVE', occupancy: '92%' },
  { id: 3, name: '서초 본점', operator: '서초 낙골당', address: '서울 서초구 서초대로 789', units: 60, status: 'MAINTENANCE', occupancy: '0%' },
];

export default function FacilityManagement() {
  const [searchTerm, setSearchTerm] = useState('');

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: '시설명', sortable: true },
    { key: 'operator', label: '사업자', sortable: true },
    {
      key: 'address',
      label: '주소',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{value}</span>
        </div>
      ),
    },
    { key: 'units', label: '봉안함 수', sortable: true },
    {
      key: 'status',
      label: '상태',
      sortable: true,
      render: (value: string) => <StatusBadge status={value === 'MAINTENANCE' ? '점검중' : value} />
    },
    { key: 'occupancy', label: '점유율', sortable: true },
    {
      key: 'actions',
      label: '관리',
      render: () => (
        <div className="flex gap-2">
          <button className="flex items-center gap-1 px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors text-sm">
            <Eye className="w-4 h-4" />
            상세
          </button>
          <button className="flex items-center gap-1 px-3 py-1 text-gray-600 border border-gray-600 rounded hover:bg-gray-50 transition-colors text-sm">
            <Edit className="w-4 h-4" />
            수정
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#1E293B]">시설 관리</h3>
          <p className="text-sm text-gray-600">등록된 시설을 관리하세요</p>
        </div>
        <button className="flex items-center gap-2 bg-[#3B82F6] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
          <Plus className="w-5 h-5" />
          시설 추가
        </button>
      </div>

      <div className="bg-white rounded-lg p-4 border border-[#E5E7EB]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="시설명, 주소 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-gray-600">전체 시설</p>
          <p className="text-2xl font-bold text-[#1E293B] mt-1">12</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-gray-600">운영 중</p>
          <p className="text-2xl font-bold text-green-600 mt-1">10</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-gray-600">점검 중</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">2</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-gray-600">평균 점유율</p>
          <p className="text-2xl font-bold text-[#3B82F6] mt-1">88%</p>
        </div>
      </div>

      <DataTable columns={columns} data={facilities} />
    </div>
  );
}

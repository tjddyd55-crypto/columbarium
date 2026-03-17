import { useState } from 'react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { Search, Filter, Download } from 'lucide-react';

const logs = [
  { id: 1, user: '관리자', action: '로그인', target: '시스템', ip: '192.168.1.100', timestamp: '2024-03-17 15:30:25', status: 'SUCCESS' },
  { id: 2, user: '관리자', action: '사업자 등록', target: '강남 납골당', ip: '192.168.1.100', timestamp: '2024-03-17 15:32:10', status: 'SUCCESS' },
  { id: 3, user: '관리자', action: '계약 수정', target: '계약 #123', ip: '192.168.1.100', timestamp: '2024-03-17 15:35:45', status: 'SUCCESS' },
  { id: 4, user: '관리자', action: '봉안함 삭제', target: '봉안함 A-12', ip: '192.168.1.100', timestamp: '2024-03-17 15:38:20', status: 'FAILED' },
];

export default function AuditLog() {
  const [searchTerm, setSearchTerm] = useState('');

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'user', label: '사용자', sortable: true },
    { key: 'action', label: '작업', sortable: true },
    { key: 'target', label: '대상', sortable: true },
    { key: 'ip', label: 'IP 주소', sortable: true },
    { key: 'timestamp', label: '시간', sortable: true },
    {
      key: 'status',
      label: '상태',
      sortable: true,
      render: (value: string) => <StatusBadge status={value === 'SUCCESS' ? '성공' : '실패'} />
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#1E293B]">감사 로그</h3>
          <p className="text-sm text-gray-600">시스템 활동 기록을 확인하세요</p>
        </div>
        <button className="flex items-center gap-2 bg-[#3B82F6] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
          <Download className="w-5 h-5" />
          로그 내보내기
        </button>
      </div>

      <div className="bg-white rounded-lg p-4 border border-[#E5E7EB]">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="사용자, 작업, 대상 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-5 h-5 text-gray-600" />
            필터
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-gray-600">총 작업</p>
          <p className="text-2xl font-bold text-[#1E293B] mt-1">{logs.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-gray-600">성공</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {logs.filter((log) => log.status === 'SUCCESS').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-gray-600">실패</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {logs.filter((log) => log.status === 'FAILED').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-gray-600">성공률</p>
          <p className="text-2xl font-bold text-[#3B82F6] mt-1">75%</p>
        </div>
      </div>

      <DataTable columns={columns} data={logs} />
    </div>
  );
}

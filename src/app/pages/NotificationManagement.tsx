import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { Plus, Send, Filter } from 'lucide-react';

const notifications = [
  { id: 1, title: '시스템 점검 안내', target: '전체', type: '공지', sentAt: '2024-03-15 10:00', status: 'SENT', readRate: '85%' },
  { id: 2, title: '계약 만료 알림', target: '개별', type: '알림', sentAt: '2024-03-16 09:00', status: 'SENT', readRate: '92%' },
  { id: 3, title: '신규 이벤트 안내', target: '전체', type: '마케팅', sentAt: '2024-03-17 14:00', status: 'SCHEDULED', readRate: '-' },
];

export default function NotificationManagement() {
  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'title', label: '제목', sortable: true },
    { key: 'target', label: '대상', sortable: true },
    {
      key: 'type',
      label: '유형',
      sortable: true,
      render: (value: string) => <StatusBadge status={value} />
    },
    { key: 'sentAt', label: '발송시간', sortable: true },
    {
      key: 'status',
      label: '상태',
      sortable: true,
      render: (value: string) => <StatusBadge status={value === 'SENT' ? '발송완료' : value === 'SCHEDULED' ? '예약' : value} />
    },
    { key: 'readRate', label: '읽음율', sortable: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#1E293B]">알림 관리</h3>
          <p className="text-sm text-gray-600">알림을 발송하고 관리하세요</p>
        </div>
        <button className="flex items-center gap-2 bg-[#3B82F6] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
          <Plus className="w-5 h-5" />
          알림 생성
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <div className="flex items-center gap-3">
            <Send className="w-8 h-8 text-[#3B82F6]" />
            <div>
              <p className="text-sm text-gray-600">발송완료</p>
              <p className="text-2xl font-bold text-[#1E293B]">2건</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <div className="flex items-center gap-3">
            <Send className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">예약</p>
              <p className="text-2xl font-bold text-[#1E293B]">1건</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <div className="flex items-center gap-3">
            <Send className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">평균 읽음율</p>
              <p className="text-2xl font-bold text-[#1E293B]">88.5%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <div className="flex items-center gap-3">
            <Filter className="w-8 h-8 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">이번 달 발송</p>
              <p className="text-2xl font-bold text-[#1E293B]">24건</p>
            </div>
          </div>
        </div>
      </div>

      <DataTable columns={columns} data={notifications} />
    </div>
  );
}

# 봉안당 관리자 대시보드 - 나머지 페이지 (Part 2)

## 이 파일의 페이지들을 추가로 생성해주세요

---

## `/src/app/pages/OperatorManagement.tsx`

```tsx
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
```

---

## `/src/app/pages/FacilityManagement.tsx`

```tsx
import { useState } from 'react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { Plus, Search, MapPin, Eye, Edit } from 'lucide-react';

const facilities = [
  { id: 1, name: '강남점 1호점', operator: '강남 봉안당', address: '서울 강남구 테헤란로 123', units: 50, status: 'ACTIVE', occupancy: '85%' },
  { id: 2, name: '강남점 2호점', operator: '강남 봉안당', address: '서울 강남구 역삼로 456', units: 40, status: 'ACTIVE', occupancy: '92%' },
  { id: 3, name: '서초 본점', operator: '서초 봉안당', address: '서울 서초구 서초대로 789', units: 60, status: 'MAINTENANCE', occupancy: '0%' },
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
```

---

## `/src/app/pages/MemberManagement.tsx`

```tsx
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
```

---

## `/src/app/pages/NotificationManagement.tsx`

```tsx
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
```

---

## `/src/app/pages/AuditLog.tsx`

```tsx
import { useState } from 'react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { Search, Filter, Download } from 'lucide-react';

const logs = [
  { id: 1, user: '관리자', action: '로그인', target: '시스템', ip: '192.168.1.100', timestamp: '2024-03-17 15:30:25', status: 'SUCCESS' },
  { id: 2, user: '관리자', action: '사업자 등록', target: '강남 봉안당', ip: '192.168.1.100', timestamp: '2024-03-17 15:32:10', status: 'SUCCESS' },
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
```

---

## 🎯 Cursor AI 사용법

1. **먼저 CURSOR_AI_GUIDE.md의 모든 내용을 Cursor에 붙여넣기**
2. **그 다음 이 파일(CURSOR_AI_REMAINING_PAGES.md)을 추가로 붙여넣기**
3. **다음 프롬프트 입력:**

```
위의 나머지 페이지 5개(OperatorManagement, FacilityManagement, MemberManagement, NotificationManagement, AuditLog)를 생성해줘.
```

---

## ✅ 완료 체크리스트

모든 페이지가 생성되었는지 확인:

- [ ] `/src/app/pages/Login.tsx`
- [ ] `/src/app/pages/Dashboard.tsx`
- [ ] `/src/app/pages/OperatorManagement.tsx`
- [ ] `/src/app/pages/FacilityManagement.tsx`
- [ ] `/src/app/pages/UnitManagement.tsx`
- [ ] `/src/app/pages/QueueManagement.tsx`
- [ ] `/src/app/pages/ContractManagement.tsx`
- [ ] `/src/app/pages/ResaleManagement.tsx`
- [ ] `/src/app/pages/MemberManagement.tsx`
- [ ] `/src/app/pages/NotificationManagement.tsx`
- [ ] `/src/app/pages/AuditLog.tsx`

**총 11개 페이지 완성!**

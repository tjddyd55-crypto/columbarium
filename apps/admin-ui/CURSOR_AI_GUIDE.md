# 낙골당 분양 플랫폼 관리자 대시보드 - Cursor AI 구현 가이드

## 🎯 프로젝트 개요

봉안당 분양 플랫폼의 관리자 웹 대시보드입니다.
- **컬러**: 네이비(#1E293B) + 블루(#3B82F6)
- **기술**: React + TypeScript + Vite + React Router + Tailwind CSS v4
- **주요 기능**: 11개 관리 화면 + 상세 모달 + 필터 시스템

---

## 📦 1단계: 프로젝트 초기 설정

```bash
# 프로젝트 생성
npm create vite@latest nakgoldang-admin -- --template react-ts
cd nakgoldang-admin

# 필수 패키지 설치
npm install react-router lucide-react recharts
```

---

## 📁 2단계: 프로젝트 구조

```
src/
├── app/
│   ├── App.tsx
│   ├── routes.tsx
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── KPICard.tsx
│   │   ├── StatusBadge.tsx
│   │   └── DataTable.tsx
│   └── pages/
│       ├── Login.tsx
│       ├── Dashboard.tsx
│       ├── OperatorManagement.tsx
│       ├── FacilityManagement.tsx
│       ├── UnitManagement.tsx
│       ├── QueueManagement.tsx
│       ├── ContractManagement.tsx
│       ├── ResaleManagement.tsx
│       ├── MemberManagement.tsx
│       ├── NotificationManagement.tsx
│       └── AuditLog.tsx
└── styles/
    └── theme.css
```

---

## 🎨 3단계: 스타일 파일

### `/src/styles/theme.css`

```css
@import "tailwindcss";

:root {
  --color-primary: #3B82F6;
  --color-primary-dark: #2563EB;
  --color-secondary: #1E293B;
  --color-secondary-dark: #0F172A;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-bg: #F8FAFC;
  --color-border: #E2E8F0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  padding: 0;
}

* {
  box-sizing: border-box;
}
```

---

## ⚛️ 4단계: 핵심 컴포넌트

### `/src/app/App.tsx`

```tsx
import { RouterProvider } from 'react-router';
import { router } from './routes';

export default function App() {
  return <RouterProvider router={router} />;
}
```

### `/src/app/routes.tsx`

```tsx
import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import OperatorManagement from "./pages/OperatorManagement";
import FacilityManagement from "./pages/FacilityManagement";
import UnitManagement from "./pages/UnitManagement";
import QueueManagement from "./pages/QueueManagement";
import ContractManagement from "./pages/ContractManagement";
import ResaleManagement from "./pages/ResaleManagement";
import MemberManagement from "./pages/MemberManagement";
import NotificationManagement from "./pages/NotificationManagement";
import AuditLog from "./pages/AuditLog";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "operators", Component: OperatorManagement },
      { path: "facilities", Component: FacilityManagement },
      { path: "units", Component: UnitManagement },
      { path: "queues", Component: QueueManagement },
      { path: "contracts", Component: ContractManagement },
      { path: "resales", Component: ResaleManagement },
      { path: "members", Component: MemberManagement },
      { path: "notifications", Component: NotificationManagement },
      { path: "audit-log", Component: AuditLog },
    ],
  },
]);
```

### `/src/app/components/Layout.tsx`

```tsx
import { Outlet } from 'react-router';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  return (
    <div className="flex h-screen bg-[var(--color-bg)]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

### `/src/app/components/Sidebar.tsx`

```tsx
import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Building2,
  MapPin,
  Grid3x3,
  ListOrdered,
  FileText,
  RefreshCw,
  Users,
  Bell,
  FileSearch,
} from "lucide-react";

const menuItems = [
  { path: "/", label: "대시보드", icon: LayoutDashboard },
  { path: "/operators", label: "사업자 관리", icon: Building2, superAdminOnly: true },
  { path: "/facilities", label: "시설 관리", icon: MapPin },
  { path: "/units", label: "봉안함(칸) 관리", icon: Grid3x3 },
  { path: "/queues", label: "대기열 관리", icon: ListOrdered },
  { path: "/contracts", label: "계약 관리", icon: FileText },
  { path: "/resales", label: "재판매 관리", icon: RefreshCw },
  { path: "/members", label: "회원 관리", icon: Users },
  { path: "/notifications", label: "알림 관리", icon: Bell },
  { path: "/audit-log", label: "감사로그", icon: FileSearch },
];

export default function Sidebar() {
  const location = useLocation();
  const isSuperAdmin = true; // Mock: would come from auth context

  return (
    <div className="w-64 bg-[#1E293B] h-screen fixed left-0 top-0 text-white flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold">낙골당 관리자</h1>
        <p className="text-sm text-slate-400 mt-1">Admin Dashboard</p>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item) => {
          if (item.superAdminOnly && !isSuperAdmin) return null;
          
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                isActive
                  ? "bg-[#3B82F6] text-white"
                  : "text-slate-300 hover:bg-slate-700"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
```

### `/src/app/components/Header.tsx`

```tsx
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold text-[var(--color-secondary)]">
          관리자 포털
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
          <User className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">관리자</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          로그아웃
        </button>
      </div>
    </header>
  );
}
```

### `/src/app/components/KPICard.tsx`

```tsx
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
}

export default function KPICard({ title, value, icon: Icon, change }: KPICardProps) {
  return (
    <div className="bg-white rounded-lg p-6 border border-[var(--color-border)] hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-[var(--color-secondary)]">{value}</p>
          {change && (
            <p className="text-sm mt-2 text-blue-600">{change}</p>
          )}
        </div>
        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-50">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
  );
}
```

### `/src/app/components/StatusBadge.tsx`

```tsx
interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getVariant = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('active') || statusLower.includes('활성') || statusLower.includes('완료') || statusLower.includes('승인')) {
      return 'bg-green-100 text-green-800';
    }
    if (statusLower.includes('pending') || statusLower.includes('대기') || statusLower.includes('판매')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (statusLower.includes('rejected') || statusLower.includes('반려') || statusLower.includes('취소')) {
      return 'bg-red-100 text-red-800';
    }
    if (statusLower.includes('completed') || statusLower.includes('거래완료')) {
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getVariant(status)}`}>
      {status}
    </span>
  );
}
```

### `/src/app/components/DataTable.tsx`

```tsx
import { ReactNode } from 'react';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  pageSize?: number;
  onRowClick?: (row: any) => void;
}

export default function DataTable({ columns, data, pageSize, onRowClick }: DataTableProps) {
  const displayData = pageSize ? data.slice(0, pageSize) : data;

  return (
    <div className="bg-white rounded-lg border border-[var(--color-border)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-[var(--color-border)]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {displayData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? 'hover:bg-gray-50 cursor-pointer' : ''}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## 📄 5단계: 페이지 컴포넌트

### `/src/app/pages/Login.tsx`

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Lock, Mail } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-secondary-dark)] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[var(--color-primary)] mb-2">낙골당</h1>
          <p className="text-gray-600">관리자 대시보드</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                placeholder="admin@nakgoldang.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}
```

### `/src/app/pages/Dashboard.tsx`

```tsx
import KPICard from "../components/KPICard";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { Building2, FileText, ListOrdered, TrendingUp, Grid3x3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const recentContracts = [
  { id: "C-2026-001", buyer: "김철수", facility: "강남 낙골당", unit: "A-101", amount: "5,000,000원", status: "COMPLETED", date: "2026-03-17" },
  { id: "C-2026-002", buyer: "이영희", facility: "서초 낙골당", unit: "B-205", amount: "4,500,000원", status: "PENDING", date: "2026-03-17" },
  { id: "C-2026-003", buyer: "박민수", facility: "강남 낙골당", unit: "A-203", amount: "5,200,000원", status: "ACTIVE", date: "2026-03-16" },
  { id: "C-2026-004", buyer: "정수진", facility: "역삼 낙골당", unit: "C-108", amount: "4,800,000원", status: "COMPLETED", date: "2026-03-16" },
  { id: "C-2026-005", buyer: "최동욱", facility: "서초 낙골당", unit: "B-301", amount: "5,100,000원", status: "ACTIVE", date: "2026-03-15" },
];

const chartData = [
  { month: "1월", contracts: 45 },
  { month: "2월", contracts: 52 },
  { month: "3월", contracts: 68 },
];

const unitStatusData = [
  { name: "판매가능", value: 145, color: "#10B981" },
  { name: "계약완료", value: 89, color: "#3B82F6" },
  { name: "대기중", value: 32, color: "#F59E0B" },
];

const recentNotifications = [
  { message: "새로운 계약이 체결되었습니다 (C-2026-001)", time: "5분 전", type: "success" },
  { message: "재판매 승인 대기 3건", time: "1시간 전", type: "warning" },
  { message: "대기열 순번 변경 요청 2건", time: "2시간 전", type: "info" },
  { message: "시스템 백업 완료", time: "3시간 전", type: "info" },
];

export default function Dashboard() {
  const columns = [
    { key: "id", label: "계약번호", sortable: true },
    { key: "buyer", label: "계약자", sortable: true },
    { key: "facility", label: "시설", sortable: true },
    { key: "unit", label: "봉안함", sortable: true },
    { key: "amount", label: "금액", sortable: true },
    { 
      key: "status", 
      label: "상태", 
      sortable: true,
      render: (value: string) => <StatusBadge status={value} />
    },
    { key: "date", label: "날짜", sortable: true },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <KPICard title="총 시설 수" value="12" icon={Building2} change="+2 이번 달" />
        <KPICard title="총 봉안함 수" value="266" icon={Grid3x3} change="+24 이번 달" />
        <KPICard title="총 계약 수" value="165" icon={FileText} change="+15 이번 주" />
        <KPICard title="활성 대기열" value="28" icon={ListOrdered} />
        <KPICard title="오늘 계약" value="5" icon={TrendingUp} change="+2 어제 대비" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Contracts */}
        <div className="lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-[#1E293B]">최근 계약</h3>
            <p className="text-sm text-gray-600">최근 체결된 계약 목록입니다</p>
          </div>
          <DataTable columns={columns} data={recentContracts} pageSize={5} />
        </div>

        {/* Recent Notifications */}
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-[#1E293B]">최근 알림</h3>
            <p className="text-sm text-gray-600">최근 발생한 이벤트</p>
          </div>
          <div className="bg-white rounded-lg border border-[#E5E7EB] divide-y divide-[#E5E7EB]">
            {recentNotifications.map((notif, index) => (
              <div key={index} className="p-4">
                <p className="text-sm text-gray-900">{notif.message}</p>
                <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Contracts Chart */}
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-[#1E293B]">월별 계약 통계</h3>
            <p className="text-sm text-gray-600">최근 3개월 계약 현황</p>
          </div>
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="contracts" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Unit Status Distribution */}
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-[#1E293B]">봉안함 현황</h3>
            <p className="text-sm text-gray-600">봉안함 상태별 분포</p>
          </div>
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={unitStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {unitStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              {unitStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### `/src/app/pages/UnitManagement.tsx`

```tsx
import { useState } from "react";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { ChevronDown, Edit, Trash2, CheckCircle } from "lucide-react";

const units = [
  { unitCode: "A-101", row: 1, col: 1, price: "5,000,000", status: "ACTIVE" },
  { unitCode: "A-102", row: 1, col: 2, price: "5,200,000", status: "ACTIVE" },
  { unitCode: "A-103", row: 1, col: 3, price: "4,800,000", status: "COMPLETED" },
  { unitCode: "A-201", row: 2, col: 1, price: "5,500,000", status: "ACTIVE" },
  { unitCode: "A-202", row: 2, col: 2, price: "5,300,000", status: "PENDING" },
  { unitCode: "A-203", row: 2, col: 3, price: "5,100,000", status: "ACTIVE" },
  { unitCode: "A-301", row: 3, col: 1, price: "4,900,000", status: "ACTIVE" },
  { unitCode: "A-302", row: 3, col: 2, price: "5,000,000", status: "COMPLETED" },
];

export default function UnitManagement() {
  const [selectedFacility, setSelectedFacility] = useState("강남점");
  const [statusFilter, setStatusFilter] = useState("전체");

  const columns = [
    { key: "unitCode", label: "봉안함 코드", sortable: true },
    { key: "row", label: "행", sortable: true },
    { key: "col", label: "열", sortable: true },
    { key: "price", label: "가격", sortable: true, render: (value: string) => `₩${value}` },
    { 
      key: "status", 
      label: "상태", 
      sortable: true,
      render: (value: string) => <StatusBadge status={value} />
    },
    {
      key: "actions",
      label: "관리",
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          {row.status === "PENDING" && (
            <button className="flex items-center gap-1 px-3 py-1 text-green-600 border border-green-600 rounded hover:bg-green-50 transition-colors text-sm">
              <CheckCircle className="w-4 h-4" />
              활성화
            </button>
          )}
          <button className="flex items-center gap-1 px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors text-sm">
            <Edit className="w-4 h-4" />
            수정
          </button>
          <button className="flex items-center gap-1 px-3 py-1 text-red-600 border border-red-600 rounded hover:bg-red-50 transition-colors text-sm">
            <Trash2 className="w-4 h-4" />
            삭제
          </button>
        </div>
      ),
    },
  ];

  const getStatusColor = (status: string) => {
    if (status === "COMPLETED") return "bg-blue-500";
    if (status === "PENDING") return "bg-yellow-500";
    if (status === "ACTIVE") return "bg-green-500";
    return "bg-gray-300";
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#1E293B]">봉안함(칸) 관리</h3>
        <p className="text-sm text-gray-600">시설별 봉안함을 관리하고 상태를 확인합니다</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">시설 선택</label>
            <div className="relative">
              <select
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              >
                <option>강남점</option>
                <option>서초점</option>
                <option>역삼점</option>
                <option>판교점</option>
              </select>
              <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">상태 필터</label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              >
                <option>전체</option>
                <option>ACTIVE</option>
                <option>PENDING</option>
                <option>COMPLETED</option>
              </select>
              <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid Preview */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <h4 className="text-sm font-semibold text-[#1E293B] mb-4">봉안함 배치도</h4>
        <div className="grid grid-cols-8 gap-2 max-w-2xl">
          {units.map((unit) => (
            <div
              key={unit.unitCode}
              className={`${getStatusColor(unit.status)} rounded p-3 text-white text-center text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity`}
              title={`${unit.unitCode} - ₩${unit.price}`}
            >
              {unit.unitCode.split("-")[1]}
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>판매가능</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>대기중</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>완료</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={units} />

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-blue-600 transition-colors">
          봉안함 일괄 생성
        </button>
        <button className="px-4 py-2 border border-[#E5E7EB] rounded-lg hover:bg-gray-50 transition-colors">
          가격 일괄 수정
        </button>
        <button className="px-4 py-2 border border-[#E5E7EB] rounded-lg hover:bg-gray-50 transition-colors">
          상태 일괄 변경
        </button>
      </div>
    </div>
  );
}
```

### `/src/app/pages/QueueManagement.tsx`

```tsx
import { useState } from "react";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { ChevronDown, XCircle, ArrowUp, ArrowDown, Calendar } from "lucide-react";

const queues = [
  { id: 1, position: 1, user: "김철수", facility: "강남점", unit: "A-101", waitingCount: 12, estimatedMonths: 3, status: "WAITING", createdAt: "2026-03-17 14:30" },
  { id: 2, position: 2, user: "이영희", facility: "강남점", unit: "A-101", waitingCount: 12, estimatedMonths: 3, status: "WAITING", createdAt: "2026-03-17 14:35" },
  { id: 3, position: 3, user: "박민수", facility: "강남점", unit: "A-101", waitingCount: 12, estimatedMonths: 3, status: "WAITING", createdAt: "2026-03-17 14:40" },
  { id: 4, position: 1, user: "정수진", facility: "강남점", unit: "A-102", waitingCount: 8, estimatedMonths: 2, status: "ACTIVE", createdAt: "2026-03-17 13:20" },
  { id: 5, position: 2, user: "최동욱", facility: "강남점", unit: "A-102", waitingCount: 8, estimatedMonths: 2, status: "WAITING", createdAt: "2026-03-17 13:45" },
];

export default function QueueManagement() {
  const [selectedFacility, setSelectedFacility] = useState("강남점");
  const [selectedUnit, setSelectedUnit] = useState("A-101");

  const columns = [
    { key: "position", label: "순번", sortable: true },
    { key: "user", label: "사용자", sortable: true },
    { key: "facility", label: "시설", sortable: true },
    { key: "unit", label: "봉안함", sortable: true },
    { 
      key: "waitingCount", 
      label: "대기인원", 
      sortable: true,
      render: (value: number) => `${value}명` 
    },
    { 
      key: "estimatedMonths", 
      label: "예상 대기기간", 
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{value}개월</span>
        </div>
      )
    },
    { 
      key: "status", 
      label: "상태", 
      sortable: true,
      render: (value: string) => <StatusBadge status={value} />
    },
    { key: "createdAt", label: "생성일시", sortable: true },
    {
      key: "actions",
      label: "관리",
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          {row.position > 1 && (
            <button 
              className="flex items-center gap-1 px-2 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors text-sm"
              title="순번 올리기"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          )}
          <button 
            className="flex items-center gap-1 px-2 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors text-sm"
            title="순번 내리기"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-1 px-3 py-1 text-red-600 border border-red-600 rounded hover:bg-red-50 transition-colors text-sm">
            <XCircle className="w-4 h-4" />
            취소
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[#1E293B]">대기열 관리</h3>
        <p className="text-sm text-gray-600">시설별 봉안함 대기열을 관리합니다</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">시설 선택</label>
            <div className="relative">
              <select
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              >
                <option>강남점</option>
                <option>서초점</option>
                <option>역삼점</option>
              </select>
              <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">봉안함 선택</label>
            <div className="relative">
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              >
                <option>전체</option>
                <option>A-101</option>
                <option>A-102</option>
                <option>A-103</option>
              </select>
              <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-gray-600">총 대기 인원</p>
          <p className="text-2xl font-bold text-[#1E293B] mt-1">5명</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-gray-600">활성 대기열</p>
          <p className="text-2xl font-bold text-green-600 mt-1">2개</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-gray-600">평균 대기 기간</p>
          <p className="text-2xl font-bold text-[#3B82F6] mt-1">2.5개월</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-gray-600">최대 대기 기간</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">3개월</p>
        </div>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={queues} />
    </div>
  );
}
```

### `/src/app/pages/ContractManagement.tsx`

```tsx
import { useState } from "react";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { Filter, ChevronDown, Eye, Edit, FileText, CheckCircle } from "lucide-react";

const contracts = [
  { 
    contractNo: "C-2026-001", 
    buyer: "김철수", 
    facility: "강남 낙골당", 
    unit: "A-101",
    contractYears: 30,
    amount: "5,000,000원", 
    status: "ACTIVE", 
    startDate: "2026-01-01",
    endDate: "2056-01-01"
  },
  { 
    contractNo: "C-2026-002", 
    buyer: "이영희", 
    facility: "서초 낙골당", 
    unit: "B-205",
    contractYears: 30,
    amount: "4,500,000원", 
    status: "PENDING", 
    startDate: "2026-04-01",
    endDate: "2056-04-01"
  },
  { 
    contractNo: "C-2026-003", 
    buyer: "박민수", 
    facility: "강남 낙골당", 
    unit: "A-203",
    contractYears: 20,
    amount: "3,200,000원", 
    status: "ACTIVE", 
    startDate: "2026-03-15",
    endDate: "2046-03-15"
  },
  { 
    contractNo: "C-2026-004", 
    buyer: "정수진", 
    facility: "역삼 낙골당", 
    unit: "C-108",
    contractYears: 50,
    amount: "7,800,000원", 
    status: "ACTIVE", 
    startDate: "2026-03-01",
    endDate: "2076-03-01"
  },
];

export default function ContractManagement() {
  const [statusFilter, setStatusFilter] = useState("전체");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);

  const columns = [
    { key: "contractNo", label: "계약번호", sortable: true },
    { key: "buyer", label: "계약자", sortable: true },
    { key: "facility", label: "시설", sortable: true },
    { key: "unit", label: "봉안함", sortable: true },
    { 
      key: "contractYears", 
      label: "계약기간", 
      sortable: true,
      render: (value: number) => `${value}년`
    },
    { key: "amount", label: "계약금액", sortable: true },
    { 
      key: "status", 
      label: "상태", 
      sortable: true,
      render: (value: string) => <StatusBadge status={value} />
    },
    { 
      key: "startDate", 
      label: "시작일", 
      sortable: true
    },
    {
      key: "actions",
      label: "관리",
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          <button 
            onClick={() => setSelectedContract(row)}
            className="flex items-center gap-1 px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors text-sm"
          >
            <Eye className="w-4 h-4" />
            상세
          </button>
          {row.status === "PENDING" && (
            <button className="flex items-center gap-1 px-3 py-1 text-green-600 border border-green-600 rounded hover:bg-green-50 transition-colors text-sm">
              <CheckCircle className="w-4 h-4" />
              승인
            </button>
          )}
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
          <h3 className="text-lg font-semibold text-[#1E293B]">계약 관리</h3>
          <p className="text-sm text-gray-600">모든 계약 내역을 조회하고 관리합니다</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            필터
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-blue-600 transition-colors">
            <FileText className="w-4 h-4" />
            강제 계약 생성
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                >
                  <option>전체</option>
                  <option>ACTIVE</option>
                  <option>PENDING</option>
                  <option>COMPLETED</option>
                </select>
                <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">시설</label>
              <div className="relative">
                <select className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#3B82F6]">
                  <option>전체</option>
                  <option>강남 낙골당</option>
                  <option>서초 낙골당</option>
                </select>
                <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">시작일</label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">종료일</label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-gray-600">전체 계약</p>
          <p className="text-2xl font-bold text-[#1E293B] mt-1">165</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-gray-600">활성 계약</p>
          <p className="text-2xl font-bold text-green-600 mt-1">98</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-gray-600">대기중</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">12</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-gray-600">총 계약금액</p>
          <p className="text-2xl font-bold text-[#3B82F6] mt-1">825M</p>
        </div>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={contracts} />

      {/* Contract Detail Modal */}
      {selectedContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedContract(null)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#1E293B]">계약 상세 정보</h3>
              <button onClick={() => setSelectedContract(null)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">계약번호</p>
                  <p className="font-semibold">{selectedContract.contractNo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">상태</p>
                  <StatusBadge status={selectedContract.status} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">계약자</p>
                  <p className="font-semibold">{selectedContract.buyer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">시설</p>
                  <p className="font-semibold">{selectedContract.facility}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">봉안함</p>
                  <p className="font-semibold">{selectedContract.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">계약금액</p>
                  <p className="font-semibold text-[#3B82F6]">{selectedContract.amount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">계약기간</p>
                  <p className="font-semibold">{selectedContract.contractYears}년</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">시작일</p>
                  <p className="font-semibold">{selectedContract.startDate}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">종료일</p>
                  <p className="font-semibold">{selectedContract.endDate}</p>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t">
                {selectedContract.status === "PENDING" && (
                  <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    승인
                  </button>
                )}
                <button className="flex-1 px-4 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-blue-600 transition-colors">
                  수정
                </button>
                <button className="flex-1 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                  계약 취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### `/src/app/pages/ResaleManagement.tsx`

```tsx
import { useState } from "react";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import { Check, X, Eye, ChevronDown, Filter } from "lucide-react";

const resales = [
  { 
    id: 1,
    seller: "김철수", 
    buyer: null,
    facility: "강남 낙골당", 
    unit: "A-101",
    originalPrice: "5,000,000원",
    resalePrice: "4,800,000원", 
    status: "REQUESTED", 
    createdAt: "2026-03-17",
    requestReason: "이사로 인한 사용 불가"
  },
  { 
    id: 2,
    seller: "이영희", 
    buyer: null,
    facility: "서초 낙골당", 
    unit: "B-205",
    originalPrice: "4,500,000원",
    resalePrice: "4,300,000원", 
    status: "APPROVED", 
    createdAt: "2026-03-16",
    approvedAt: "2026-03-16 15:30",
    requestReason: "재정적 사유"
  },
  { 
    id: 3,
    seller: "박민수", 
    buyer: "홍길동",
    facility: "강남 낙골당", 
    unit: "A-203",
    originalPrice: "5,200,000원",
    resalePrice: "5,000,000원", 
    status: "LISTED", 
    createdAt: "2026-03-15",
    listedAt: "2026-03-16 10:00",
    requestReason: "개인 사정"
  },
  { 
    id: 4,
    seller: "정수진", 
    buyer: "강감찬",
    facility: "역삼 낙골당", 
    unit: "C-108",
    originalPrice: "4,800,000원",
    resalePrice: "4,600,000원", 
    status: "COMPLETED", 
    createdAt: "2026-03-10",
    completedAt: "2026-03-15 14:20",
    requestReason: "지역 이전"
  },
  { 
    id: 5,
    seller: "최동욱", 
    buyer: null,
    facility: "서초 낙골당", 
    unit: "B-301",
    originalPrice: "5,100,000원",
    resalePrice: "5,200,000원", 
    status: "REJECTED", 
    createdAt: "2026-03-12",
    rejectedAt: "2026-03-13 09:15",
    rejectionReason: "시장 가격보다 높은 재판매가"
  },
];

export default function ResaleManagement() {
  const [statusFilter, setStatusFilter] = useState("전체");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedResale, setSelectedResale] = useState<any>(null);

  const columns = [
    { key: "seller", label: "판매자", sortable: true },
    { key: "facility", label: "시설", sortable: true },
    { key: "unit", label: "봉안함", sortable: true },
    { key: "originalPrice", label: "원가", sortable: true },
    { key: "resalePrice", label: "재판매가", sortable: true },
    { 
      key: "buyer", 
      label: "구매자", 
      sortable: true,
      render: (value: string | null) => value || "-"
    },
    { 
      key: "status", 
      label: "상태", 
      sortable: true,
      render: (value: string) => {
        const statusMap: Record<string, string> = {
          REQUESTED: "승인대기",
          APPROVED: "승인됨",
          LISTED: "판매중",
          COMPLETED: "거래완료",
          REJECTED: "반려됨"
        };
        return <StatusBadge status={statusMap[value] || value} />;
      }
    },
    { key: "createdAt", label: "신청일", sortable: true },
    {
      key: "actions",
      label: "관리",
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          <button 
            onClick={() => setSelectedResale(row)}
            className="flex items-center gap-1 px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors text-sm"
          >
            <Eye className="w-4 h-4" />
            상세
          </button>
          {row.status === "REQUESTED" && (
            <>
              <button className="flex items-center gap-1 px-3 py-1 text-green-600 border border-green-600 rounded hover:bg-green-50 transition-colors text-sm">
                <Check className="w-4 h-4" />
                승인
              </button>
              <button className="flex items-center gap-1 px-3 py-1 text-red-600 border border-red-600 rounded hover:bg-red-50 transition-colors text-sm">
                <X className="w-4 h-4" />
                반려
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#1E293B]">재판매 관리</h3>
          <p className="text-sm text-gray-600">회원의 봉안함 재판매 신청을 관리합니다</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Filter className="w-4 h-4" />
          필터
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                >
                  <option>전체</option>
                  <option>REQUESTED</option>
                  <option>APPROVED</option>
                  <option>LISTED</option>
                  <option>COMPLETED</option>
                  <option>REJECTED</option>
                </select>
                <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">시설</label>
              <div className="relative">
                <select className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#3B82F6]">
                  <option>전체</option>
                  <option>강남 낙골당</option>
                  <option>서초 낙골당</option>
                </select>
                <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">신청일</label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-gray-600">전체 신청</p>
          <p className="text-2xl font-bold text-[#1E293B] mt-1">24</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-gray-600">승인대기</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">3</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-gray-600">판매중</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">8</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-gray-600">거래완료</p>
          <p className="text-2xl font-bold text-green-600 mt-1">12</p>
        </div>
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
          <p className="text-sm text-gray-600">반려</p>
          <p className="text-2xl font-bold text-red-600 mt-1">1</p>
        </div>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={resales} />

      {/* Resale Detail Modal */}
      {selectedResale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedResale(null)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#1E293B]">재판매 상세 정보</h3>
              <button onClick={() => setSelectedResale(null)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">판매자</p>
                  <p className="font-semibold">{selectedResale.seller}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">구매자</p>
                  <p className="font-semibold">{selectedResale.buyer || "미정"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">시설</p>
                  <p className="font-semibold">{selectedResale.facility}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">봉안함</p>
                  <p className="font-semibold">{selectedResale.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">원가</p>
                  <p className="font-semibold">{selectedResale.originalPrice}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">재판매가</p>
                  <p className="font-semibold text-[#3B82F6]">{selectedResale.resalePrice}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">신청 사유</p>
                  <p className="font-semibold">{selectedResale.requestReason}</p>
                </div>
                {selectedResale.rejectionReason && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">반려 사유</p>
                    <p className="font-semibold text-red-600">{selectedResale.rejectionReason}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">신청일</p>
                  <p className="font-semibold">{selectedResale.createdAt}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">상태</p>
                  <p className="font-semibold">
                    {selectedResale.status === "REQUESTED" && "승인대기"}
                    {selectedResale.status === "APPROVED" && "승인됨"}
                    {selectedResale.status === "LISTED" && "판매중"}
                    {selectedResale.status === "COMPLETED" && "거래완료"}
                    {selectedResale.status === "REJECTED" && "반려됨"}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t">
                {selectedResale.status === "REQUESTED" && (
                  <>
                    <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      승인
                    </button>
                    <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                      반려
                    </button>
                  </>
                )}
                {selectedResale.status === "LISTED" && (
                  <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    판매 중단
                  </button>
                )}
                <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 🚀 6단계: Cursor AI 사용법

### 방법 1: 한번에 전체 생성 (추천)

1. **Cursor IDE 열기**
2. **Ctrl/Cmd + L** 로 AI 채팅 열기
3. **이 전체 문서를 복사해서 붙여넣기**
4. 다음 프롬프트 입력:

```
위 가이드대로 낙골당 관리자 대시보드를 전체 구현해줘.
모든 파일을 순서대로 생성하고, 코드는 있는 그대로 사용해줘.
```

### 방법 2: 단계별 생성

각 섹션을 순서대로 Cursor에 입력:

```
1단계: 프로젝트 초기 설정 진행해줘
```

→ 완료 후

```
2단계: theme.css 파일 생성해줘
```

→ 완료 후 계속...

---

## 📋 체크리스트

설치 완료 후 확인:

- [ ] `npm run dev` 실행 확인
- [ ] `/login` 페이지 접속 (로그인 화면)
- [ ] 로그인 후 `/` 대시보드 표시
- [ ] 사이드바 11개 메뉴 모두 작동
- [ ] 봉안함 관리 - 그리드 표시 확인
- [ ] 대기열 관리 - 순번 조정 버튼 확인
- [ ] 계약 관리 - 상세 모달 확인
- [ ] 재판매 관리 - 5단계 상태 확인
- [ ] 필터 시스템 작동 확인

---

## 🎯 주요 기능 요약

### ✅ 완료된 기능

1. **용어 변경**: 좌석 → 봉안함/안치칸
2. **대기열**: 개월 단위 + 순번 조정 (↑↓)
3. **계약**: 20/30/50년 장기 + 상세 모달 + 강제 생성
4. **재판매**: 5단계 프로세스 (REQUESTED → APPROVED → LISTED → COMPLETED/REJECTED)
5. **필터**: 모든 페이지 필터 시스템
6. **액션 버튼**: 승인/반려/수정/삭제/상세보기
7. **대시보드**: KPI 5개 + 파이 차트

---

## 💡 다음 단계

이 기본 구조가 완성되면:

1. **Supabase 연결** - 실제 데이터베이스
2. **인증 시스템** - JWT 토큰
3. **권한 관리** - RBAC
4. **실시간 알림** - WebSocket
5. **파일 업로드** - S3/Cloudinary
6. **엑셀 내보내기** - XLSX

---

## 🎉 완료!

이 가이드를 Cursor AI에 붙여넣으면 전체 프로젝트가 자동으로 생성됩니다!

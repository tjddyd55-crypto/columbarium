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
  { path: "/admin", label: "대시보드", icon: LayoutDashboard },
  { path: "/admin/business", label: "사업자 관리", icon: Building2, superAdminOnly: true },
  { path: "/admin/facility", label: "시설 관리", icon: MapPin },
  { path: "/admin/seat", label: "봉안함(칸) 관리", icon: Grid3x3 },
  { path: "/admin/waitlist", label: "대기열 관리", icon: ListOrdered },
  { path: "/admin/contracts", label: "계약 관리", icon: FileText },
  { path: "/admin/resale", label: "재판매 관리", icon: RefreshCw },
  { path: "/admin/member", label: "회원 관리", icon: Users },
  { path: "/admin/notification", label: "알림 관리", icon: Bell },
  { path: "/admin/audit", label: "감사로그", icon: FileSearch },
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
          
          const isActive = location.pathname === item.path || (item.path !== "/admin" && location.pathname.startsWith(item.path));
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
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
  Settings,
  UserPlus,
} from "lucide-react";
import { getStoredUser } from "../../lib/api";
import { hasAnyOperatorRole } from "../../lib/adminPortalAccess";

type MenuItem = {
  path: string;
  label: string;
  icon: typeof LayoutDashboard;
  /** SUPER_ADMIN | ADMIN */
  adminOnly?: boolean;
  /** ADMIN + OPERATOR(본인 company 스코프 페이지) */
  operatorWorkspace?: boolean;
};

/** 역할별 메뉴 확정 — docs/RBAC-OPERATIONS.md §3 과 동일 */
const menuItems: MenuItem[] = [
  { path: "/admin", label: "대시보드", icon: LayoutDashboard },
  { path: "/admin/company", label: "사업자 등록", icon: Building2, adminOnly: true },
  { path: "/admin/agent-onboard", label: "에이전트 발급", icon: UserPlus, adminOnly: true },
  { path: "/admin/site", label: "시설 등록", icon: MapPin, operatorWorkspace: true },
  { path: "/admin/section", label: "구역 생성", icon: Grid3x3, operatorWorkspace: true },
  { path: "/admin/seat-management", label: "좌석 관리", icon: Grid3x3, operatorWorkspace: true },
  { path: "/admin/policy", label: "정책 설정", icon: Settings, operatorWorkspace: true },
  { path: "/admin/business", label: "사업자 관리(기존)", icon: Building2, adminOnly: true },
  { path: "/admin/facility", label: "시설 관리(기존)", icon: MapPin, adminOnly: true },
  { path: "/admin/seat", label: "봉안함(칸) 관리", icon: Grid3x3, adminOnly: true },
  { path: "/admin/waitlist", label: "대기열 관리", icon: ListOrdered, adminOnly: true },
  { path: "/admin/contracts", label: "계약 관리", icon: FileText, adminOnly: true },
  { path: "/admin/resale", label: "재판매 관리", icon: RefreshCw, adminOnly: true },
  { path: "/admin/member", label: "회원 관리", icon: Users, adminOnly: true },
  { path: "/admin/notification", label: "알림 관리", icon: Bell, adminOnly: true },
  { path: "/admin/audit", label: "감사로그", icon: FileSearch, adminOnly: true },
];

export default function Sidebar() {
  const location = useLocation();
  const user = getStoredUser();
  const role = user?.role ?? "";
  const isSuperAdmin = role === "SUPER_ADMIN" || role === "ADMIN";
  const isOperator = role === "OPERATOR" || role === "OPERATOR_ADMIN";
  const isAgent = role === "AGENT" || role === "SALES_MANAGER";
  const operatorCompanyId = user?.companyId;
  const showOperatorCompanyPortal =
    hasAnyOperatorRole(user) && Boolean(operatorCompanyId);

  const visible = menuItems.filter((item) => {
    if (isAgent) {
      return item.path === "/admin";
    }
    if (item.adminOnly && !isSuperAdmin) return false;
    if (item.operatorWorkspace && !isSuperAdmin && !isOperator) return false;
    return true;
  });

  return (
    <div className="w-64 bg-[#1E293B] h-screen fixed left-0 top-0 text-white flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold">봉안당 관리자</h1>
        <p className="text-sm text-slate-400 mt-1">
          {isAgent ? "에이전트" : isOperator ? "운영자" : "관리자"}
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {showOperatorCompanyPortal && operatorCompanyId && (
          <Link
            to={`/admin/companies/${operatorCompanyId}`}
            className={`flex items-center gap-3 px-6 py-3 transition-colors ${
              location.pathname.startsWith(`/admin/companies/${operatorCompanyId}`)
                ? "bg-[#3B82F6] text-white"
                : "text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span>사업자 상세</span>
          </Link>
        )}
        {visible.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/admin" && location.pathname.startsWith(item.path));
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

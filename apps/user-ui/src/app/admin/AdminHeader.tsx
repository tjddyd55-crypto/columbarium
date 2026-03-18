import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router";
import { clearAdminAuth } from "@/shared/api/adminAuth";

export function AdminHeader() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAdminAuth();
    navigate("/admin/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h2 className="text-xl font-semibold text-[#1E293B]">관리자 포털</h2>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
          <User className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">관리자</span>
        </div>
        <button
          type="button"
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

import { Outlet, useNavigate, useLocation } from "react-router";
import { Home, Search, Clock, FileText, User } from "lucide-react";
import { isLoggedIn } from "../../shared/auth/session";

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: "home", label: "홈", icon: Home, path: "/" },
    { id: "facilities", label: "시설검색", icon: Search, path: "/facilities" },
    { id: "waitlist", label: "내 대기열", icon: Clock, path: "/waitlist", requiresAuth: true },
    { id: "contracts", label: "내 계약", icon: FileText, path: "/my-contracts", requiresAuth: true },
    { id: "my", label: "마이페이지", icon: User, path: "/my-page", requiresAuth: true },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 safe-area-inset-bottom">
        <div className="flex justify-around items-center h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.requiresAuth && !isLoggedIn()) {
                    navigate("/login");
                    return;
                  }
                  navigate(tab.path);
                }}
                className="flex flex-col items-center justify-center flex-1 h-full transition-colors"
              >
                <Icon
                  className={`w-6 h-6 mb-1 ${
                    active ? "text-[#1E3A8A]" : "text-gray-400"
                  }`}
                />
                <span
                  className={`text-xs ${
                    active ? "text-[#1E3A8A]" : "text-gray-500"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

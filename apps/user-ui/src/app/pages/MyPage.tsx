import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { User, Phone, Mail, MapPin, FileText, Clock, ChevronRight, LogOut } from "lucide-react";
import { api } from "../../shared/api/service";
import { ApiError } from "../../shared/api/http";
import { clearSession } from "../../shared/auth/session";

export function MyPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userInfo, setUserInfo] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [contractCount, setContractCount] = useState(0);
  const [waitlistCount, setWaitlistCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadMyData() {
      try {
        const [profile, contracts, queues] = await Promise.all([
          api.getMyProfile(),
          api.getMyContracts(),
          api.getMyQueues(),
        ]);

        if (!cancelled) {
          setUserInfo({
            name: profile.name,
            phone: profile.phone,
            email: profile.email ?? "이메일 미등록",
            address:
              [profile.addressRoad, profile.addressDetail].filter(Boolean).join(" ") ||
              "주소 미등록",
          });
          setContractCount(contracts.length);
          setWaitlistCount(queues.length);
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError && err.status === 401) {
            navigate("/login");
            return;
          }
          if (err instanceof ApiError) {
            setError(err.message);
          } else {
            setError("마이페이지 정보를 불러오지 못했습니다.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadMyData();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const menuItems = useMemo(
    () => [
      {
        icon: FileText,
        label: "내 계약 목록",
        path: "/my-contracts",
        count: contractCount,
      },
      {
        icon: Clock,
        label: "내 대기열",
        path: "/waitlist",
        count: waitlistCount,
      },
    ],
    [contractCount, waitlistCount],
  );

  const handleLogout = () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      clearSession();
      navigate("/login");
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-500">마이페이지 정보를 불러오는 중...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 pt-6 pb-4">
        <h1 className="text-2xl text-gray-900">마이페이지</h1>
      </div>

      {/* User Profile */}
      <div className="bg-white p-6 mb-4">
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-[#1E3A8A] to-[#3B5BA5] rounded-full flex items-center justify-center text-white text-2xl mr-4">
            {userInfo.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl text-gray-900 mb-1">{userInfo.name}</h2>
            <p className="text-sm text-gray-500">회원</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-gray-700">
            <Phone className="w-5 h-5 mr-3 text-gray-400" />
            <span>{userInfo.phone}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <Mail className="w-5 h-5 mr-3 text-gray-400" />
            <span>{userInfo.email}</span>
          </div>
          <div className="flex items-start text-gray-700">
            <MapPin className="w-5 h-5 mr-3 mt-0.5 text-gray-400 flex-shrink-0" />
            <span>{userInfo.address}</span>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="bg-white mb-4">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center">
                <Icon className="w-5 h-5 mr-3 text-gray-600" />
                <span className="text-gray-900">{item.label}</span>
              </div>
              <div className="flex items-center">
                {item.count > 0 && (
                  <span className="bg-[#1E3A8A] text-white text-xs px-2 py-1 rounded-full mr-2">
                    {item.count}
                  </span>
                )}
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Settings */}
      <div className="bg-white mb-4">
        <button
          onClick={() => navigate("/my-page/profile")}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center">
            <User className="w-5 h-5 mr-3 text-gray-600" />
            <span className="text-gray-900">개인정보 수정</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Logout */}
      <div className="px-6 py-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5 mr-2" />
          로그아웃
        </button>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 text-center text-sm text-gray-500">
        <p>납골당 플랫폼 v1.0.0</p>
        <p className="mt-1">© 2026 Korea Memorial Platform</p>
      </div>
    </div>
  );
}

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

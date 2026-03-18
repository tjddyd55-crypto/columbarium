import { Link } from "react-router";

export function AdminPlaceholder() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[#3B82F6]">준비 중입니다</h1>
      <p className="text-gray-600">해당 메뉴는 추후 제공될 예정입니다.</p>
      <Link to="/admin" className="text-[#3B82F6] hover:underline">
        대시보드로 돌아가기
      </Link>
    </div>
  );
}

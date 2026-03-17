import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md text-center shadow-sm">
        <h1 className="text-2xl text-gray-900 mb-2">페이지 없습니다</h1>
        <p className="text-sm text-gray-600 mb-6">
          요청하신 페이지가 없거나 아직 준비되지 않았습니다.
        </p>
        <Button
          onClick={() => navigate("/")}
          className="w-full h-12 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white rounded-xl"
        >
          홈으로 이동
        </Button>
      </div>
    </div>
  );
}

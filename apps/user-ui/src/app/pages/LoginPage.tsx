import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { api } from "../../shared/api/service";
import { ApiError } from "../../shared/api/http";
import { setSession } from "../../shared/auth/session";

export function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await api.login({
        login_id: username.trim(),
        password,
      });
      setSession(result.token, result.user);
      navigate("/");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("로그인 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    navigate(`/oauth/${provider}`);
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-white px-6">
      <div className="flex-1 flex flex-col justify-center py-12">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-3xl mb-2 text-[#1E3A8A]">납골당</h1>
          <p className="text-gray-600">Korea Memorial Platform</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="username" className="text-gray-700 mb-2 block">
              아이디
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디를 입력하세요"
              className="h-14 bg-gray-50 border-gray-200 rounded-xl"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-gray-700 mb-2 block">
              비밀번호
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="h-14 bg-gray-50 border-gray-200 rounded-xl"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white rounded-xl mt-6"
          >
            {loading ? "로그인 중..." : "로그인"}
          </Button>
        </form>

        {/* Social Login */}
        <div className="mt-6 space-y-3">
          <Button
            type="button"
            onClick={() => handleSocialLogin("kakao")}
            className="w-full h-14 bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#000000] rounded-xl"
          >
            카카오 로그인
          </Button>
          <Button
            type="button"
            onClick={() => handleSocialLogin("naver")}
            className="w-full h-14 bg-[#03C75A] hover:bg-[#03C75A]/90 text-white rounded-xl"
          >
            네이버 로그인
          </Button>
        </div>

        {/* Signup Link */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/signup")}
            className="text-gray-600 hover:text-[#1E3A8A] transition-colors"
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}

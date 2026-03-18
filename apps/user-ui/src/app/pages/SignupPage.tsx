import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ArrowLeft } from "lucide-react";
import { api } from "../../shared/api/service";
import { ApiError } from "../../shared/api/http";
import { setSession } from "../../shared/auth/session";

export function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    loginId: "", // 로그인용 아이디 (API: login_id)
    password: "",
    name: "", // 개인정보: 실명 (API: name)
    birthdate: "",
    phone: "",
    email: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await api.signup({
        login_id: formData.loginId.trim(),
        password: formData.password,
        name: formData.name.trim(),
        birth_date: formData.birthdate,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
      });
      setSession(result.token, result.user);
      navigate("/");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("회원가입 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen max-w-md mx-auto bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center">
        <button onClick={() => navigate("/login")} className="mr-4">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl text-gray-900">회원가입</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div>
          <Label htmlFor="loginId" className="text-gray-700 mb-2 block">
            아이디
          </Label>
          <Input
            id="loginId"
            type="text"
            autoComplete="username"
            value={formData.loginId}
            onChange={(e) => handleChange("loginId", e.target.value)}
            placeholder="로그인 시 사용할 아이디"
            className="h-14 bg-gray-50 border-gray-200 rounded-xl"
            required
          />
        </div>

        <div>
          <Label htmlFor="password" className="text-gray-700 mb-2 block">
            비밀번호
          </Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            placeholder="비밀번호를 입력하세요"
            className="h-14 bg-gray-50 border-gray-200 rounded-xl"
            required
          />
        </div>

        <div>
          <Label htmlFor="name" className="text-gray-700 mb-2 block">
            이름
          </Label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="실명 (개인정보)"
            className="h-14 bg-gray-50 border-gray-200 rounded-xl"
            required
          />
        </div>

        <div>
          <Label htmlFor="birthdate" className="text-gray-700 mb-2 block">
            생년월일
          </Label>
          <Input
            id="birthdate"
            type="date"
            value={formData.birthdate}
            onChange={(e) => handleChange("birthdate", e.target.value)}
            className="h-14 bg-gray-50 border-gray-200 rounded-xl"
            required
          />
        </div>

        <div>
          <Label htmlFor="phone" className="text-gray-700 mb-2 block">
            연락처
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="010-0000-0000"
            className="h-14 bg-gray-50 border-gray-200 rounded-xl"
            required
          />
        </div>

        <div>
          <Label htmlFor="email" className="text-gray-700 mb-2 block">
            이메일
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="example@email.com"
            className="h-14 bg-gray-50 border-gray-200 rounded-xl"
            required
          />
        </div>

        <div>
          <Label htmlFor="address" className="text-gray-700 mb-2 block">
            주소
          </Label>
          <Input
            id="address"
            type="text"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            placeholder="주소를 입력하세요"
            className="h-14 bg-gray-50 border-gray-200 rounded-xl"
            required
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
          className="w-full h-14 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white rounded-xl mt-8"
        >
          {loading ? "회원가입 중..." : "회원가입"}
        </Button>
      </form>
    </div>
  );
}

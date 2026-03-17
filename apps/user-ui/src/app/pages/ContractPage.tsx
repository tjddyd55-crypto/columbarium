import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { api } from "../../shared/api/service";
import { ApiError } from "../../shared/api/http";

export function ContractPage() {
  const navigate = useNavigate();
  const { unitId } = useParams();
  const [searchParams] = useSearchParams();
  const queueId = searchParams.get("queueId");
  const [agreed, setAgreed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [contractData, setContractData] = useState({
    facilityName: "",
    seatId: unitId || "",
    location: "시설 상세에서 확인",
    priceText: "최종 금액은 계약 체결 시 확정됩니다.",
    userName: "",
    userPhone: "",
    userEmail: "",
  });

  useEffect(() => {
    let cancelled = false;

    if (!unitId || !queueId) {
      setError("페이지 없습니다");
      setLoading(false);
      return;
    }

    async function loadContractData() {
      try {
        const [queue, profile] = await Promise.all([
          api.getQueueById(queueId),
          api.getMyProfile(),
        ]);

        if (!cancelled) {
          setContractData({
            facilityName: queue.facilityName,
            seatId: queue.unitCode,
            location: "시설 상세에서 확인",
            priceText: "최종 금액은 계약 체결 시 확정됩니다.",
            userName: profile.name,
            userPhone: profile.phone,
            userEmail: profile.email ?? "",
          });
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError && err.status === 401) {
            navigate("/login");
            return;
          }
          setError(err instanceof ApiError ? err.message : "계약 정보를 불러오지 못했습니다.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadContractData();
    return () => {
      cancelled = true;
    };
  }, [unitId, queueId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      alert("계약 조건에 동의해주세요");
      return;
    }
    if (!unitId || !queueId) {
      setError("페이지 없습니다");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.createContract(unitId, queueId);
      setShowSuccess(true);
      setTimeout(() => {
        navigate("/my-contracts");
      }, 1500);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        navigate("/login");
        return;
      }
      setError(err instanceof ApiError ? err.message : "계약 처리에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-500">계약 정보를 불러오는 중...</div>;
  }

  if (error === "페이지 없습니다") {
    return <div className="p-6 text-gray-700">페이지 없습니다</div>;
  }

  if (error && !contractData.facilityName) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen max-w-md mx-auto bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl text-gray-900 mb-2">계약이 완료되었습니다</h2>
          <p className="text-gray-600">
            계약 정보는 내 계약 메뉴에서 확인하실 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 px-4 py-4 flex items-center border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="mr-4">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl text-gray-900">계약하기</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {/* Selected Seat Info */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-6">
          <h3 className="text-lg text-gray-900 mb-4">선택 좌석 정보</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">시설명</span>
              <span className="text-gray-900">{contractData.facilityName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">좌석</span>
              <span className="text-gray-900">{contractData.seatId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">위치</span>
              <span className="text-gray-900">{contractData.location}</span>
            </div>
          </div>
        </div>

        {/* Price Info */}
        <div className="bg-gradient-to-br from-[#1E3A8A] to-[#3B5BA5] rounded-2xl p-6 text-white mb-6">
          <h3 className="text-lg mb-2">계약 금액</h3>
          <p className="text-lg">{contractData.priceText}</p>
        </div>

        {/* User Info */}
        <div className="mb-6">
          <h3 className="text-lg text-gray-900 mb-4">계약자 정보</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-gray-700 mb-2 block">
                이름
              </Label>
              <Input
                id="name"
                type="text"
                value={contractData.userName}
                className="h-12 bg-gray-50 border-gray-200 rounded-xl"
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-gray-700 mb-2 block">
                연락처
              </Label>
              <Input
                id="phone"
                type="tel"
                value={contractData.userPhone}
                className="h-12 bg-gray-50 border-gray-200 rounded-xl"
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-gray-700 mb-2 block">
                이메일
              </Label>
              <Input
                id="email"
                type="email"
                value={contractData.userEmail}
                className="h-12 bg-gray-50 border-gray-200 rounded-xl"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Agreement */}
        <div className="mb-6">
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 mr-3 w-5 h-5 rounded border-gray-300 text-[#1E3A8A] focus:ring-[#1E3A8A]"
            />
            <span className="text-sm text-gray-700">
              계약 조건 및 이용약관에 동의합니다.
              <br />
              계약금은 환불되지 않으며, 계약 후 취소 시 위약금이 발생할 수
              있습니다.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!agreed || submitting}
          className="w-full h-14 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {submitting ? "계약 처리 중..." : "계약 완료"}
        </Button>
        {error && (
          <p className="text-sm text-red-600 mt-3" role="alert">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Building2, ListOrdered, FileText } from "lucide-react";
import { adminRequest } from "@/shared/api/adminAuth";

type Facility = { id: string };
type WaitlistRow = { id: string };
type ContractRow = { id: string; status?: string };

export function AdminDashboard() {
  const [facilityCount, setFacilityCount] = useState<number>(0);
  const [waitlistCount, setWaitlistCount] = useState<number>(0);
  const [contractCount, setContractCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      adminRequest<Facility[]>("/api/facilities").catch(() => []),
      adminRequest<WaitlistRow[]>("/api/waitlist").catch(() => []),
      adminRequest<ContractRow[]>("/api/contracts").catch(() => []),
    ])
      .then(([facilities, waitlist, contracts]) => {
        if (cancelled) return;
        setFacilityCount(Array.isArray(facilities) ? facilities.length : 0);
        setWaitlistCount(Array.isArray(waitlist) ? waitlist.length : 0);
        setContractCount(Array.isArray(contracts) ? contracts.length : 0);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "데이터 로드 실패");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-gray-500">로딩 중...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[#3B82F6]">대시보드</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-100">
            <Building2 className="w-8 h-8 text-[#3B82F6]" />
          </div>
          <div>
            <p className="text-sm text-gray-500">시설 수</p>
            <p className="text-2xl font-semibold">{facilityCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-amber-100">
            <ListOrdered className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">대기열 수</p>
            <p className="text-2xl font-semibold">{waitlistCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-green-100">
            <FileText className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">계약 수</p>
            <p className="text-2xl font-semibold">{contractCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

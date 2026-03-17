import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, MapPin, Phone, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { api, type FacilityDetail } from "../../shared/api/service";
import { ApiError } from "../../shared/api/http";

const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1740815320875-6b72c87dcd1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  "https://images.unsplash.com/photo-1713427508584-d77131da5503?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  "https://images.unsplash.com/photo-1661566791475-81587c5ebc6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
];

interface FacilityViewModel {
  id: string;
  name: string;
  location: string;
  phone: string;
  priceText: string;
  description: string;
}

export function FacilityDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [facility, setFacility] = useState<FacilityViewModel | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [waitingCount, setWaitingCount] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    if (!id) {
      setError("페이지 없습니다");
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const facilityResult = await api.getFacility(id);
        const seats = await api.listFacilitySeats(id);
        const statuses = await Promise.all(
          seats.map((seat) =>
            api
              .getSeatStatus(seat.seat_id)
              .then((status) => status.waitingCount)
              .catch(() => 0),
          ),
        );

        if (!cancelled) {
          setFacility(toViewModel(facilityResult));
          setWaitingCount(statuses.reduce((sum, count) => sum + count, 0));
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError) {
            setError(err.message);
          } else {
            setError("시설 정보를 불러오지 못했습니다.");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const images = useMemo(() => GALLERY_IMAGES, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.offsetWidth;
    const newIndex = Math.round(scrollLeft / width);
    setCurrentImageIndex(newIndex);
  };

  const scrollToImage = (index: number) => {
    if (scrollContainerRef.current) {
      const width = scrollContainerRef.current.offsetWidth;
      scrollContainerRef.current.scrollTo({
        left: width * index,
        behavior: 'smooth'
      });
    }
  };

  const handlePrevImage = () => {
    const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : images.length - 1;
    scrollToImage(newIndex);
  };

  const handleNextImage = () => {
    const newIndex = currentImageIndex < images.length - 1 ? currentImageIndex + 1 : 0;
    scrollToImage(newIndex);
  };

  if (loading) {
    return <div className="p-6 text-gray-500">시설 정보를 불러오는 중...</div>;
  }

  if (error || !facility) {
    return <div className="p-6 text-red-600">{error || "페이지 없습니다"}</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur z-10 px-4 py-4 flex items-center border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="mr-4">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl text-gray-900">시설 상세</h1>
      </div>

      {/* Image Gallery */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <div
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide h-full"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onScroll={handleScroll}
          ref={scrollContainerRef}
        >
          {images.map((image, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-full h-full snap-center"
            >
              <img
                src={image}
                alt={`${facility.name} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full">
          {currentImageIndex + 1} / {images.length}
        </div>

        {/* Pagination Dots */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
          {images.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === currentImageIndex
                  ? 'w-6 bg-white'
                  : 'w-1.5 bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <div className="absolute top-0 bottom-0 left-0 right-0 flex justify-between items-center px-4">
          <button
            onClick={handlePrevImage}
            className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNextImage}
            className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-full"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* FOMO 유도 */}
        <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl mb-6">
          <p className="text-sm text-gray-600">
            ⚠️ 인기 시설로 빠르게 마감될 수 있습니다
          </p>
        </div>

        <h2 className="text-2xl text-gray-900 mb-4">{facility.name}</h2>

        <div className="space-y-4 mb-6">
          <div className="flex items-start">
            <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{facility.location}</span>
          </div>
          <div className="flex items-start">
            <Phone className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{facility.phone}</span>
          </div>
          <div className="flex items-start">
            <Clock className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">09:00 - 18:00</span>
          </div>
        </div>

        {/* 신뢰 요소 배지 */}
        <div className="flex gap-2 mb-4">
          <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
            인기 시설
          </span>
          <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
            실시간 예약 가능
          </span>
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 mb-6">
          <h3 className="text-lg text-gray-900 mb-2">가격 정보</h3>
          <p className="text-2xl text-[#1E3A8A]">{facility.priceText}</p>
        </div>

        {/* 상태 정보 */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-600 mb-1">현재 상태</p>
          <p className="text-lg font-semibold text-blue-700">
            현재 {waitingCount ?? 0}명 대기 중
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg text-gray-900 mb-3">시설 안내</h3>
          <p className="text-gray-700 leading-relaxed">{facility.description}</p>
        </div>

        {/* Map Placeholder */}
        <div className="bg-gray-100 rounded-2xl h-48 flex items-center justify-center mb-6">
          <div className="text-center">
            <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-700 font-medium">
              {facility.location}
            </p>
          </div>
        </div>

        <Button
          onClick={() => navigate(`/facilities/${id}/seats`)}
          className="w-full h-14 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white rounded-xl text-lg font-semibold"
        >
          지금 자리 확인하고 예약하기
        </Button>
      </div>
    </div>
  );
}

function toViewModel(facility: FacilityDetail): FacilityViewModel {
  return {
    id: facility.id,
    name: facility.name,
    location: facility.address ?? "주소 정보 없음",
    phone: "전화 문의",
    priceText: facility.price_from ? `${facility.price_from.toLocaleString()}원~` : "가격 문의",
    description: "시설 상세 안내 정보는 운영자 데이터 기준으로 제공됩니다.",
  };
}
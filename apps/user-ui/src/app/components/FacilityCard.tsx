import { useNavigate } from "react-router";
import { MapPin } from "lucide-react";

interface Facility {
  id: string;
  name: string;
  location: string;
  price: string;
  image: string;
}

interface FacilityCardProps {
  facility: Facility;
}

export function FacilityCard({ facility }: FacilityCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/facilities/${facility.id}`)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={facility.image}
          alt={facility.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg text-gray-900 mb-2">{facility.name}</h3>
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{facility.location}</span>
        </div>
        <p className="text-[#1E3A8A]">{facility.price}</p>
      </div>
    </div>
  );
}

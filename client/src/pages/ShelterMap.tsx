import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGeolocation } from "@/hooks/useGeolocation";
import { apiRequest } from "@/services/api";

interface Shelter {
  id: string;
  name: string;
  type: string;
  address: string;
  lat: number;
  lng: number;
  distance: number;
  walkingTime: number;
}

export default function ShelterMap() {
  const { location, error: geoError } = useGeolocation();
  
  const { data: shelters, isLoading } = useQuery({
    queryKey: ["/api/shelters"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/shelters");
      return response.json() as Promise<Shelter[]>;
    },
  });

  const handleGetDirections = (shelter: Shelter) => {
    // In a real implementation, this would integrate with T-Map API
    const destination = encodeURIComponent(`${shelter.name} ${shelter.address}`);
    window.open(`https://maps.google.com/maps?daddr=${destination}`, '_blank');
  };

  const getShelterIcon = (type: string) => {
    switch (type) {
      case "실내 대피소":
        return "fas fa-home";
      case "옥외 대피소":
        return "fas fa-tree";
      case "구호소":
        return "fas fa-building";
      default:
        return "fas fa-map-marker-alt";
    }
  };

  const getShelterColor = (type: string) => {
    switch (type) {
      case "실내 대피소":
        return "bg-safety";
      case "옥외 대피소":
        return "bg-blue-600";
      case "구호소":
        return "bg-purple-600";
      default:
        return "bg-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card className="emergency-card">
          <CardContent className="text-center py-8">
            <i className="fas fa-spinner fa-spin text-4xl text-emergency mb-4" aria-hidden="true"></i>
            <p>대피소 정보를 불러오는 중...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Map Header */}
      <Card className="emergency-card mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-emergency">주변 대피소</h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                현재 위치: <span className="font-medium">
                  {location ? `위도 ${location.coords.latitude.toFixed(4)}, 경도 ${location.coords.longitude.toFixed(4)}` : "위치 확인 중..."}
                </span>
              </div>
              <Button 
                className="bg-safety hover:bg-green-600 text-sm"
                onClick={() => window.location.reload()}
              >
                <i className="fas fa-sync mr-1" aria-hidden="true"></i>
                위치 갱신
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Map Container */}
        <div className="lg:col-span-2">
          <Card className="emergency-card p-0 overflow-hidden">
            {/* Mock Map Interface */}
            <div className="relative bg-gradient-to-br from-green-100 to-blue-100 h-96">
              
              {/* Map Controls */}
              <div className="absolute top-4 right-4 flex flex-col space-y-2">
                <Button className="w-10 h-10 bg-white shadow-md rounded">
                  <i className="fas fa-plus text-gray-600" aria-hidden="true"></i>
                </Button>
                <Button className="w-10 h-10 bg-white shadow-md rounded">
                  <i className="fas fa-minus text-gray-600" aria-hidden="true"></i>
                </Button>
              </div>

              {/* Current Location Marker */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-4 h-4 bg-emergency rounded-full border-2 border-white shadow-lg"></div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white px-2 py-1 rounded shadow text-xs font-medium">
                  현재 위치
                </div>
              </div>

              {/* Shelter Markers */}
              <div className="absolute top-1/3 left-1/3 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer">
                <div className="w-6 h-6 bg-safety rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                  <i className="fas fa-home text-white text-xs" aria-hidden="true"></i>
                </div>
              </div>
              
              <div className="absolute top-2/3 left-2/3 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer">
                <div className="w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                  <i className="fas fa-tree text-white text-xs" aria-hidden="true"></i>
                </div>
              </div>
              
              <div className="absolute top-1/4 right-1/4 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer">
                <div className="w-6 h-6 bg-purple-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                  <i className="fas fa-building text-white text-xs" aria-hidden="true"></i>
                </div>
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg">
                <h4 className="text-xs font-bold mb-2">대피소 종류</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-safety rounded-full"></div>
                    <span>실내 대피소</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span>옥외 대피소</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                    <span>구호소</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Shelter List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">가까운 대피소 목록</h2>
          
          {shelters?.map((shelter) => (
            <Card key={shelter.id} className="emergency-card hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{shelter.name}</h3>
                    <p className="text-sm text-gray-600">{shelter.type}</p>
                    <p className="text-sm text-gray-500 mt-1">{shelter.address}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-sm font-medium text-safety">도보 {shelter.walkingTime}분</span>
                      <span className="text-sm text-gray-500">거리 {shelter.distance}m</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 ${getShelterColor(shelter.type)} rounded-full flex items-center justify-center`}>
                    <i className={`${getShelterIcon(shelter.type)} text-white`} aria-hidden="true"></i>
                  </div>
                </div>
                <Button 
                  onClick={() => handleGetDirections(shelter)}
                  className={`w-full mt-3 ${getShelterColor(shelter.type)} hover:opacity-90 py-2 px-4 rounded-lg`}
                >
                  <i className="fas fa-route mr-2" aria-hidden="true"></i>
                  길찾기
                </Button>
              </CardContent>
            </Card>
          ))}
          
          {/* Special Notice for Assisted Evacuation */}
          <Card className="emergency-card bg-yellow-50 border-l-4 border-l-warning">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-2">
                <i className="fas fa-wheelchair text-warning mt-1" aria-hidden="true"></i>
                <div>
                  <p className="font-semibold text-warning mb-1">이동 지원 안내</p>
                  <p className="text-sm text-gray-700">
                    대피에 도움이 필요하시면 각 대피소의 지원 인력에게 요청하세요. 
                    동행 파트너에게도 위치가 자동으로 전송됩니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

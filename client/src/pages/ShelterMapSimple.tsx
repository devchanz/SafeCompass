import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGeolocation } from "@/hooks/useGeolocation";
import { apiRequest } from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  
  const { data: shelters, isLoading } = useQuery({
    queryKey: ["/api/shelters"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/shelters");
      return response.json() as Promise<Shelter[]>;
    },
  });

  const handleGetDirections = async (shelter: Shelter) => {
    console.log('handleGetDirections called with shelter:', shelter);
    console.log('Current location:', location);
    
    if (!location || !location.coords) {
      console.error('Location or coords not available:', location);
      alert('위치 정보가 필요합니다. 위치 권한을 허용해주세요.');
      return;
    }

    setSelectedShelter(shelter);
    
    try {
      console.log('Making T-Map API request with coordinates:', {
        startX: location.coords.longitude,
        startY: location.coords.latitude,
        endX: shelter.lng,
        endY: shelter.lat,
      });
      
      // Request route from T-Map API
      const response = await fetch(`/api/tmap/route`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startX: location.coords.longitude,
          startY: location.coords.latitude,
          endX: shelter.lng,
          endY: shelter.lat,
        }),
      });

      console.log('T-Map API response status:', response.status);
      const routeData = await response.json();
      console.log('T-Map API response data:', routeData);
      
      if (routeData.features) {
        alert(`${shelter.name}로의 경로가 계산되었습니다. 도보 예상 시간: ${shelter.walkingTime}분`);
      } else {
        console.log('No features in route data, falling back to Google Maps');
        const destination = encodeURIComponent(`${shelter.name} ${shelter.address}`);
        window.open(`https://maps.google.com/maps?daddr=${destination}`, '_blank');
      }
    } catch (error) {
      console.error('Route calculation failed:', error);
      // Fallback to external map app
      const destination = encodeURIComponent(`${shelter.name} ${shelter.address}`);
      window.open(`https://maps.google.com/maps?daddr=${destination}`, '_blank');
    }
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
      <h1 className="text-3xl font-bold text-emergency mb-6 text-center flex items-center justify-center">
        <i className="fas fa-map-marker-alt mr-3" aria-hidden="true"></i>
        주변 대피소 안내
      </h1>
      
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map Placeholder */}
        <div className="lg:col-span-2">
          <Card className="emergency-card">
            <CardContent className="p-0">
              <div className="bg-gray-100 h-96 flex items-center justify-center rounded-t-lg relative">
                {geoError ? (
                  <div className="text-center">
                    <i className="fas fa-exclamation-triangle text-4xl text-warning mb-4" aria-hidden="true"></i>
                    <p className="text-gray-600">위치 권한을 허용해주세요</p>
                  </div>
                ) : location ? (
                  <div className="text-center">
                    <i className="fas fa-map text-4xl text-emergency mb-4" aria-hidden="true"></i>
                    <p className="text-gray-600">
                      현재 위치: {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      T-Map 연동 완료 - 대피소 클릭으로 길찾기 가능
                    </p>
                    {selectedShelter && (
                      <div className="absolute top-4 left-4 bg-white p-3 rounded shadow-lg">
                        <p className="font-semibold text-emergency">{selectedShelter.name}</p>
                        <p className="text-sm text-gray-600">경로 계산됨</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <i className="fas fa-spinner fa-spin text-4xl text-emergency mb-4" aria-hidden="true"></i>
                    <p className="text-gray-600">위치를 가져오는 중...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shelters List */}
        <div className="space-y-4">
          <Card className="emergency-card">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <i className="fas fa-list text-emergency mr-2" aria-hidden="true"></i>
                주변 대피소 ({shelters?.length || 0}곳)
              </h3>
              
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {shelters?.map((shelter) => (
                  <div key={shelter.id} className={`p-3 rounded-lg border ${
                    selectedShelter?.id === shelter.id ? 'border-emergency bg-red-50' : 'border-gray-200 bg-white'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <div className={`w-3 h-3 ${getShelterColor(shelter.type)} rounded-full mr-2`}></div>
                          <span className="font-medium text-gray-900">{shelter.name}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{shelter.type}</p>
                        <p className="text-xs text-gray-500">{shelter.address}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-emergency">
                          <i className="fas fa-walking mr-1" aria-hidden="true"></i>
                          {shelter.distance}m
                        </span>
                        <span className="text-sm text-gray-600">
                          <i className="fas fa-clock mr-1" aria-hidden="true"></i>
                          {shelter.walkingTime}분
                        </span>
                      </div>
                      
                      <Button
                        size="sm"
                        className="bg-emergency hover:bg-emergency-dark text-white"
                        onClick={() => handleGetDirections(shelter)}
                      >
                        <i className="fas fa-route mr-1" aria-hidden="true"></i>
                        길찾기
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="emergency-card">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <i className="fas fa-phone text-emergency mr-2" aria-hidden="true"></i>
                긴급 연락처
              </h3>
              
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start border-red-300 text-red-700 hover:bg-red-50"
                  onClick={() => window.open('tel:119')}
                >
                  <i className="fas fa-fire mr-2" aria-hidden="true"></i>
                  119 - 소방서 (화재/구조)
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-blue-300 text-blue-700 hover:bg-blue-50"
                  onClick={() => window.open('tel:112')}
                >
                  <i className="fas fa-shield-alt mr-2" aria-hidden="true"></i>
                  112 - 경찰서 (치안)
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-green-300 text-green-700 hover:bg-green-50"
                  onClick={() => window.open('tel:1588-5117')}
                >
                  <i className="fas fa-home mr-2" aria-hidden="true"></i>
                  재난상황실
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
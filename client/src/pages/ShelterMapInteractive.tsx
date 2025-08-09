import { useState, useEffect, useRef } from "react";
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

// Leaflet 타입 선언
declare global {
  interface Window {
    L: any;
  }
}

export default function ShelterMapInteractive() {
  const { location, error: geoError } = useGeolocation();
  const { t } = useLanguage();
  const [map, setMap] = useState<any>(null);
  const [tmapReady, setTmapReady] = useState(false);
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [routePolyline, setRoutePolyline] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  
  const { data: shelters, isLoading, error: shelterError } = useQuery({
    queryKey: ["/api/shelters", location?.coords?.latitude, location?.coords?.longitude],
    queryFn: async () => {
      if (!location || !location.coords) {
        throw new Error("위치 정보가 필요합니다");
      }
      const response = await apiRequest("GET", `/api/shelters?lat=${location.coords.latitude}&lng=${location.coords.longitude}`);
      if (!response.ok) {
        throw new Error(`대피소 정보 조회 실패: ${response.status}`);
      }
      return response.json() as Promise<Shelter[]>;
    },
    enabled: !!location?.coords,
  });

  // Leaflet 지도 라이브러리 로드
  useEffect(() => {
    if (window.L) {
      setTmapReady(true);
      return;
    }

    // Leaflet CSS가 이미 로드되었는지 확인
    const existingCSS = document.querySelector('link[href*="leaflet.css"]');
    if (!existingCSS) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Leaflet JS가 이미 로드되었는지 확인
    const existingScript = document.querySelector('script[src*="leaflet.js"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        console.log('Leaflet loaded successfully');
        setTmapReady(true);
      };
      script.onerror = () => {
        console.error('Failed to load Leaflet');
      };
      document.head.appendChild(script);
      
      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    } else {
      // 이미 스크립트가 있으면 바로 ready로 설정
      setTmapReady(true);
    }
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (tmapReady && location && mapRef.current && !map) {
      console.log('Initializing Leaflet map with location:', location);
      
      try {
        // 기존 지도가 있다면 완전히 제거
        if ((mapRef.current as any)._leaflet_id) {
          // 기존 지도 인스턴스가 있으면 제거
          if (map) {
            map.remove();
          }
          (mapRef.current as any)._leaflet_id = undefined;
          mapRef.current.innerHTML = '';
        }

        // Leaflet 지도 생성
        const newMap = window.L.map(mapRef.current, {
          zoomControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          dragging: true
        }).setView(
          [location.coords.latitude, location.coords.longitude], 
          13
        );

        // OpenStreetMap 타일 레이어 추가
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18
        }).addTo(newMap);

        // 사용자 위치 마커 추가 (빨간색)
        const userIcon = window.L.divIcon({
          html: '<div style="background-color: #ff4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px #ff4444;"></div>',
          iconSize: [20, 20],
          className: 'user-location-marker'
        });

        const userMarker = window.L.marker([location.coords.latitude, location.coords.longitude], {
          icon: userIcon
        }).addTo(newMap).bindPopup('현재 위치');

        setMap(newMap);
        setMarkers([userMarker]);
        console.log('Leaflet map initialized successfully');
        
        // 지도 크기 조정
        setTimeout(() => {
          newMap.invalidateSize();
        }, 100);
      } catch (error) {
        console.error('Failed to initialize map:', error);
      }
    }
  }, [tmapReady, location, map]);

  // 대피소 마커 추가
  useEffect(() => {
    if (map && shelters && shelters.length > 0) {
      console.log('Adding shelter markers:', shelters.length, 'shelters');
      
      // 기존 대피소 마커들 제거 (사용자 위치 마커는 유지)
      if (markers.length > 1) {
        markers.slice(1).forEach(marker => {
          try {
            map.removeLayer(marker);
          } catch (e) {
            console.warn('Failed to remove marker:', e);
          }
        });
      }
      
      const newMarkers = markers.length > 0 ? [markers[0]] : []; // 사용자 위치 마커 유지
      
      shelters.forEach((shelter) => {
        const markerColor = getShelterMarkerColor(shelter.type);
        
        // 대피소 마커 아이콘 생성 (단순한 원형 마커)
        const shelterIcon = window.L.divIcon({
          html: `<div style="background-color: ${markerColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [20, 20],
          className: 'shelter-marker'
        });
        
        const shelterMarker = window.L.marker([shelter.lat, shelter.lng], {
          icon: shelterIcon
        }).addTo(map).bindPopup(`
          <div>
            <strong>${shelter.name}</strong><br>
            <small>${shelter.type}</small><br>
            <small>도보 ${shelter.walkingTime}분 (${shelter.distance}m)</small>
          </div>
        `);

        // 마커 클릭 이벤트
        shelterMarker.on('click', () => {
          handleShelterSelect(shelter);
        });

        newMarkers.push(shelterMarker);
      });
      
      setMarkers(newMarkers);
    }
  }, [map, shelters]);

  const getShelterMarkerColor = (type: string) => {
    switch (type) {
      case "실내 대피소":
        return '#3b82f6'; // blue
      case "옥외 대피소":
        return '#10b981'; // green
      case "구호소":
        return '#8b5cf6'; // purple
      default:
        return '#6b7280'; // gray
    }
  };

  const handleShelterSelect = (shelter: Shelter) => {
    console.log('Shelter selected:', shelter);
    setSelectedShelter(shelter);
    calculateRoute(shelter);
  };

  const calculateRoute = async (shelter: Shelter) => {
    if (!location || !map) {
      console.error('Location or map not available');
      return;
    }

    try {
      console.log('Calculating route to:', shelter.name);
      
      // 기존 경로 제거
      if (routePolyline) {
        map.removeLayer(routePolyline);
      }

      // T-Map API로 경로 계산
      const response = await fetch('/api/tmap/route', {
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

      const routeData = await response.json();
      console.log('Route data received:', routeData);

      if (routeData.features) {
        const routeCoords: [number, number][] = [];
        
        routeData.features.forEach((feature: any) => {
          const geometry = feature.geometry;
          
          if (geometry.type === 'LineString') {
            geometry.coordinates.forEach((coord: number[]) => {
              routeCoords.push([coord[1], coord[0]]); // [lat, lng]
            });
          }
        });

        // 경로 polyline 그리기 (Leaflet)
        const polyline = window.L.polyline(routeCoords, {
          color: '#ff4444',
          weight: 4,
          opacity: 0.8
        }).addTo(map);

        setRoutePolyline(polyline);

        // 지도 범위를 경로에 맞춰 조정
        const bounds = window.L.latLngBounds([
          [location.coords.latitude, location.coords.longitude],
          [shelter.lat, shelter.lng]
        ]);
        map.fitBounds(bounds, { padding: [20, 20] });

        console.log('Route displayed successfully');
      } else {
        console.log('No route features found');
      }
    } catch (error) {
      console.error('Route calculation failed:', error);
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
        return "bg-blue-500";
      case "옥외 대피소":
        return "bg-green-500";
      case "구호소":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
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
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-emergency text-center flex items-center justify-center">
        <i className="fas fa-map-marker-alt mr-3" aria-hidden="true"></i>
        주변 대피소 안내
      </h1>
      
      {/* 지도 상태 표시 */}
      <Card className="emergency-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-3 h-3 rounded-full ${tmapReady ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-sm text-gray-600">
                {tmapReady ? 'T-Map 연결됨' : 'T-Map 로딩 중...'}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {location ? 
                `현재 위치: ${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}` :
                '위치 확인 중...'
              }
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 지도 영역 */}
        <div className="lg:col-span-2">
          <Card className="emergency-card">
            <CardContent className="p-0">
              {geoError ? (
                <div className="h-96 flex items-center justify-center bg-gray-100 rounded">
                  <div className="text-center">
                    <i className="fas fa-exclamation-triangle text-4xl text-warning mb-4" aria-hidden="true"></i>
                    <p className="text-gray-600">위치 권한을 허용해주세요</p>
                  </div>
                </div>
              ) : !location ? (
                <div className="h-96 flex items-center justify-center bg-gray-100 rounded">
                  <div className="text-center">
                    <i className="fas fa-spinner fa-spin text-4xl text-emergency mb-4" aria-hidden="true"></i>
                    <p className="text-gray-600">위치를 가져오는 중...</p>
                  </div>
                </div>
              ) : !tmapReady ? (
                <div className="h-96 flex items-center justify-center bg-gray-100 rounded">
                  <div className="text-center">
                    <i className="fas fa-spinner fa-spin text-4xl text-emergency mb-4" aria-hidden="true"></i>
                    <p className="text-gray-600">지도를 불러오는 중...</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div ref={mapRef} className="w-full h-96 rounded bg-gray-100"></div>
                  {isLoading && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded">
                      <div className="text-center">
                        <div className="text-blue-500 text-2xl mb-2">🔍</div>
                        <p className="text-sm text-gray-600">대피소 검색 중...</p>
                      </div>
                    </div>
                  )}
                  {!isLoading && shelters && shelters.length === 0 && (
                    <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded">
                      <div className="text-center">
                        <div className="text-yellow-500 text-2xl mb-2">⚠️</div>
                        <p className="text-sm text-gray-600">현재 위치 기준 대피소를 찾을 수 없습니다</p>
                        <p className="text-xs text-gray-500 mt-1">정부 API에서 이 지역 데이터를 아직 제공하지 않을 수 있습니다</p>
                        <div className="mt-3 space-x-2">
                          <button 
                            onClick={() => window.location.href = '/shelters?lat=37.5665&lng=126.9780'}
                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                          >
                            서울로 테스트
                          </button>
                          <button 
                            onClick={() => window.location.reload()}
                            className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                          >
                            다시 시도
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 선택된 대피소 정보 */}
          {selectedShelter && (
            <Card className="emergency-card mt-4">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 ${getShelterColor(selectedShelter.type)} rounded-full`}></div>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedShelter.name}</h3>
                    <p className="text-sm text-gray-600">{selectedShelter.type}</p>
                    <p className="text-xs text-gray-500">{selectedShelter.address}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 mt-3">
                  <span className="text-sm text-emergency font-medium">
                    <i className="fas fa-walking mr-1" aria-hidden="true"></i>
                    {selectedShelter.distance}km
                  </span>
                  <span className="text-sm text-gray-600">
                    <i className="fas fa-clock mr-1" aria-hidden="true"></i>
                    도보 {selectedShelter.walkingTime}분
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 대피소 목록 */}
        <div className="space-y-4">
          <Card className="emergency-card">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <i className="fas fa-list text-emergency mr-2" aria-hidden="true"></i>
                주변 대피소 ({shelters?.length || 0}곳)
                {shelters && shelters.length > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    (최근거리 {shelters[0].distance}km)
                  </span>
                )}
              </h3>
              
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {shelters?.map((shelter) => (
                  <div 
                    key={shelter.id} 
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedShelter?.id === shelter.id ? 
                        'border-emergency bg-red-50' : 
                        'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => handleShelterSelect(shelter)}
                  >
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 범례 */}
          <Card className="emergency-card">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">
                <i className="fas fa-info-circle text-emergency mr-2" aria-hidden="true"></i>
                범례
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">실내 대피소</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">옥외 대피소</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">구호소</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">현재 위치</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 긴급 연락처 */}
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
                  119 - 소방서
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-blue-300 text-blue-700 hover:bg-blue-50"
                  onClick={() => window.open('tel:112')}
                >
                  <i className="fas fa-shield-alt mr-2" aria-hidden="true"></i>
                  112 - 경찰서
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
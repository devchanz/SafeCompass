import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/contexts/LanguageContext';
import { TMapService } from '@/services/tmapService';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet 기본 아이콘 설정
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Shelter {
  id: string;
  name: string;
  type: string;
  address: string;
  lat: number;
  lng: number;
  distance: number;
  walkingTime: number;
  capacity: number;
  facilities: string[];
}

export default function ShelterMapFixed() {
  const { t } = useLanguage();
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [locationStatus, setLocationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const shelterMarkersRef = useRef<L.Marker[]>([]);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const tmapService = useRef(new TMapService());

  // 사용자 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setLocationStatus('success');
          console.log('✅ 사용자 위치 획득:', location);
        },
        (error) => {
          console.error('❌ 위치 접근 오류:', error);
          // 기본값으로 대전시청 좌표 사용
          const defaultLocation = { lat: 36.437206, lng: 127.392151 };
          setUserLocation(defaultLocation);
          setLocationStatus('error');
          setErrorMessage('위치 접근 권한이 거부되었습니다. 기본 위치(대전시청)로 검색합니다.');
        }
      );
    } else {
      setLocationStatus('error');
      setErrorMessage('브라우저에서 위치 서비스를 지원하지 않습니다.');
    }
  }, []);

  // 대피소 데이터 조회
  const { data: shelters = [], isLoading, error } = useQuery<Shelter[]>({
    queryKey: ['/api/shelters', userLocation?.lat, userLocation?.lng],
    enabled: !!userLocation,
  });

  // 지도 초기화
  useEffect(() => {
    if (!mapContainerRef.current || !userLocation) return;

    // 기존 지도 제거
    if (mapRef.current) {
      mapRef.current.remove();
    }

    // 새 지도 생성
    const map = L.map(mapContainerRef.current).setView([userLocation.lat, userLocation.lng], 13);

    // 타일 레이어 추가 (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapRef.current = map;

    // 사용자 위치 마커 추가
    const userIcon = L.divIcon({
      html: '<div style="background-color: #dc2626; border-radius: 50%; width: 20px; height: 20px; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      className: 'user-marker'
    });

    const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map);
    userMarker.bindPopup('<strong>현재 위치</strong>');
    userMarkerRef.current = userMarker;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [userLocation]);

  // 대피소 마커 추가
  useEffect(() => {
    if (!mapRef.current || !shelters.length) return;

    // 기존 대피소 마커 제거
    shelterMarkersRef.current.forEach(marker => {
      mapRef.current?.removeLayer(marker);
    });
    shelterMarkersRef.current = [];

    // 새 대피소 마커 추가
    (shelters as Shelter[]).forEach((shelter: Shelter) => {
      const shelterIcon = L.divIcon({
        html: `<div style="background-color: ${getShelterColor(shelter.type)}; border-radius: 50%; width: 16px; height: 16px; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        className: 'shelter-marker'
      });

      const marker = L.marker([shelter.lat, shelter.lng], { icon: shelterIcon }).addTo(mapRef.current!);
      
      marker.bindPopup(`
        <div class="p-2">
          <h3 class="font-bold text-sm">${shelter.name}</h3>
          <p class="text-xs text-gray-600">${shelter.type}</p>
          <p class="text-xs">${shelter.address}</p>
          <p class="text-xs mt-1">거리: ${shelter.distance}km | 도보: ${shelter.walkingTime}분</p>
        </div>
      `);

      marker.on('click', async () => {
        setSelectedShelter(shelter);
        await showRoute(shelter);
      });

      shelterMarkersRef.current.push(marker);
    });

    console.log(`✅ ${(shelters as Shelter[]).length}개 대피소 마커 추가 완료`);
  }, [shelters]);

  // 대피소 타입별 색상
  const getShelterColor = (type: string) => {
    if (type.includes('옥외')) return '#10b981'; // 초록색
    if (type.includes('실내')) return '#3b82f6'; // 파란색
    if (type.includes('해일')) return '#8b5cf6'; // 보라색
    return '#6b7280'; // 회색
  };

  // T-Map API를 사용한 도보 경로 표시
  const showRoute = async (shelter: Shelter) => {
    if (!mapRef.current || !userLocation) return;

    // 기존 경로 제거
    if (routeLayerRef.current) {
      mapRef.current.removeLayer(routeLayerRef.current);
    }

    console.log(`🗺️ ${shelter.name}로의 도보 경로 검색 시작`);

    try {
      // T-Map API로 실제 도보 경로 가져오기
      const route = await tmapService.current.getWalkingRoute(
        userLocation.lat, 
        userLocation.lng, 
        shelter.lat, 
        shelter.lng
      );

      if (route) {
        // 실제 경로 그리기
        const polyline = L.polyline(route.coordinates, { 
          color: '#dc2626', 
          weight: 5, 
          opacity: 0.8,
          dashArray: route.coordinates.length <= 2 ? '10, 10' : undefined // 직선일 때만 점선
        }).addTo(mapRef.current);
        
        routeLayerRef.current = polyline;

        // 지도 범위를 경로에 맞게 조정
        const group = new L.FeatureGroup([polyline]);
        mapRef.current.fitBounds(group.getBounds(), { padding: [20, 20] });

        // 경로 정보 표시
        const distanceKm = (route.totalDistance / 1000).toFixed(1);
        const timeMinutes = Math.ceil(route.totalTime / 60);
        
        console.log(`✅ 경로 표시 완료: ${distanceKm}km, ${timeMinutes}분`);
        
        // 팝업에 실제 경로 정보 업데이트
        if (userMarkerRef.current) {
          userMarkerRef.current.bindPopup(`
            <div class="p-2">
              <strong>현재 위치</strong><br/>
              <small>📍 ${shelter.name}까지<br/>
              🚶 ${distanceKm}km (${timeMinutes}분)</small>
            </div>
          `);
        }
      }
    } catch (error) {
      console.error('❌ 경로 표시 오류:', error);
      
      // 오류 시 직선 경로로 대체
      const routePoints: [number, number][] = [
        [userLocation.lat, userLocation.lng],
        [shelter.lat, shelter.lng]
      ];

      const polyline = L.polyline(routePoints, { 
        color: '#dc2626', 
        weight: 4, 
        opacity: 0.7,
        dashArray: '10, 10'
      }).addTo(mapRef.current);
      
      routeLayerRef.current = polyline;

      const group = new L.FeatureGroup([polyline]);
      mapRef.current.fitBounds(group.getBounds(), { padding: [20, 20] });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            🏢 지진 대피소 지도 (수정된 버전)
          </h1>
          <p className="text-gray-600">
            실시간 GPS 위치 기반으로 주변 지진 대피소를 검색하고 경로를 확인하세요
          </p>
        </div>

        {/* 상태 알림 */}
        {locationStatus === 'error' && (
          <Alert className="mb-4">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 지도 영역 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-map text-blue-600" aria-hidden="true"></i>
                  대피소 위치 지도
                  {isLoading && (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  ref={mapContainerRef}
                  className="w-full h-96 bg-gray-200 rounded-lg border"
                  style={{ minHeight: '400px' }}
                >
                  {locationStatus === 'loading' && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-gray-600">위치 정보를 가져오는 중...</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* 범례 */}
                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                    <span>현재 위치</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span>옥외 대피소</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span>실내 대피소</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                    <span>해일 대피소</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 대피소 목록 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-list text-green-600" aria-hidden="true"></i>
                  근처 대피소 ({(shelters as Shelter[]).length}개)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <Alert>
                    <AlertDescription>
                      대피소 정보를 불러올 수 없습니다. 네트워크 연결을 확인해주세요.
                    </AlertDescription>
                  </Alert>
                ) : (shelters as Shelter[]).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    주변에 등록된 대피소가 없습니다
                  </p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {(shelters as Shelter[]).map((shelter: Shelter) => (
                      <div
                        key={shelter.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedShelter?.id === shelter.id 
                            ? 'bg-blue-50 border-blue-300' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={async () => {
                          setSelectedShelter(shelter);
                          await showRoute(shelter);
                        }}
                      >
                        <h3 className="font-medium text-sm">{shelter.name}</h3>
                        <Badge variant="outline" className="text-xs mt-1">
                          {shelter.type}
                        </Badge>
                        <p className="text-xs text-gray-600 mt-1">{shelter.address}</p>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>거리: {shelter.distance}km</span>
                          <span>도보: {shelter.walkingTime}분</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 선택된 대피소 정보 */}
            {selectedShelter && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-blue-600">
                    선택된 대피소
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h3 className="font-bold">{selectedShelter.name}</h3>
                    <Badge>{selectedShelter.type}</Badge>
                    <p className="text-sm text-gray-600">{selectedShelter.address}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">거리:</span>
                        <p>{selectedShelter.distance}km</p>
                      </div>
                      <div>
                        <span className="font-medium">도보 시간:</span>
                        <p>{selectedShelter.walkingTime}분</p>
                      </div>
                    </div>

                    {selectedShelter.capacity > 0 && (
                      <div>
                        <span className="font-medium">수용 인원:</span>
                        <p>{selectedShelter.capacity}명</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
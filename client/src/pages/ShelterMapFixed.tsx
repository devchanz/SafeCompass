import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
// import { useLanguage } from '@/contexts/LanguageContext'; // 더 이상 사용하지 않음
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
  const language = localStorage.getItem('selectedLanguage') || 'ko'; // 로컬 스토리지에서 언어 가져오기

  // 하드코딩된 다국어 텍스트
  const getText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      ko: {
        shelter_map: '대피소 지도',
        current_location: '현재 위치',
        loading_location: '위치 정보 확인 중...',
        location_error: '위치 정보 오류',
        shelter_search: '대피소 검색 중...',
        shelter_found: '개 대피소 발견',
        no_shelters: '주변에 대피소가 없습니다',
        distance: '거리',
        walking_time: '도보',
        minutes: '분',
        capacity: '수용인원',
        indoor: '실내',
        outdoor: '옥외',
        relief_center: '구호소',
        select_shelter: '대피소 선택',
        route_calculation: '경로 계산',
        back_to_list: '목록으로',
        refresh_location: '위치 새로고침'
      },
      en: {
        shelter_map: 'Shelter Map',
        current_location: 'Current Location',
        loading_location: 'Getting location...',
        location_error: 'Location Error',
        shelter_search: 'Searching shelters...',
        shelter_found: ' shelters found',
        no_shelters: 'No shelters nearby',
        distance: 'Distance',
        walking_time: 'Walking',
        minutes: 'min',
        capacity: 'Capacity',
        indoor: 'Indoor',
        outdoor: 'Outdoor',
        relief_center: 'Relief Center',
        select_shelter: 'Select Shelter',
        route_calculation: 'Route Calculation',
        back_to_list: 'Back to List',
        refresh_location: 'Refresh Location'
      },
      vi: {
        shelter_map: 'Bản đồ nơi trú ẩn',
        current_location: 'Vị trí hiện tại',
        loading_location: 'Đang xác định vị trí...',
        location_error: 'Lỗi vị trí',
        shelter_search: 'Đang tìm nơi trú ẩn...',
        shelter_found: ' nơi trú ẩn được tìm thấy',
        no_shelters: 'Không có nơi trú ẩn gần đây',
        distance: 'Khoảng cách',
        walking_time: 'Đi bộ',
        minutes: 'phút',
        capacity: 'Sức chứa',
        indoor: 'Trong nhà',
        outdoor: 'Ngoài trời',
        relief_center: 'Trung tâm cứu trợ',
        select_shelter: 'Chọn nơi trú ẩn',
        route_calculation: 'Tính toán lộ trình',
        back_to_list: 'Quay lại danh sách',
        refresh_location: 'Làm mới vị trí'
      },
      zh: {
        shelter_map: '避难所地图',
        current_location: '当前位置',
        loading_location: '正在获取位置...',
        location_error: '位置错误',
        shelter_search: '正在搜索避难所...',
        shelter_found: ' 个避难所',
        no_shelters: '附近没有避难所',
        distance: '距离',
        walking_time: '步行',
        minutes: '分钟',
        capacity: '容量',
        indoor: '室内',
        outdoor: '室外',
        relief_center: '救援中心',
        select_shelter: '选择避难所',
        route_calculation: '路线计算',
        back_to_list: '返回列表',
        refresh_location: '刷新位置'
      }
    };
    return texts[language]?.[key] || texts['ko'][key] || key;
  };
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
    queryKey: [`/api/shelters/${userLocation?.lat}/${userLocation?.lng}`],
    enabled: !!userLocation,
  });

  // 디버깅용 로그
  console.log('🔍 Debug Info:', {
    userLocation,
    isLoading,
    error: error?.message,
    sheltersLength: shelters?.length,
    shelters: shelters?.slice(0, 3) // 처음 3개만 출력
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
        // T-Map 실제 경로는 파란색 실선, 직선 경로는 빨간색 점선
        const polyline = L.polyline(route.coordinates, { 
          color: route.isActualRoute ? '#2563eb' : '#dc2626', // 파란색 vs 빨간색
          weight: 5, 
          opacity: 0.8,
          dashArray: route.isActualRoute ? undefined : '10, 10' // 실제 경로는 실선, 직선은 점선
        }).addTo(mapRef.current);
        
        routeLayerRef.current = polyline;

        // 지도 범위를 경로에 맞게 조정
        const group = new L.FeatureGroup([polyline]);
        mapRef.current.fitBounds(group.getBounds(), { padding: [20, 20] });

        // 경로 정보 표시
        const distanceKm = (route.totalDistance / 1000).toFixed(1);
        const timeMinutes = Math.ceil(route.totalTime / 60);
        
        console.log(`✅ 경로 표시 완료: ${distanceKm}km, ${timeMinutes}분`);
        
        // T-Map 실제 경로 정보로 대피소 정보 업데이트
        setSelectedShelter({
          ...shelter,
          distance: parseFloat(distanceKm),
          walkingTime: timeMinutes
        });
        
        // 팝업에 실제 경로 정보 표시
        if (userMarkerRef.current) {
          userMarkerRef.current.bindPopup(`
            <div class="p-3">
              <strong class="text-blue-600">현재 위치</strong><br/>
              <div class="mt-2 pt-2 border-t">
                <p class="text-sm font-medium">📍 ${shelter.name}까지</p>
                <p class="text-xs text-green-600">🚶 ${route.isActualRoute ? 'T-Map 실제 경로' : '직선 거리'}: ${distanceKm}km (${timeMinutes}분)</p>
              </div>
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
            🏢 {getText('shelter_map')} (수정된 버전)
          </h1>
          <p className="text-gray-600">
            대피소 위치와 실시간 경로를 확인하세요
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
위치 지도
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
                        <p className="text-gray-600">{getText('loading_location')}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* 범례 */}
                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                    <span>{getText('current_location')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span>{getText('outdoor')} 대피소</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-blue-600"></div>
                    <span>T-Map 실제 경로</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-red-600" style={{ background: 'repeating-linear-gradient(to right, #dc2626 0, #dc2626 4px, transparent 4px, transparent 8px)' }}></div>
                    <span>직선 거리</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span>{getText('indoor')} 대피소</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                    <span>{getText('relief_center')}</span>
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
                  주변 대피소 ({(shelters as Shelter[]).length}{getText('shelter_found')})
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
                      네트워크 오류가 발생했습니다: {error?.message || '알 수 없는 오류'}
                    </AlertDescription>
                  </Alert>
                ) : (shelters as Shelter[]).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
{getText('no_shelters')}
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
                          <span>{getText('distance')}: {shelter.distance}km</span>
                          <span>{getText('walking_time')}: {shelter.walkingTime}{getText('minutes')}</span>
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
{getText('select_shelter')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h3 className="font-bold">{selectedShelter.name}</h3>
                    <Badge>{selectedShelter.type}</Badge>
                    <p className="text-sm text-gray-600">{selectedShelter.address}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">{getText('distance')}:</span>
                        <p>{selectedShelter.distance}km</p>
                      </div>
                      <div>
                        <span className="font-medium">{getText('walking_time')} 시간:</span>
                        <p>{selectedShelter.walkingTime}{getText('minutes')}</p>
                      </div>
                    </div>

                    {selectedShelter.capacity > 0 && (
                      <div>
                        <span className="font-medium">{getText('capacity')}:</span>
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
export interface TMapRoute {
  totalDistance: number;
  totalTime: number;
  coordinates: [number, number][];
  isActualRoute?: boolean;
}

export class TMapService {
  private apiKey: string;
  private baseUrl = 'https://apis.openapi.sk.com/tmap';

  constructor() {
    // 클라이언트에서는 API 키가 필요 없음 (서버를 통해 호출)
    this.apiKey = 'server-proxy';
    console.log('✅ T-Map 서비스 초기화: 서버를 통해 API 호출');
  }

  /**
   * T-Map API를 사용하여 도보 경로 검색
   */
  async getWalkingRoute(
    startLat: number, 
    startLng: number, 
    endLat: number, 
    endLng: number
  ): Promise<TMapRoute | null> {
    // 서버를 통해 API 호출하므로 클라이언트에서 API 키 체크 불필요

    try {
      const requestBody = {
        startX: startLng.toString(),
        startY: startLat.toString(),
        endX: endLng.toString(),
        endY: endLat.toString(),
        reqCoordType: "WGS84GEO",
        resCoordType: "WGS84GEO",
        searchOption: "0", // 최적 경로
        trafficInfo: "N"
      };

      console.log('🗺️ T-Map API 도보 경로 요청:', requestBody);

      // 서버를 통해 T-Map API 호출 (CORS 해결)
      const response = await fetch('/api/tmap/route', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startX: startLng,
          startY: startLat,
          endX: endLng,
          endY: endLat
        })
      });

      if (!response.ok) {
        console.warn(`T-Map API 응답 오류: ${response.status}`);
        return this.getStraightLineRoute(startLat, startLng, endLat, endLng);
      }

      const data = await response.json();
      
      // 서버에서 이미 파싱된 데이터가 옴
      console.log('🔍 서버 응답 데이터 확인:', { 
        hasCoordinates: !!data.coordinates, 
        coordLength: data.coordinates?.length,
        totalDistance: data.totalDistance,
        totalTime: data.totalTime 
      });
      
      if (data.coordinates && data.coordinates.length > 0) {
        console.log(`✅ T-Map 실제 경로 받음: ${data.totalDistance}m, ${data.totalTime}초, ${data.coordinates.length}개 좌표`);
        console.log('📍 첫 번째 좌표:', data.coordinates[0]);
        console.log('📍 마지막 좌표:', data.coordinates[data.coordinates.length - 1]);
        
        return {
          totalDistance: data.totalDistance,
          totalTime: data.totalTime,
          coordinates: data.coordinates,
          isActualRoute: true // 실제 T-Map 경로임을 표시
        };
      }

      console.warn('T-Map API에서 유효한 경로를 찾을 수 없습니다.');
      return this.getStraightLineRoute(startLat, startLng, endLat, endLng);

    } catch (error) {
      console.error('❌ T-Map API 오류:', error);
      return this.getStraightLineRoute(startLat, startLng, endLat, endLng);
    }
  }

  /**
   * T-Map API 응답을 파싱하여 경로 정보 추출
   */
  private parseRouteResponse(data: any): TMapRoute {
    const coordinates: [number, number][] = [];
    let totalDistance = 0;
    let totalTime = 0;

    // T-Map API 응답에서 경로 정보 추출
    data.features.forEach((feature: any) => {
      if (feature.geometry.type === 'LineString') {
        const coords = feature.geometry.coordinates;
        coords.forEach((coord: number[]) => {
          coordinates.push([coord[1], coord[0]]); // [lat, lng] 순서로 변환
        });
      }

      // 총 거리와 시간 정보 추출
      if (feature.properties) {
        if (feature.properties.totalDistance) {
          totalDistance = feature.properties.totalDistance;
        }
        if (feature.properties.totalTime) {
          totalTime = feature.properties.totalTime;
        }
      }
    });

    console.log(`✅ T-Map 경로 파싱 완료: ${coordinates.length}개 좌표, ${totalDistance}m, ${totalTime}초`);

    return {
      totalDistance: totalDistance,
      totalTime: totalTime,
      coordinates: coordinates
    };
  }

  /**
   * 직선 경로 생성 (T-Map API 사용 불가시 대안)
   */
  private getStraightLineRoute(
    startLat: number, 
    startLng: number, 
    endLat: number, 
    endLng: number
  ): TMapRoute {
    const distance = this.calculateDistance(startLat, startLng, endLat, endLng);
    const walkingTime = Math.ceil((distance / 5) * 3600); // 5km/h 보행속도, 초 단위

    return {
      totalDistance: distance * 1000, // 미터 단위
      totalTime: walkingTime,
      coordinates: [
        [startLat, startLng],
        [endLat, endLng]
      ],
      isActualRoute: false // 직선 경로임을 표시
    };
  }

  /**
   * 두 좌표 간 직선거리 계산 (km)
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // 지구 반지름 (km)
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}
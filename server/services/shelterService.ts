// 재난안전대응데이터 플랫폼 API 연동을 위한 서비스

export interface RealShelter {
  id: string;
  name: string;
  type: string;
  address: string;
  lat: number;
  lng: number;
  distance?: number;
  walkingTime?: number;
  capacity?: number;
  facilities?: string[];
}

export interface DisasterApiConfig {
  apiKey: string;
  baseUrl: string;
  endpoints: {
    shelters: string;
  };
}

export class ShelterService {
  private config: DisasterApiConfig;
  
  constructor(config: DisasterApiConfig) {
    this.config = config;
  }

  /**
   * 사용자 위치 기준 주변 대피소 조회
   * @param lat 사용자 위도
   * @param lng 사용자 경도 
   * @param radius 검색 반경 (km)
   */
  async getNearbyRealShelters(lat: number, lng: number, radius: number = 5): Promise<RealShelter[]> {
    try {
      const url = new URL(this.config.endpoints.shelters, this.config.baseUrl);
      
      // 일반적인 재난안전 API 파라미터 예시
      url.searchParams.set('serviceKey', this.config.apiKey);
      url.searchParams.set('pageNo', '1');
      url.searchParams.set('numOfRows', '20'); // 최대 20개
      url.searchParams.set('dataType', 'JSON');
      
      // 위치 기반 검색 파라미터 (API 구체적 스펙에 따라 조정 필요)
      url.searchParams.set('lat', lat.toString());
      url.searchParams.set('lng', lng.toString());
      url.searchParams.set('radius', radius.toString());

      console.log(`🔍 대피소 API 호출: ${url.toString()}`);
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`대피소 API 호출 실패: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('🏢 대피소 API 응답:', data);
      
      return this.transformApiResponseToShelters(data, lat, lng);
      
    } catch (error) {
      console.error('❌ 대피소 API 호출 오류:', error);
      // 실제 API 연동 실패시 빈 배열 반환 (더미 데이터 사용하지 않음)
      throw new Error(`대피소 데이터 조회 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * API 응답을 우리 앱의 대피소 형식으로 변환
   * 실제 API 구조에 맞게 수정해야 함
   */
  private transformApiResponseToShelters(apiData: any, userLat: number, userLng: number): RealShelter[] {
    // API 응답 구조 예시 - 실제 API 구조에 맞게 수정 필요
    const shelters = apiData.response?.body?.items || apiData.items || [];
    
    return shelters.map((item: any, index: number): RealShelter => {
      // 거리 계산 (직선거리)
      const distance = this.calculateDistance(
        userLat, userLng, 
        parseFloat(item.lat || item.latitude), 
        parseFloat(item.lng || item.longitude)
      );
      
      // 도보 시간 추정 (평균 5km/h = 4분/km)
      const walkingTime = Math.round(distance * 4);
      
      return {
        id: item.id || `shelter-${index}`,
        name: item.name || item.shelterName || item.facilityName || '대피소',
        type: this.classifyShelterType(item.type || item.shelterType || '일반대피소'),
        address: item.address || item.location || '주소 정보 없음',
        lat: parseFloat(item.lat || item.latitude),
        lng: parseFloat(item.lng || item.longitude), 
        distance: Math.round(distance),
        walkingTime: walkingTime,
        capacity: parseInt(item.capacity) || undefined,
        facilities: this.parseFacilities(item.facilities || item.equipment)
      };
    });
  }

  /**
   * 대피소 타입 분류
   */
  private classifyShelterType(type: string): string {
    const typeMap: { [key: string]: string } = {
      '실내': '실내 대피소',
      '옥외': '옥외 대피소', 
      '구호소': '구호소',
      '학교': '실내 대피소',
      '공원': '옥외 대피소',
      '체육관': '실내 대피소',
      '마을회관': '실내 대피소'
    };
    
    for (const [key, value] of Object.entries(typeMap)) {
      if (type.includes(key)) {
        return value;
      }
    }
    
    return '일반 대피소';
  }

  /**
   * 시설 정보 파싱
   */
  private parseFacilities(facilitiesStr: string | null): string[] {
    if (!facilitiesStr) return [];
    
    const facilities = facilitiesStr.split(',').map(f => f.trim()).filter(f => f.length > 0);
    return facilities;
  }

  /**
   * 두 좌표 간 직선 거리 계산 (km)
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // 지구 반지름 (km)
    const dLat = this.degToRad(lat2 - lat1);
    const dLng = this.degToRad(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.degToRad(lat1)) * Math.cos(this.degToRad(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private degToRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

// 실제 API 연동을 위한 설정 예시
export function createShelterService(): ShelterService | null {
  const apiKey = process.env.DISASTER_API_KEY;
  const baseUrl = process.env.DISASTER_API_BASE_URL;
  
  if (!apiKey || !baseUrl) {
    console.warn('⚠️ 재난안전 API 설정이 없습니다. 환경변수 DISASTER_API_KEY, DISASTER_API_BASE_URL을 확인하세요.');
    return null;
  }

  const config: DisasterApiConfig = {
    apiKey,
    baseUrl,
    endpoints: {
      // 실제 API 엔드포인트로 수정 필요
      shelters: '/shelters' // 예: '/api/v1/shelters' 또는 '/shelterInfo'
    }
  };

  return new ShelterService(config);
}
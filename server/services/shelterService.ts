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
      
      // 행정안전부 지진 대피장소 API 파라미터
      url.searchParams.set('serviceKey', this.config.apiKey);
      url.searchParams.set('pageNo', '1');
      url.searchParams.set('numOfRows', '50'); // 대피소 수를 늘림
      url.searchParams.set('dataType', 'JSON');
      
      // 위치 기반 검색은 API에서 지원하지 않을 수 있으므로 전체 데이터를 가져와서 필터링
      console.log(`📍 사용자 위치: 위도 ${lat}, 경도 ${lng}, 반경 ${radius}km`);

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
   * 행정안전부 지진 대피장소 API 응답을 우리 앱 형식으로 변환
   */
  private transformApiResponseToShelters(apiData: any, userLat: number, userLng: number): RealShelter[] {
    console.log('🔄 API 응답 수신됨, body 항목 수:', apiData?.body?.length || 0);
    
    // 행정안전부 API 응답 구조: body 배열
    const items = apiData?.body || [];
    
    if (!Array.isArray(items)) {
      console.warn('⚠️ API 응답에서 items 배열을 찾을 수 없습니다');
      return [];
    }

    // 사용자 위치에서 가까운 순으로 정렬하고 반경 내 대피소만 필터링
    const nearbyItems = items
      .map((item: any, index: number) => {
        // 위경도 정보 추출 (실제 API 필드명: LAT, LOT)
        const shelterLat = parseFloat(item.LAT || 0);
        const shelterLng = parseFloat(item.LOT || 0);
        
        if (shelterLat === 0 || shelterLng === 0) {
          return null; // 잘못된 좌표는 제외
        }

        const distance = this.calculateDistance(userLat, userLng, shelterLat, shelterLng);
        
        return {
          ...item,
          distance,
          shelterLat,
          shelterLng,
          index
        };
      })
      .filter(item => item && item.distance <= 50) // 50km 이내로 확대 (전국 대피소 고려)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 20); // 최대 20개

    return nearbyItems.map((item: any): RealShelter => {
      const walkingTime = Math.round(item.distance * 12); // 평균 5km/h = 12분/km
      
      return {
        id: item.SENU || `shelter-${item.index}`,
        name: item.SHLT_NM || '대피소',
        type: this.classifyShelterType(item.SHLT_TYPE || item.ADDR || '지진 대피소'),
        address: item.ADDR || '주소 정보 없음',
        lat: item.shelterLat,
        lng: item.shelterLng,
        distance: Math.round(item.distance * 1000), // km를 m로 변환
        walkingTime: walkingTime,
        capacity: parseInt(item.ACTC_PSBLTY_TNOP) || undefined,
        facilities: this.parseFacilities(`${item.SHLT_TYPE || ''} - 길이:${item.LEN}m, 높이:${item.HGT}m`)
      };
    });
  }

  /**
   * 대피소 타입 분류 - 행정안전부 API 데이터 기준
   */
  private classifyShelterType(shelterTypeOrAddress: string): string {
    const typeMapping: { [key: string]: string } = {
      '공터': '옥외 대피소',
      '건물': '실내 대피소', 
      '체육관': '실내 대피소',
      '학교': '실내 대피소',
      '공원': '옥외 대피소'
    };
    
    // SHLT_TYPE 우선 확인
    for (const [apiType, ourType] of Object.entries(typeMapping)) {
      if (shelterTypeOrAddress.includes(apiType)) {
        return ourType;
      }
    }
    
    // 주소에서 키워드 검색
    const addressKeywords = [
      { keywords: ['초등학교', '중학교', '고등학교', '학교'], type: '실내 대피소' },
      { keywords: ['공원', '광장', '운동장'], type: '옥외 대피소' },
      { keywords: ['체육관', '실내체육관'], type: '실내 대피소' },
      { keywords: ['주민센터', '마을회관'], type: '실내 대피소' }
    ];
    
    for (const { keywords, type } of addressKeywords) {
      if (keywords.some(keyword => shelterTypeOrAddress.includes(keyword))) {
        return type;
      }
    }
    
    return '지진 대피소';
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
  // 실제 재난안전대응데이터 플랫폼 API 설정
  const config: DisasterApiConfig = {
    apiKey: 'E66AUK0213KP6N6W', // 제공받은 API 키
    baseUrl: 'https://www.safetydata.go.kr',
    endpoints: {
      shelters: '/V2/api/DSSP-IF-00706' // 행정안전부_지진_대피장소 API
    }
  };

  console.log('✅ 실제 재난안전 API 서비스 생성됨');
  return new ShelterService(config);
}
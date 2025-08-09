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
   * 사용자 위치 기준 주변 대피소 조회 - 다중 페이지 조회로 대전 지역 대피소 찾기
   */
  async getNearbyRealShelters(lat: number, lng: number, radius: number = 5): Promise<RealShelter[]> {
    try {
      console.log(`🔍 대전 지역 대피소 검색 시작 - 사용자 위치: ${lat}, ${lng}`);
      
      // 여러 페이지를 조회하여 더 많은 대피소 데이터 수집
      const allItems: any[] = [];
      const maxPages = 30; // 대전 지역 대피소를 찾기 위해 더 많은 페이지 조회
      
      for (let pageNo = 1; pageNo <= maxPages; pageNo++) {
        try {
          const url = new URL(this.config.endpoints.shelters, this.config.baseUrl);
          
          // 행정안전부 지진 대피장소 API 파라미터
          url.searchParams.set('serviceKey', this.config.apiKey);
          url.searchParams.set('pageNo', pageNo.toString());
          url.searchParams.set('numOfRows', '100'); // 페이지당 100개
          url.searchParams.set('dataType', 'JSON');
          
          console.log(`🔍 페이지 ${pageNo} API 호출`);
          
          const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          });

          if (!response.ok) {
            console.warn(`페이지 ${pageNo} API 호출 실패: ${response.status}`);
            continue;
          }

          const data = await response.json();
          const items = data?.body || [];
          
          if (!Array.isArray(items) || items.length === 0) {
            console.log(`페이지 ${pageNo}: 데이터 없음, 검색 종료`);
            break;
          }
          
          console.log(`페이지 ${pageNo}: ${items.length}개 대피소 수집`);
          
          // 대전 광역시 대피소 우선 확인
          const daejeonShelters = items.filter((item: any) => 
            (item.CTPV_NM && item.CTPV_NM.includes('대전')) ||
            (item.ADDR && item.ADDR.includes('대전')) ||
            (item.CTPV_NM && item.CTPV_NM.includes('충청남도'))
          );
          
          if (daejeonShelters.length > 0) {
            console.log(`🎯 페이지 ${pageNo}에서 대전/충청 지역 대피소 ${daejeonShelters.length}개 발견!`);
            daejeonShelters.forEach((shelter: any) => {
              console.log(`  - ${shelter.SHLT_NM} (${shelter.ADDR})`);
            });
          }
          
          allItems.push(...items);
          
          // 충분한 데이터를 수집했으면 조기 중단
          if (allItems.length >= 3000) {
            console.log(`충분한 데이터 수집됨: ${allItems.length}개`);
            break;
          }
          
        } catch (pageError) {
          console.warn(`페이지 ${pageNo} 처리 오류:`, pageError);
          continue;
        }
      }
      
      console.log(`🏢 총 ${allItems.length}개 대피소 데이터 수집 완료`);
      
      return this.transformApiResponseToShelters({ body: allItems }, lat, lng);
      
    } catch (error) {
      console.error('❌ 대피소 API 호출 오류:', error);
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
    console.log(`🔍 사용자 위치: ${userLat}, ${userLng}`);
    console.log(`📦 처리할 대피소 데이터: ${items.length}개`);
    
    const nearbyItems = items
      .map((item: any, index: number) => {
        // 위경도 정보 추출 (실제 API 필드명: LAT, LOT)
        const shelterLat = parseFloat(item.LAT || 0);
        const shelterLng = parseFloat(item.LOT || 0);
        
        // 좌표 유효성 검증 - 한국 영토 범위 내
        if (shelterLat === 0 || shelterLng === 0 || 
            shelterLat < 33 || shelterLat > 39 ||   // 한국 위도 범위
            shelterLng < 124 || shelterLng > 132) { // 한국 경도 범위
          if (index < 5) { // 처음 5개만 로그 출력
            console.log(`⚠️ 잘못된 좌표: ${item.SHLT_NM} - LAT: ${item.LAT}, LOT: ${item.LOT}`);
          }
          return null; // 잘못된 좌표는 제외
        }

        const distance = this.calculateDistance(userLat, userLng, shelterLat, shelterLng);
        
        // 대전 광역시/충청남도 대피소 우선 검색
        if ((item.CTPV_NM && (item.CTPV_NM.includes('대전') || item.CTPV_NM.includes('충청남도'))) || (item.ADDR && item.ADDR.includes('대전'))) {
          console.log(`🎯 대전/충청남도 지역 대피소: ${item.SHLT_NM}: ${distance.toFixed(2)}km (${item.ADDR})`);
        } else if (distance <= 30) {
          console.log(`📍 ${item.SHLT_NM}: ${distance.toFixed(2)}km (${item.ADDR})`);
        }
        
        return {
          ...item,
          distance,
          shelterLat,
          shelterLng,
          index
        };
      })
      .filter(item => {
        if (item === null) return false;
        
        // 대전 광역시/충청남도 대피소는 거리 무관하게 포함
        if ((item.CTPV_NM && (item.CTPV_NM.includes('대전') || item.CTPV_NM.includes('충청남도'))) || (item.ADDR && item.ADDR.includes('대전'))) {
          console.log(`✅ 대전/충청남도 지역 대피소 포함: ${item.SHLT_NM} (${item.distance.toFixed(2)}km)`);
          return true;
        }
        
        // 다른 지역은 100km 이내만
        return item.distance <= 100;
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 20); // 최대 20개
      
    console.log(`🎯 총 ${nearbyItems.length}개 대피소 발견됨 (필터링 후)`);
    
    if (nearbyItems.length > 0) {
      console.log(`📊 거리 범위: ${nearbyItems[0]?.distance?.toFixed(2)}km ~ ${nearbyItems[nearbyItems.length-1]?.distance?.toFixed(2)}km`);
    }

    // 결과를 앱 형식으로 변환
    return nearbyItems.map((item) => ({
      id: item.SENU || String(item.index),
      name: item.SHLT_NM || '이름 없음',
      type: this.classifyShelterType(item.SHLT_TYPE),
      address: item.ADDR || '주소 없음',
      lat: item.shelterLat,
      lng: item.shelterLng,
      distance: Math.round(item.distance),
      walkingTime: Math.round(item.distance * 12), // 5km/h 보행속도: 1km당 12분
      capacity: item.ACTC_PSBLTY_TNOP || 0,
      facilities: this.parseFacilities(item)
    }));
  }

  /**
   * 거리 계산 (하버사인 공식)
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
    return R * c; // 거리 (km)
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  /**
   * 대피소 타입 분류
   */
  private classifyShelterType(apiType: string): string {
    if (!apiType) return '지진 대피소';
    
    const lowerType = apiType.toLowerCase();
    if (lowerType.includes('공터') || lowerType.includes('운동장')) {
      return '옥외 대피소';
    } else if (lowerType.includes('건물') || lowerType.includes('체육관') || lowerType.includes('실내')) {
      return '실내 대피소';
    } else {
      return '지진 대피소';
    }
  }

  /**
   * 시설 정보 파싱
   */
  private parseFacilities(item: any): string[] {
    const facilities = [];
    
    if (item.LEN && item.HGT) {
      facilities.push(`- 길이:${item.LEN}m`, `높이:${item.HGT}m`);
    } else {
      facilities.push(`- 길이:nullm`, `높이:nullm`);
    }
    
    return facilities;
  }
}

// 팩토리 함수
export function createShelterService(): ShelterService | null {
  const apiKey = process.env.DISASTER_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ DISASTER_API_KEY 환경변수가 설정되지 않았습니다');
    return null;
  }

  const config: DisasterApiConfig = {
    apiKey,
    baseUrl: 'https://www.safetydata.go.kr',
    endpoints: {
      shelters: '/V2/api/DSSP-IF-00706'
    }
  };

  return new ShelterService(config);
}
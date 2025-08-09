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
    shelters: string; // 통합대피소 API
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
      console.log(`🔍 통합대피소 API로 대전 지역 검색 시작 - 사용자 위치: ${lat}, ${lng}`);
      
      // 통합대피소 API에서 대전 지역 대피소 검색
      const allItems: any[] = [];
      const maxPages = 750; // 72,749개 중에서 대전 지역 찾기
      
      for (let pageNo = 1; pageNo <= maxPages; pageNo++) {
        try {
          const url = new URL(this.config.endpoints.shelters, this.config.baseUrl);
          
          // 통합대피소 API 파라미터
          url.searchParams.set('serviceKey', this.config.apiKey);
          url.searchParams.set('pageNo', pageNo.toString());
          url.searchParams.set('numOfRows', '100'); // 페이지당 100개
          url.searchParams.set('returnType', 'json');
          
          // 전국 모든 대피소 유형 검색 (대전 지역 찾기)
          
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
          console.log(`📊 페이지 ${pageNo} 응답:`, JSON.stringify(data).substring(0, 200));
          
          const items = data?.body || [];
          
          if (!Array.isArray(items) || items.length === 0) {
            console.log(`페이지 ${pageNo}: 데이터 없음 - 응답 구조:`, Object.keys(data || {}));
            if (pageNo === 1) {
              console.log(`🔍 첫 페이지 실패: API 키 또는 요청 형식 확인 필요`);
            }
            break;
          }
          
          console.log(`페이지 ${pageNo}: ${items.length}개 대피소 수집`);
          
          // 대전 관련 대피소 검색 - 통합대피소 API 필드명 사용
          const daejeonShelters = items.filter((item: any) => 
            (item.RONA_DADDR && item.RONA_DADDR.includes('대전'))
          );
          
          if (daejeonShelters.length > 0) {
            console.log(`🏆 페이지 ${pageNo}에서 대전 관련 대피소 ${daejeonShelters.length}개 발견!`);
            daejeonShelters.forEach((shelter: any) => {
              console.log(`  ★ ${shelter.REARE_NM} (${shelter.RONA_DADDR}) - 구분: ${shelter.SHLT_SE_NM}`);
            });
          }
          
          // 충청 지역 대피소도 별도 체크
          const chungcheongShelters = items.filter((item: any) => 
            (item.CTPV_NM && (item.CTPV_NM.includes('충청남도') || item.CTPV_NM.includes('충청북도')))
          );
          
          if (chungcheongShelters.length > 0) {
            console.log(`🎯 페이지 ${pageNo}에서 충청 지역 대피소 ${chungcheongShelters.length}개 발견`);
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
        // 통합대피소 API 필드명 사용 (LAT, LOT)
        const shelterLat = parseFloat(item.LAT || 0);
        const shelterLng = parseFloat(item.LOT || 0);
        
        // 좌표 유효성 검증 - 한국 영토 범위 내
        if (shelterLat === 0 || shelterLng === 0 || 
            shelterLat < 33 || shelterLat > 39 ||   // 한국 위도 범위
            shelterLng < 124 || shelterLng > 132) { // 한국 경도 범위
          if (index < 5) { // 처음 5개만 로그 출력
            console.log(`⚠️ 잘못된 좌표: ${item.REARE_NM} - LAT: ${item.LAT}, LOT: ${item.LOT}`);
          }
          return null; // 잘못된 좌표는 제외
        }

        const distance = this.calculateDistance(userLat, userLng, shelterLat, shelterLng);
        
        // 대전 지역 대피소 로그 - 통합대피소 API 필드명 사용
        if (item.RONA_DADDR && item.RONA_DADDR.includes('대전')) {
          console.log(`🏆 대전 지역 대피소: ${item.REARE_NM}: ${distance.toFixed(2)}km (${item.RONA_DADDR}) - 구분: ${item.SHLT_SE_NM}`);
        } else if (distance <= 30) {
          console.log(`📍 ${item.REARE_NM}: ${distance.toFixed(2)}km (${item.RONA_DADDR})`);
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
        
        // 대전 지역 대피소는 거리 무관하게 포함 - 통합대피소 API 필드명
        if (item.RONA_DADDR && item.RONA_DADDR.includes('대전')) {
          console.log(`✅ 대전 지역 대피소 포함: ${item.REARE_NM} (${item.distance.toFixed(2)}km)`);
          return true;
        }
        
        // 다른 지역은 30km 이내만
        return item.distance <= 30;
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 20); // 최대 20개
      
    console.log(`🎯 총 ${nearbyItems.length}개 대피소 발견됨 (필터링 후)`);
    
    if (nearbyItems.length > 0) {
      console.log(`📊 거리 범위: ${nearbyItems[0]?.distance?.toFixed(2)}km ~ ${nearbyItems[nearbyItems.length-1]?.distance?.toFixed(2)}km`);
    }

    // 통합대피소 API 결과를 앱 형식으로 변환
    return nearbyItems.map((item) => ({
      id: item.MNG_SN || String(item.index),
      name: item.REARE_NM || '이름 없음',
      type: item.SHLT_SE_NM || '대피소',
      address: item.RONA_DADDR || '주소 없음',
      lat: item.shelterLat,
      lng: item.shelterLng,
      distance: Math.round(item.distance),
      walkingTime: Math.round(item.distance * 12), // 5km/h 보행속도: 1km당 12분
      capacity: 0, // 통합대피소 API에는 수용인원 정보 없음
      facilities: [`구분코드: ${item.SHLT_SE_CD}`]
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
      shelters: '/V2/api/DSSP-IF-10941' // 통합대피소 API
    }
  };

  return new ShelterService(config);
}
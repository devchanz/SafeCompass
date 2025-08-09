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
      console.log(`🔍 대전 지역 대피소 검색 시작 - 사용자 위치: ${lat}, ${lng}`);
      
      // 여러 페이지를 조회하여 더 많은 대피소 데이터 수집
      const allItems: any[] = [];
      const maxPages = 20; // 최대 20페이지 조회
      
      for (let pageNo = 1; pageNo <= maxPages; pageNo++) {
        const url = new URL(this.config.endpoints.shelters, this.config.baseUrl);
        
        // 행정안전부 지진 대피장소 API 파라미터
        url.searchParams.set('serviceKey', this.config.apiKey);
        url.searchParams.set('pageNo', pageNo.toString());
        url.searchParams.set('numOfRows', '100'); // 페이지당 100개
        url.searchParams.set('dataType', 'JSON');
      
        console.log(`🔍 페이지 ${pageNo} API 호출: ${url.toString()}`);
        
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          console.warn(`페이지 ${pageNo} API 호출 실패: ${response.status} ${response.statusText}`);
          continue;
        }

        const data = await response.json();
        const items = data?.body || [];
        
        if (!Array.isArray(items) || items.length === 0) {
          console.log(`페이지 ${pageNo}: 데이터 없음`);
          break; // 더 이상 데이터가 없으면 중단
        }
        
        console.log(`페이지 ${pageNo}: ${items.length}개 대피소 수집`);
        
        // 대전/충청 지역 대피소 우선 확인
        const daejeonShelters = items.filter((item: any) => 
          item.CTPV_NM && (item.CTPV_NM.includes('충청') || item.CTPV_NM.includes('대전')) ||
          item.ADDR && item.ADDR.includes('대전')
        );
        
        if (daejeonShelters.length > 0) {
          console.log(`🎯 페이지 ${pageNo}에서 대전/충청 지역 대피소 ${daejeonShelters.length}개 발견!`);
          daejeonShelters.forEach((shelter: any) => {
            console.log(`  - ${shelter.SHLT_NM} (${shelter.ADDR})`);
          });
        }
        
        allItems.push(...items);
        
        // 충분한 데이터를 수집했으면 조기 중단
        if (allItems.length >= 5000) {
          console.log(`충분한 데이터 수집됨: ${allItems.length}개`);
          break;
        }
      }
      
      console.log(`🏢 총 ${allItems.length}개 대피소 데이터 수집 완료`);
      
      return this.transformApiResponseToShelters({ body: allItems }, lat, lng);
      
    } catch (error) {
      console.error('❌ 대피소 API 호출 오류:', error);
      throw new Error(`대피소 데이터 조회 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }
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
        
        // 대전 지역 (충청남도) 대피소 우선 검색
        if (item.CTPV_NM && item.CTPV_NM.includes('충청') || item.ADDR && item.ADDR.includes('대전')) {
          console.log(`🎯 대전/충청 지역 대피소: ${item.SHLT_NM}: ${distance.toFixed(2)}km (${item.ADDR})`);
        } else if (distance <= 50) {
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
        
        // 대전/충청 지역 대피소는 거리 무관하게 포함
        if (item.CTPV_NM && (item.CTPV_NM.includes('충청') || item.CTPV_NM.includes('대전'))) {
          console.log(`✅ 충청/대전 지역 대피소 포함: ${item.SHLT_NM} (${item.distance.toFixed(2)}km)`);
          return true;
        }
        
        // 다른 지역은 50km 이내만
        return item.distance <= 50;
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 20); // 최대 20개
      
    console.log(`🎯 총 ${nearbyItems.length}개 대피소 발견됨 (100km 이내)`);
    
    if (nearbyItems.length > 0) {
      console.log(`📊 거리 범위: ${nearbyItems[0]?.distance?.toFixed(2)}km ~ ${nearbyItems[nearbyItems.length-1]?.distance?.toFixed(2)}km`);
    } else {
      console.log('⚠️ 100km 내에 대피소가 없습니다. 검색 범위를 확대합니다.');
      // 범위를 100km로 확대하여 재검색
      const extendedItems = items
        .map((item: any) => {
          const shelterLat = parseFloat(item.LAT || 0);
          const shelterLng = parseFloat(item.LOT || 0);
          
          if (shelterLat === 0 || shelterLng === 0 || 
              shelterLat < 33 || shelterLat > 39 ||
              shelterLng < 124 || shelterLng > 132) {
            return null;
          }

          const distance = this.calculateDistance(userLat, userLng, shelterLat, shelterLng);
          return { ...item, distance, shelterLat, shelterLng };
        })
        .filter(item => item !== null && item.distance <= 100)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10);
        
      console.log(`🔍 확대 검색 결과: ${extendedItems.length}개 대피소 (100km 이내)`);
      nearbyItems.push(...extendedItems);
    }

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
  const apiKey = process.env.DISASTER_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️ DISASTER_API_KEY 환경변수가 설정되지 않았습니다.');
    return null;
  }

  // 실제 재난안전대응데이터 플랫폼 API 설정
  const config: DisasterApiConfig = {
    apiKey: apiKey,
    baseUrl: 'https://www.safetydata.go.kr',
    endpoints: {
      shelters: '/V2/api/DSSP-IF-00706' // 행정안전부_지진_대피장소 API
    }
  };

  console.log('✅ 실제 재난안전 API 서비스 생성됨 (환경변수 사용)');
  return new ShelterService(config);
}
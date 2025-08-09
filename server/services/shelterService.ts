export interface RealShelter {
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

interface ShelterServiceConfig {
  baseUrl: string;
  apiKey: string;
  endpoints: {
    shelters: string;
  };
}

export class ShelterService {
  private config: ShelterServiceConfig;

  constructor() {
    this.config = {
      baseUrl: 'https://www.safetydata.go.kr',
      apiKey: process.env.DISASTER_API_KEY || '',
      endpoints: {
        shelters: '/V2/api/DSSP-IF-10941',
      },
    };
    
    if (!this.config.apiKey) {
      console.warn('⚠️ DISASTER_API_KEY 환경변수가 설정되지 않았습니다');
    }
  }

  /**
   * 사용자 위치 기준 주변 지진 대피소 조회
   */
  async getNearbyRealShelters(lat: number, lng: number, radius: number = 5): Promise<RealShelter[]> {
    try {
      console.log(`🔍 지진 대피소 검색 시작 - 사용자 위치: ${lat}, ${lng}`);
      
      const allItems: any[] = [];
      const earthquakeCodes = ['3', '4']; // 3: 지진옥외대피장소, 4: 지진해일긴급대피장소
      
      for (const shelterCode of earthquakeCodes) {
        console.log(`🔍 구분코드 ${shelterCode} 검색 시작`);
        
        for (let pageNo = 1; pageNo <= 10; pageNo++) {
          try {
            const url = new URL(this.config.endpoints.shelters, this.config.baseUrl);
            
            url.searchParams.set('serviceKey', this.config.apiKey);
            url.searchParams.set('pageNo', pageNo.toString());
            url.searchParams.set('numOfRows', '100');
            url.searchParams.set('returnType', 'json');
            url.searchParams.set('shlt_se_cd', shelterCode);
            
            console.log(`🔍 구분코드 ${shelterCode} 페이지 ${pageNo} 요청`);
            
            const response = await fetch(url.toString(), {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
            });

            if (!response.ok) {
              console.warn(`페이지 ${pageNo} 실패: ${response.status}`);
              continue;
            }

            const data = await response.json();
            const items = data?.body || [];
            
            if (!Array.isArray(items) || items.length === 0) {
              console.log(`구분코드 ${shelterCode} 페이지 ${pageNo}: 데이터 없음`);
              break;
            }
            
            console.log(`구분코드 ${shelterCode} 페이지 ${pageNo}: ${items.length}개 수집`);
            
            // 대전 지역 대피소 확인
            const daejeonItems = items.filter(item => 
              item.RONA_DADDR && item.RONA_DADDR.includes('대전')
            );
            
            if (daejeonItems.length > 0) {
              console.log(`🏆 구분코드 ${shelterCode}에서 대전 지진 대피소 ${daejeonItems.length}개 발견!`);
              daejeonItems.forEach(shelter => {
                console.log(`  ★ ${shelter.REARE_NM}: ${shelter.SHLT_SE_NM}`);
              });
            }
            
            allItems.push(...items);
            
            if (allItems.length >= 1000) {
              console.log(`충분한 데이터 수집: ${allItems.length}개`);
              break;
            }
            
          } catch (pageError) {
            console.warn(`페이지 처리 오류:`, pageError);
            continue;
          }
        }
      }
      
      console.log(`🏢 총 ${allItems.length}개 데이터 수집 완료`);
      return this.transformToShelters(allItems, lat, lng);
      
    } catch (error) {
      console.error('❌ 대피소 조회 오류:', error);
      throw new Error(`대피소 데이터 조회 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  private transformToShelters(items: any[], userLat: number, userLng: number): RealShelter[] {
    console.log(`🔄 ${items.length}개 대피소 데이터 변환 시작`);
    
    const nearbyItems = items
      .map((item: any) => {
        const shelterLat = parseFloat(item.LAT || 0);
        const shelterLng = parseFloat(item.LOT || 0);
        
        if (shelterLat === 0 || shelterLng === 0) {
          return null;
        }
        
        const distance = this.calculateDistance(userLat, userLng, shelterLat, shelterLng);
        
        return {
          ...item,
          distance,
          lat: shelterLat,
          lng: shelterLng,
        };
      })
      .filter(item => item !== null && item.distance <= 100) // 100km 반경
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 20);

    const shelters: RealShelter[] = nearbyItems.map((item: any) => {
      const walkingTime = Math.ceil((item.distance / 5) * 60); // 5km/h 보행속도
      
      // 대피소 유형 분류
      let type = '기타대피소';
      if (item.SHLT_SE_CD === '3') type = '지진옥외대피장소';
      else if (item.SHLT_SE_CD === '4') type = '지진해일긴급대피장소';
      else if (item.SHLT_SE_NM) type = item.SHLT_SE_NM;
      
      return {
        id: item.SN || `shelter-${Math.random().toString(36).substr(2, 9)}`,
        name: item.REARE_NM || '이름 없음',
        type: type,
        address: item.RONA_DADDR || '주소 없음',
        lat: item.lat,
        lng: item.lng,
        distance: Math.round(item.distance),
        walkingTime: walkingTime,
        capacity: parseInt(item.ACMD_POSBL_NMPR || '0'),
        facilities: [`구분코드: ${item.SHLT_SE_CD}`],
      };
    });

    console.log(`✅ ${shelters.length}개 대피소 변환 완료`);
    return shelters;
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
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
/**
 * 행정안전부 긴급재난문자 API 연동 서비스
 * 공공데이터포털 API 기반 실시간 재난 정보 수집
 */

interface DisasterMessage {
  md101_sn: string;           // 일련번호
  create_date: string;        // 발령시각
  disaster_name: string;      // 재난유형
  location_id: string;        // 지역코드
  location_name: string;      // 발령지역
  msg: string;               // 재난문자내용
}

interface DisasterAPIResponse {
  DisasterMsg4: [
    {
      head: [
        {
          list_total_count: number;
          RESULT: {
            resultCode: string;
            resultMsg: string;
          };
        }
      ];
    },
    {
      row: DisasterMessage[];
    }
  ];
}

export class DisasterMessageAPI {
  private serviceKey: string;
  private baseUrl = 'http://apis.data.go.kr/1741000/DisasterMsg4/getDisasterMsg1List';
  private lastCheckedTime: Date | null = null;
  private cachedMessages: DisasterMessage[] = [];

  constructor() {
    this.serviceKey = process.env.EMERGENCY_MSG_API_KEY || '';
    if (!this.serviceKey) {
      console.warn('⚠️ EMERGENCY_MSG_API_KEY가 설정되지 않았습니다. 시뮬레이션 모드로 동작합니다.');
    } else {
      console.log('✅ EMERGENCY_MSG_API_KEY 확인 완료 - 실제 긴급재난문자 API 연동 활성화');
    }
  }

  /**
   * 실시간 긴급재난문자 조회
   */
  async getRecentMessages(pageNo: number = 1, numOfRows: number = 20): Promise<DisasterMessage[]> {
    if (!this.serviceKey) {
      console.log('🔄 시뮬레이션 모드: API 키가 없어 더미 데이터를 반환합니다.');
      return this.getSimulatedMessages();
    }

    try {
      const params = new URLSearchParams({
        ServiceKey: this.serviceKey,
        pageNo: pageNo.toString(),
        numOfRows: numOfRows.toString(),
        type: 'json'
      });

      console.log(`🌐 긴급재난문자 API 호출: ${this.baseUrl}?${params.toString()}`);

      const response = await fetch(`${this.baseUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SafeCompass-DisasterApp/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: DisasterAPIResponse = await response.json();
      
      // API 응답 검증
      if (!data.DisasterMsg4 || !data.DisasterMsg4[1] || !data.DisasterMsg4[1].row) {
        console.warn('⚠️ API 응답 형식이 예상과 다릅니다:', data);
        return [];
      }

      const messages = data.DisasterMsg4[1].row;
      console.log(`✅ 긴급재난문자 ${messages.length}건 수신`);
      
      this.cachedMessages = messages;
      this.lastCheckedTime = new Date();
      
      return messages;

    } catch (error) {
      console.error('❌ 긴급재난문자 API 호출 실패:', error);
      console.log('🔄 캐시된 데이터 또는 시뮬레이션 데이터를 반환합니다.');
      return this.cachedMessages.length > 0 ? this.cachedMessages : this.getSimulatedMessages();
    }
  }

  /**
   * 특정 지역의 재난문자 필터링
   */
  async getMessagesByLocation(locationName: string): Promise<DisasterMessage[]> {
    const allMessages = await this.getRecentMessages(1, 50);
    
    return allMessages.filter(message => 
      message.location_name.includes(locationName) ||
      locationName.includes(message.location_name.replace('특별시', '').replace('광역시', '').trim())
    );
  }

  /**
   * 지진 관련 재난문자만 필터링
   */
  async getEarthquakeMessages(): Promise<DisasterMessage[]> {
    const allMessages = await this.getRecentMessages(1, 100);
    
    return allMessages.filter(message => 
      message.disaster_name.includes('지진') ||
      message.msg.includes('지진') ||
      message.msg.includes('진동') ||
      message.msg.includes('흔들림')
    );
  }

  /**
   * 최근 활성 재난 상황 확인
   */
  async hasActiveDisaster(): Promise<{ active: boolean; latestMessage?: DisasterMessage }> {
    const recentMessages = await this.getRecentMessages(1, 10);
    
    if (recentMessages.length === 0) {
      return { active: false };
    }

    // 최근 1시간 이내 메시지 확인
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const latestMessage = recentMessages[0];
    const messageTime = new Date(latestMessage.create_date);

    if (messageTime > oneHourAgo) {
      console.log('🚨 활성 재난 상황 감지:', latestMessage.disaster_name, latestMessage.location_name);
      return { active: true, latestMessage };
    }

    return { active: false };
  }

  /**
   * API 키가 없을 때 시뮬레이션 데이터 생성
   */
  private getSimulatedMessages(): DisasterMessage[] {
    const now = new Date();
    const messages: DisasterMessage[] = [
      {
        md101_sn: `sim_${Date.now()}`,
        create_date: now.toISOString().replace('T', ' ').substring(0, 19),
        disaster_name: '지진',
        location_id: '4817000000',
        location_name: '대전광역시',
        msg: '[지진발생] 대전광역시 일대에 규모 4.2 지진이 발생했습니다. 추가 여진에 주의하시고 안전한 곳으로 대피하시기 바랍니다.'
      }
    ];

    console.log('🔄 시뮬레이션 재난문자 생성:', messages[0].disaster_name);
    return messages;
  }

  /**
   * 캐시 상태 및 API 상태 확인
   */
  getStatus() {
    return {
      hasApiKey: !!this.serviceKey,
      lastChecked: this.lastCheckedTime,
      cachedCount: this.cachedMessages.length,
      isSimulationMode: !this.serviceKey
    };
  }
}

// 싱글톤 인스턴스
export const disasterMessageAPI = new DisasterMessageAPI();
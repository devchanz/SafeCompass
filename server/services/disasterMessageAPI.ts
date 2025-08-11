/**
 * 행정안전부 긴급재난문자 API 연동 서비스
 * 공공데이터포털 API 기반 실시간 재난 정보 수집
 */

interface DisasterMessage {
  SN: string;                 // 일련번호
  CRT_DT: string;            // 생성일시
  MSG_CN: string;            // 메시지내용
  RCPTN_RGN_NM: string;      // 수신지역명
  EMRG_STEP_NM: string;      // 긴급단계명 (긴급재난, 안전안내, 위급재난)
  DST_SE_NM: string;         // 재해구분명
  REG_YMD: string;           // 등록일자
  MDFCN_YMD: string;         // 수정일자
}

interface DisasterAPIResponse {
  body: DisasterMessage[];
  header: {
    resultCode: string;
    resultMsg: string;
    totalCount: number;
  };
}

export class DisasterMessageAPI {
  private serviceKey: string;
  private baseUrl = 'https://www.safetydata.go.kr/V2/api/DSSP-IF-00247';
  private lastCheckedTime: Date | null = null;
  private cachedMessages: DisasterMessage[] = [];
  private callCount: number = 0;
  private maxCallsPerHour: number = 100; // 일일 호출량 제한 고려

  constructor() {
    this.serviceKey = process.env.EMERGENCY_MSG_API_KEY || '';
    if (!this.serviceKey) {
      console.warn('⚠️ EMERGENCY_MSG_API_KEY가 설정되지 않았습니다. 시뮬레이션 모드로 동작합니다.');
    } else {
      console.log('✅ EMERGENCY_MSG_API_KEY 확인 완료 - 실제 긴급재난문자 API 연동 활성화');
    }
  }

  /**
   * 실시간 긴급재난문자 조회 - 재난안전데이터공유플랫폼 API
   */
  async getRecentMessages(pageNo: number = 1, numOfRows: number = 20): Promise<DisasterMessage[]> {
    if (!this.serviceKey) {
      console.log('🔄 시뮬레이션 모드: API 키가 없어 더미 데이터를 반환합니다.');
      return this.getSimulatedMessages();
    }

    // 일일 호출량 제한 체크
    if (this.callCount >= this.maxCallsPerHour) {
      console.warn('⚠️ 일일 호출량 제한 도달. 캐시된 데이터를 사용합니다.');
      return this.cachedMessages.length > 0 ? this.cachedMessages : this.getSimulatedMessages();
    }

    try {
      const params = new URLSearchParams({
        serviceKey: this.serviceKey,
        pageNo: pageNo.toString(),
        numOfRows: numOfRows.toString(),
        returnType: 'json'
      });

      console.log(`🌐 재난안전데이터공유플랫폼 API 호출: ${this.baseUrl}?${params.toString()}`);
      this.callCount++;

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
      console.log('📄 API 응답 받음:', { 
        resultCode: data.header?.resultCode,
        totalCount: data.header?.totalCount,
        bodyLength: data.body?.length
      });
      
      // API 응답 검증
      if (!data.body || !Array.isArray(data.body)) {
        console.warn('⚠️ API 응답 형식이 예상과 다릅니다:', data);
        return this.cachedMessages.length > 0 ? this.cachedMessages : this.getSimulatedMessages();
      }

      const messages = data.body;
      console.log(`✅ 긴급재난문자 ${messages.length}건 수신 (API 호출: ${this.callCount}/${this.maxCallsPerHour})`);
      
      this.cachedMessages = messages;
      this.lastCheckedTime = new Date();
      
      return messages;

    } catch (error) {
      console.error('❌ 재난안전데이터공유플랫폼 API 호출 실패:', error);
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
      message.RCPTN_RGN_NM.includes(locationName) ||
      locationName.includes(message.RCPTN_RGN_NM.replace('특별시', '').replace('광역시', '').trim())
    );
  }

  /**
   * 지진 관련 재난문자만 필터링
   */
  async getEarthquakeMessages(): Promise<DisasterMessage[]> {
    const allMessages = await this.getRecentMessages(1, 100);
    
    return allMessages.filter(message => 
      message.DST_SE_NM.includes('지진') ||
      message.MSG_CN.includes('지진') ||
      message.MSG_CN.includes('진동') ||
      message.MSG_CN.includes('흔들림')
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
    const messageTime = new Date(latestMessage.CRT_DT);

    if (messageTime > oneHourAgo) {
      console.log('🚨 활성 재난 상황 감지:', latestMessage.DST_SE_NM, latestMessage.RCPTN_RGN_NM);
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
        SN: `sim_${Date.now()}`,
        CRT_DT: now.toISOString().replace('T', ' ').substring(0, 19),
        MSG_CN: '[지진발생] 대전광역시 일대에 규모 4.2 지진이 발생했습니다. 추가 여진에 주의하시고 안전한 곳으로 대피하시기 바랍니다.',
        RCPTN_RGN_NM: '대전광역시',
        EMRG_STEP_NM: '긴급재난',
        DST_SE_NM: '지진',
        REG_YMD: now.toISOString().split('T')[0],
        MDFCN_YMD: now.toISOString().split('T')[0]
      }
    ];

    console.log('🔄 시뮬레이션 재난문자 생성:', messages[0].DST_SE_NM);
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
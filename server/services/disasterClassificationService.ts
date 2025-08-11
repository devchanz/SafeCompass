import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 재난 종류별 키워드 매핑
const DISASTER_KEYWORDS = {
  earthquake: ['지진', '흔들림', '지반', '진동', '건물붕괴', '땅울림'],
  fire: ['화재', '불', '연기', '화염', '소화', '대피'],
  flood: ['홍수', '침수', '물', '범람', '강수량', '하천'],
  typhoon: ['태풍', '바람', '폭풍', '강풍', '해일'],
  tsunami: ['쓰나미', '해일', '지진해일', '파도', '연안'],
  landslide: ['산사태', '토사', '절개지', '산비탈']
};

// 심각도 키워드
const SEVERITY_KEYWORDS = {
  critical: ['위급', '즉시', '대규모', '심각', '치명적', '최고', '최대'],
  urgent: ['긴급', '신속', '빠른', '중요', '주의'],
  moderate: ['보통', '일반', '경미', '주의보']
};

export interface DisasterAlert {
  type: string;
  severity: 'critical' | 'urgent' | 'moderate';
  classification: '위급재난' | '긴급재난' | '일반재난';
  magnitude?: string;
  location: string;
  description: string;
  isRelevant: boolean;
  confidence: number;
}

export class DisasterClassificationService {
  private disasterAPI: any;

  constructor() {
    // Dynamic import to avoid circular dependencies
    this.initializeDisasterAPI();
  }

  private async initializeDisasterAPI() {
    try {
      const { disasterMessageAPI } = await import('./disasterMessageAPI.js');
      this.disasterAPI = disasterMessageAPI;
    } catch (error) {
      console.error('재난API 초기화 실패:', error);
    }
  }
  
  /**
   * Rule-Based 1차 재난 분류
   */
  private classifyDisasterType(text: string): { type: string; confidence: number } {
    let bestMatch = { type: 'unknown', confidence: 0 };
    
    for (const [disasterType, keywords] of Object.entries(DISASTER_KEYWORDS)) {
      const matches = keywords.filter(keyword => 
        text.toLowerCase().includes(keyword.toLowerCase())
      );
      
      const confidence = matches.length / keywords.length;
      if (confidence > bestMatch.confidence) {
        bestMatch = { type: disasterType, confidence };
      }
    }
    
    return bestMatch;
  }

  /**
   * Rule-Based 심각도 분류
   */
  private classifySeverity(text: string): { severity: string; confidence: number } {
    let bestMatch = { severity: 'moderate', confidence: 0 };
    
    for (const [severityLevel, keywords] of Object.entries(SEVERITY_KEYWORDS)) {
      const matches = keywords.filter(keyword => 
        text.toLowerCase().includes(keyword.toLowerCase())
      );
      
      const confidence = matches.length / keywords.length;
      if (confidence > bestMatch.confidence) {
        bestMatch = { severity: severityLevel, confidence };
      }
    }
    
    return bestMatch;
  }

  /**
   * LLM을 사용한 고급 재난 분석 (현재 비활성화 - API 호출 비용 절약)
   * 
   * 이 메서드는 OpenAI GPT-4를 사용하여 재난 문자를 정교하게 분석하고
   * 위급재난/긴급재난/일반재난으로 분류하는 기능입니다.
   * 
   * 비용 절약을 위해 현재는 Rule-based 분류만 사용하며,
   * 필요시 이 메서드의 주석을 해제하여 LLM 분석 기능을 활성화할 수 있습니다.
   * 
   * 분류 기준:
   * - 위급재난: 즉시 대피 필요 (규모 6.0+ 지진, 대형 화재)
   * - 긴급재난: 신속 대응 필요 (규모 4.5-6.0 지진, 중형 화재)
   * - 일반재난: 주의 및 경계 필요 (규모 4.5 미만 지진, 소형 화재)
   */
  private async analyzeSeverityWithLLM(
    disasterText: string, 
    location: string
  ): Promise<{
    classification: '위급재난' | '긴급재난' | '일반재난';
    reasoning: string;
    urgencyScore: number;
  }> {
    // LLM 분석 기능 비활성화 - API 호출 비용 절약
    // Rule-based 분류 시스템만 사용하여 기본값 반환
    
    /* LLM 기반 분석 코드 (비용 절약을 위해 비활성화)
    try {
      const prompt = `
대한민국 재난안전관리 전문가로서 다음 재난 정보를 분석해주세요.

재난 정보: ${disasterText}
발생 지역: ${location}

다음 기준으로 분류해주세요:
1. 위급재난: 즉시 대피가 필요한 생명 위험 상황 (규모 6.0 이상 지진, 대형 화재 등)
2. 긴급재난: 신속한 대응이 필요한 상황 (규모 4.5-6.0 지진, 중형 화재 등)  
3. 일반재난: 주의 및 경계가 필요한 상황 (규모 4.5 미만 지진, 소형 화재 등)

JSON 형식으로 응답해주세요:
{
  "classification": "위급재난" | "긴급재난" | "일반재난",
  "reasoning": "분류 근거",
  "urgencyScore": 1-10 점수
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        classification: result.classification || '일반재난',
        reasoning: result.reasoning || '분류 실패',
        urgencyScore: result.urgencyScore || 5
      };

    } catch (error) {
      console.error('LLM 분석 오류:', error);
      return {
        classification: '일반재난',
        reasoning: 'LLM 분석 실패로 기본 분류 적용',
        urgencyScore: 5
      };
    }
    */

    // Rule-based 기본 분류값 반환 (API 호출 없음)
    const severityAnalysis = this.classifySeverity(disasterText);
    const classification = severityAnalysis.severity === 'critical' ? '위급재난' :
                          severityAnalysis.severity === 'urgent' ? '긴급재난' : '일반재난';
    
    return {
      classification,
      reasoning: 'Rule-based 키워드 분석 결과',
      urgencyScore: severityAnalysis.severity === 'critical' ? 9 :
                   severityAnalysis.severity === 'urgent' ? 6 : 3
    };
  }

  /**
   * 실제 정부 재난안전데이터 API 확인
   */
  async checkRealDisasterAPI(): Promise<DisasterAlert> {
    if (!this.disasterAPI) {
      console.log('🔄 재난API 미초기화 상태 - 시뮬레이션 모드');
      return this.simulateGovernmentAlert();
    }

    try {
      // 실제 긴급재난문자 API 호출
      const activeDisaster = await this.disasterAPI.hasActiveDisaster();
      
      if (activeDisaster.active && activeDisaster.latestMessage) {
        const message = activeDisaster.latestMessage;
        console.log('🚨 실제 재난상황 감지:', message.disaster_name, message.location_name);
        
        // Rule-based 분석만 사용하여 재난문자를 DisasterAlert로 변환
        const typeAnalysis = this.classifyDisasterType(message.msg);
        const severityAnalysis = this.classifySeverity(message.msg);
        // LLM 분석 비활성화 - Rule-based 대체 분류 사용
        const ruleBasedAnalysis = this.getFallbackClassification(typeAnalysis.type, severityAnalysis.severity, message.msg);
        
        return {
          type: typeAnalysis.type,
          severity: severityAnalysis.severity as 'critical' | 'urgent' | 'moderate',
          classification: ruleBasedAnalysis.classification,
          magnitude: this.extractMagnitude(message.msg),
          location: message.location_name,
          description: message.msg,
          isRelevant: true,
          confidence: Math.max(typeAnalysis.confidence, severityAnalysis.confidence)
        };
      } else {
        console.log('📋 현재 활성 재난 없음 - 정상 상태');
        return {
          type: 'none',
          severity: 'moderate',
          classification: '일반재난',
          location: '전국',
          description: '현재 활성화된 재난 상황이 없습니다.',
          isRelevant: false,
          confidence: 1.0
        };
      }
    } catch (error) {
      console.error('❌ 실제 재난API 호출 실패:', error);
      console.log('🔄 시뮬레이션 모드로 fallback');
      return this.simulateGovernmentAlert();
    }
  }

  private extractMagnitude(text: string): string | undefined {
    const magnitudeMatch = text.match(/규모\s*(\d+\.?\d*)/);
    return magnitudeMatch ? magnitudeMatch[1] : undefined;
  }

  /**
   * 사용자 위치와 재난 발생 지역 매칭
   */
  private isLocationRelevant(
    userLocation: string, 
    disasterLocation: string, 
    disasterType: string
  ): boolean {
    // 간단한 지역 매칭 로직 (실제로는 더 정교한 지리 정보 분석 필요)
    const userRegion = userLocation.split(' ')[0]; // '대전', '서울' 등 추출
    const disasterRegion = disasterLocation.split(' ')[0];
    
    // 지진과 같은 광역 재난은 더 넓은 범위에서 관련성 확인
    if (disasterType === 'earthquake') {
      return userRegion === disasterRegion || 
             disasterLocation.includes(userRegion) ||
             userLocation.includes(disasterRegion);
    }
    
    // 화재 등 국지적 재난은 더 정확한 위치 매칭
    return disasterLocation.includes(userRegion) || userLocation.includes(disasterRegion);
  }

  /**
   * 종합 재난 분류 시스템 (Rule-based 전용 - LLM 분석 비활성화)
   */
  async classifyDisaster(
    disasterText: string, 
    location: string, 
    userLocation: string = ''
  ): Promise<DisasterAlert> {
    console.log('🔍 재난 분류 시작:', { disasterText, location, userLocation });

    // 1단계: Rule-Based 기본 분류
    const typeResult = this.classifyDisasterType(disasterText);
    const severityResult = this.classifySeverity(disasterText);

    // 2단계: Rule-based 고급 분류 (LLM 분석 비활성화 - API 비용 절약)
    const ruleBasedAnalysis = this.getFallbackClassification(typeResult.type, severityResult.severity, disasterText);

    // 3단계: 위치 관련성 확인
    const isRelevant = userLocation ? 
      this.isLocationRelevant(userLocation, location, typeResult.type) : true;

    // 4단계: 종합 신뢰도 계산 (Rule-based 점수 사용)
    const overallConfidence = (typeResult.confidence + severityResult.confidence + ruleBasedAnalysis.urgencyScore / 10) / 3;

    // 지진 규모 추출 (지진인 경우)
    let magnitude: string | undefined;
    if (typeResult.type === 'earthquake') {
      const magnitudeMatch = disasterText.match(/규모\s*([0-9.]+)/);
      magnitude = magnitudeMatch ? magnitudeMatch[1] : undefined;
    }

    const result: DisasterAlert = {
      type: typeResult.type,
      severity: severityResult.severity as 'critical' | 'urgent' | 'moderate',
      classification: ruleBasedAnalysis.classification,
      magnitude,
      location,
      description: disasterText,
      isRelevant,
      confidence: overallConfidence
    };

    console.log('✅ 재난 분류 완료:', result);
    return result;
  }

  /**
   * LLM 대체 분류 (Rule-Based)
   */
  private getFallbackClassification(
    disasterType: string, 
    severity: string, 
    disasterText: string
  ): {
    classification: '위급재난' | '긴급재난' | '일반재난';
    reasoning: string;
    urgencyScore: number;
  } {
    // 지진 규모 추출
    const magnitudeMatch = disasterText.match(/규모\s*([0-9.]+)/);
    const magnitude = magnitudeMatch ? parseFloat(magnitudeMatch[1]) : 0;

    // 키워드 기반 분류
    const criticalKeywords = ['즉시', '대규모', '심각', '치명적', '위급'];
    const urgentKeywords = ['긴급', '신속', '빠른', '대형'];
    
    const hasCritical = criticalKeywords.some(keyword => disasterText.includes(keyword));
    const hasUrgent = urgentKeywords.some(keyword => disasterText.includes(keyword));

    let classification: '위급재난' | '긴급재난' | '일반재난';
    let urgencyScore: number;

    // 지진의 경우 규모 기반 분류
    if (disasterType === 'earthquake' && magnitude > 0) {
      if (magnitude >= 6.0) {
        classification = '위급재난';
        urgencyScore = 9;
      } else if (magnitude >= 4.5) {
        classification = '긴급재난';
        urgencyScore = 7;
      } else {
        classification = '일반재난';
        urgencyScore = 4;
      }
    }
    // 화재 및 기타 재난의 경우 키워드 기반
    else if (severity === 'critical' || hasCritical) {
      classification = '위급재난';
      urgencyScore = 8;
    } else if (severity === 'urgent' || hasUrgent) {
      classification = '긴급재난';
      urgencyScore = 6;
    } else {
      classification = '일반재난';
      urgencyScore = 3;
    }

    return {
      classification,
      reasoning: `Rule-based 분류: ${disasterType}, 심각도: ${severity}, 점수: ${urgencyScore}`,
      urgencyScore
    };
  }

  /**
   * 실제 정부 긴급재난문자 API 호출
   */
  async checkRealGovernmentAlert(): Promise<DisasterAlert | null> {
    try {
      const serviceKey = process.env.EMERGENCY_MSG_API_KEY;
      if (!serviceKey) {
        console.log('⚠️ EMERGENCY_MSG_API_KEY가 설정되지 않음 - 시뮬레이션 모드');
        return null;
      }

      console.log('📡 실제 정부 재난문자 API 호출 중...');
      
      const fetch = (await import('node-fetch')).default as any;
      const apiUrl = 'https://www.safetydata.go.kr/V2/api/DSSP-IF-00247';
      const params = new URLSearchParams({
        serviceKey: serviceKey,
        returnType: 'json',
        pageNo: '1',
        numOfRows: '10'
      });

      const response = await fetch(`${apiUrl}?${params}`);
      
      if (!response.ok) {
        console.log('❌ API 호출 실패:', response.status);
        return null;
      }

      const data = await response.json() as any;
      
      if (data.header?.resultCode !== '00' || !data.body?.length) {
        console.log('❌ API 응답 오류 또는 데이터 없음');
        return null;
      }

      console.log(`📨 총 ${data.totalCount}개의 재난문자 중 최신 ${data.body.length}개 확인`);

      // 위험한 재난만 필터링
      for (const msg of data.body) {
        const disasterType = this.mapDisasterType(msg.DST_SE_NM);
        const severity = this.analyzeSeverityFromMessage(msg.MSG_CN);
        const classification = this.classifyFromMessage(msg.MSG_CN);
        
        if (classification === '긴급재난' || classification === '위급재난') {
          console.log(`🚨 실제 ${msg.DST_SE_NM} 재난 발견:`, msg.MSG_CN.substring(0, 50));
          
          return {
            type: disasterType,
            severity: severity,
            classification: classification,
            location: msg.RCPTN_RGN_NM.trim(),
            description: msg.MSG_CN,
            isRelevant: true,
            confidence: 0.95
          };
        }
      }

      console.log('📄 현재 위급/긴급 재난 없음');
      return null;

    } catch (error) {
      console.error('❌ 실제 API 호출 오류:', error);
      return null;
    }
  }

  private mapDisasterType(koreanType: string): string {
    const typeMap: Record<string, string> = {
      '지진': 'earthquake',
      '화재': 'fire', 
      '홍수': 'flood',
      '호우': 'flood',
      '태풍': 'typhoon',
      '쓰나미': 'tsunami',
      '산사태': 'landslide'
    };
    return typeMap[koreanType] || 'unknown';
  }

  private analyzeSeverityFromMessage(message: string): 'critical' | 'urgent' | 'moderate' {
    if (message.includes('위급') || message.includes('즉시') || message.includes('대피')) {
      return 'critical';
    } else if (message.includes('경보') || message.includes('긴급') || message.includes('주의보')) {
      return 'urgent';
    }
    return 'moderate';
  }

  private classifyFromMessage(message: string): '위급재난' | '긴급재난' | '일반재난' {
    if (message.includes('위급') || message.includes('즉시 대피') || message.includes('대규모')) {
      return '위급재난';
    } else if (message.includes('경보') || message.includes('긴급') || message.includes('주의보')) {
      return '긴급재난';
    }
    return '일반재난';
  }

  /**
   * 정부 재난 문자 시뮬레이션
   */
  async simulateGovernmentAlert(): Promise<DisasterAlert> {
    // 실제로는 정부 API에서 받아올 데이터
    const mockAlerts = [
      {
        text: '대전광역시 유성구에서 규모 5.8 지진이 발생했습니다. 즉시 안전한 곳으로 대피하시기 바랍니다.',
        location: '대전광역시 유성구'
      },
      {
        text: '대전광역시 서구에서 규모 6.2 지진이 발생했습니다. 위급상황입니다. 즉시 대피하세요.',
        location: '대전광역시 서구'
      },
      {
        text: '대전광역시 중구에서 대형 화재가 발생했습니다. 긴급히 대피하시기 바랍니다.',
        location: '대전광역시 중구'
      }
    ];

    const randomAlert = mockAlerts[Math.floor(Math.random() * mockAlerts.length)];
    return await this.classifyDisaster(randomAlert.text, randomAlert.location, '대전 유성구');
  }
}
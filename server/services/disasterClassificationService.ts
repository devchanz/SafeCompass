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
   * LLM을 사용한 고급 재난 분석
   */
  private async analyzeSeverityWithLLM(
    disasterText: string, 
    location: string
  ): Promise<{
    classification: '위급재난' | '긴급재난' | '일반재난';
    reasoning: string;
    urgencyScore: number;
  }> {
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
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
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
   * 종합 재난 분류 시스템
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

    // 2단계: LLM을 통한 고급 분석 (API 할당량 문제로 Rule-Based로 대체)
    const llmAnalysis = this.getFallbackClassification(typeResult.type, severityResult.severity, disasterText);

    // 3단계: 위치 관련성 확인
    const isRelevant = userLocation ? 
      this.isLocationRelevant(userLocation, location, typeResult.type) : true;

    // 4단계: 종합 신뢰도 계산
    const overallConfidence = (typeResult.confidence + severityResult.confidence + llmAnalysis.urgencyScore / 10) / 3;

    // 지진 규모 추출 (지진인 경우)
    let magnitude: string | undefined;
    if (typeResult.type === 'earthquake') {
      const magnitudeMatch = disasterText.match(/규모\s*([0-9.]+)/);
      magnitude = magnitudeMatch ? magnitudeMatch[1] : undefined;
    }

    const result: DisasterAlert = {
      type: typeResult.type,
      severity: severityResult.severity as 'critical' | 'urgent' | 'moderate',
      classification: llmAnalysis.classification,
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
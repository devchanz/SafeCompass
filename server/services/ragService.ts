import { generatePersonalizedGuide, type PersonalizedGuideRequest } from './openai.js';
import manuals from '../data/manuals.json' with { type: 'json' };

interface DisasterManual {
  id: string;
  type: string;
  situation: string;
  content: string;
  keywords: string[];
}

export class RAGService {
  private manuals: DisasterManual[] = manuals;
  private fallbackService: any;

  // Enhanced retrieval with reliability scoring and context matching
  private retrieveRelevantManuals(
    disasterType: string,
    locationContext: string,
    mobility: string,
    accessibility: string[]
  ): string[] {
    const searchTerms = [
      disasterType,
      locationContext,
      mobility,
      ...accessibility
    ].map(term => term.toLowerCase());

    console.log(`🔍 RAG 검색: ${disasterType}, ${locationContext}, ${mobility}, ${accessibility.join(',')}`);

    const relevantManuals = this.manuals
      .filter(manual => {
        // 재난 유형 반드시 일치
        if (!manual.type.toLowerCase().includes(disasterType.toLowerCase())) {
          return false;
        }
        
        const manualText = (manual.content + ' ' + manual.keywords.join(' ')).toLowerCase();
        return searchTerms.some(term => manualText.includes(term));
      })
      .sort((a, b) => {
        // 향상된 스코어링 시스템
        const scoreA = this.calculateRelevanceScore(a, searchTerms, accessibility);
        const scoreB = this.calculateRelevanceScore(b, searchTerms, accessibility);
        return scoreB - scoreA;
      })
      .slice(0, 4) // 더 많은 관련 매뉴얼 포함
      .map(manual => {
        console.log(`✅ 선택된 매뉴얼: ${manual.id} (출처: ${(manual as any).source || '내부'})`);
        return `[신뢰도: ${(manual as any).reliability || 'verified'}] [출처: ${(manual as any).source || '내부 매뉴얼'}]\n${manual.content}`;
      });

    console.log(`📚 총 ${relevantManuals.length}개 신뢰성 높은 매뉴얼 검색됨`);
    return relevantManuals;
  }

  private calculateRelevanceScore(manual: any, searchTerms: string[], accessibility: string[]): number {
    let score = 0;
    const content = (manual.content + ' ' + manual.keywords.join(' ')).toLowerCase();
    
    // 기본 키워드 매칭
    searchTerms.forEach(term => {
      if (content.includes(term)) score += 1;
    });
    
    // 접근성 특화 매뉴얼 우선순위 (시각/청각/이동 장애)
    accessibility.forEach(disability => {
      if (content.includes(disability.toLowerCase()) || 
          manual.keywords.some((k: string) => k.toLowerCase().includes(disability.toLowerCase()))) {
        score += 3; // 높은 가중치
      }
    });
    
    // 신뢰도 가중치
    if ((manual as any).reliability === 'official') score += 2;
    if ((manual as any).reliability === 'verified') score += 1;
    
    return score;
  }

  constructor() {
    // Import fallback service dynamically to avoid circular dependencies
    this.initializeFallbackService();
  }

  private async initializeFallbackService() {
    try {
      const { FallbackGuideService } = await import('./fallbackGuideService.js');
      this.fallbackService = new FallbackGuideService();
    } catch (error) {
      console.error('Failed to load fallback service:', error);
    }
  }

  async generatePersonalizedGuide(request: PersonalizedGuideRequest) {
    try {
      // Retrieve relevant manuals based on context
      const relevantManuals = this.retrieveRelevantManuals(
        "earthquake", // 현재는 지진으로 고정
        request.situation.locationContext,
        request.userProfile.mobility,
        request.userProfile.accessibility
      );

      // Add retrieved manuals to the request
      const enhancedRequest = {
        ...request,
        relevantManuals
      };

      // Try OpenAI first
      return await generatePersonalizedGuide(enhancedRequest);
      
    } catch (openaiError) {
      console.log('OpenAI API unavailable, using fallback guide generation:', (openaiError as Error).message);
      
      // Use fallback service when OpenAI is not available
      if (this.fallbackService) {
        return this.fallbackService.generatePersonalizedGuide(request);
      } else {
        // Initialize fallback service if not already done
        await this.initializeFallbackService();
        if (this.fallbackService) {
          return this.fallbackService.generatePersonalizedGuide(request);
        }
      }
      
      // Final fallback - basic emergency guide
      return this.generateBasicEmergencyGuide(request);
    }
  }

  private generateBasicEmergencyGuide(request: PersonalizedGuideRequest): string {
    const language = request.userProfile.language === 'english' ? 'english' : 'korean';
    
    if (language === 'korean') {
      return `# 긴급 지진 대응 가이드
      
현재 상황: ${request.situation.locationContext}
대피 능력: ${request.userProfile.mobility === 'independent' ? '자력대피 가능' : 
  request.userProfile.mobility === 'assisted' ? '부분 도움 필요' : '자력대피 불가능'}

## 즉시 행동사항
1. 머리와 목 보호하기 - 책상이나 튼튼한 가구 아래로 피하세요
2. 흔들림이 멈출 때까지 기다리기
3. 안전한 경로로 대피하기 (계단 이용, 엘리베이터 금지)

## 긴급연락처
- 119: 소방서 (화재, 구조)
- 112: 경찰서 (신고, 도움)
- 1588-3650: 재난신고센터`;
    } else {
      return `# Emergency Earthquake Response Guide
      
Current Situation: ${request.situation.locationContext}
Evacuation Ability: ${request.userProfile.mobility === 'independent' ? 'Can self-evacuate' : 
  request.userProfile.mobility === 'assisted' ? 'Needs partial assistance' : 'Cannot self-evacuate'}

## Immediate Actions
1. Protect head and neck - Take cover under a desk or sturdy furniture
2. Wait until shaking stops
3. Evacuate via safe route (use stairs, no elevators)

## Emergency Contacts
- 119: Fire Department
- 112: Police
- 1588-3650: Disaster Report Center`;
    }
  }
}

export const ragService = new RAGService();

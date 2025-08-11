/**
 * RAG (Retrieval-Augmented Generation) 서비스
 * 개인화된 재난 대응 가이드 생성을 위한 지식 검색 및 컨텍스트 생성
 */

import { vectorStoreService, type ManualDocument } from './vectorStore.js';
import { generatePersonalizedGuide, type PersonalizedGuideRequest } from './openai.js';

export class RagService {
  constructor() {
    this.initialize();
  }

  /**
   * RAG 서비스 초기화
   */
  private async initialize(): Promise<void> {
    try {
      await vectorStoreService.initialize();
      console.log('✅ RAG 서비스 초기화 완료');
    } catch (error) {
      console.error('❌ RAG 서비스 초기화 실패:', error);
    }
  }

  /**
   * 사용자 상황과 재난 유형에 따른 관련 매뉴얼 검색
   */
  async searchRelevantManuals(
    disasterType: string,
    userContext: {
      age: number;
      mobility: string;
      location: string;
      accessibility: string[];
    }
  ): Promise<ManualDocument[]> {
    try {
      console.log(`🔍 RAG 검색: ${disasterType}, ${userContext.location}, ${userContext.mobility}, ${userContext.accessibility.join(',')}`);
      
      // 검색 쿼리 구성
      const searchQueries = [
        `${disasterType} ${userContext.location} 대피 행동요령`,
        `${disasterType} ${userContext.mobility === 'independent' ? '일반인' : userContext.mobility === 'assisted' ? '거동불편' : '휠체어'} 대응`,
        ...userContext.accessibility.map(access => `${disasterType} ${access === 'hearing' ? '청각장애' : access === 'visual' ? '시각장애' : access} 대응`),
      ];

      // 모든 쿼리로 검색 수행
      const allResults: ManualDocument[] = [];
      for (const query of searchQueries) {
        const results = await vectorStoreService.searchRelevantDocuments(query, disasterType, 2);
        allResults.push(...results);
      }

      // 중복 제거 및 신뢰도 기준 정렬
      const uniqueResults = new Map<string, ManualDocument>();
      allResults.forEach(doc => {
        const existing = uniqueResults.get(doc.id);
        if (!existing || existing.confidence < doc.confidence) {
          uniqueResults.set(doc.id, doc);
        }
      });

      const relevantManuals = Array.from(uniqueResults.values())
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5); // 상위 5개 매뉴얼

      console.log(`📚 총 ${relevantManuals.length}개 신뢰성 높은 매뉴얼 검색됨`);
      
      // 신뢰도가 너무 낮은 경우 기본 매뉴얼 반환
      if (relevantManuals.length === 0 || relevantManuals[0]?.confidence < 0.3) {
        console.log('⚠️ 관련 매뉴얼을 찾지 못했습니다. 기본 가이드를 사용합니다.');
        return this.getDefaultManuals(disasterType);
      }
      
      return relevantManuals;
      
    } catch (error) {
      console.error('❌ RAG 검색 실패:', error);
      return this.getDefaultManuals(disasterType);
    }
  }

  /**
   * 기본 매뉴얼 반환 (벡터 검색 실패시 대체)
   */
  private getDefaultManuals(disasterType: string): ManualDocument[] {
    const defaultManuals: Record<string, ManualDocument> = {
      earthquake: {
        id: 'earthquake_default',
        title: '지진 발생시 기본 행동요령',
        content: `지진 발생시 기본 행동요령:
1. 실내에서는 튼튼한 책상 밑으로 몸을 피하고 몸을 보호하세요
2. 문이나 비상구를 확보하고 가스와 전기를 차단하세요
3. 엘리베이터 사용하지 말고 계단으로 대피하세요
4. 실외에서는 건물과 전선, 가로등에서 떨어진 안전한 곳으로 대피
5. 자동차 운전중이면 서서히 속도를 줄여 도로 오른쪽에 정차`,
        source: '행정안전부 재난안전 기본 매뉴얼',
        disasterType: 'earthquake',
        category: 'basic',
        confidence: 0.8
      },
      fire: {
        id: 'fire_default',
        title: '화재 발생시 기본 행동요령',
        content: `화재 발생시 행동요령:
1. "불이야"라고 크게 외치고 화재경보기를 누르세요
2. 119에 즉시 신고하세요
3. 연기가 있는 곳에서는 자세를 낮춰 대피하세요
4. 젖은 수건으로 코와 입을 막고 벽을 따라 이동하세요
5. 엘리베이터 절대 사용 금지, 계단으로만 대피하세요`,
        source: '소방청 화재안전 기본 매뉴얼',
        disasterType: 'fire',
        category: 'basic',
        confidence: 0.8
      }
    };

    return defaultManuals[disasterType] ? [defaultManuals[disasterType]] : [];
  }

  /**
   * 검색된 매뉴얼들을 바탕으로 컨텍스트 생성
   */
  generateContext(manuals: ManualDocument[], userContext: any): string {
    if (manuals.length === 0) {
      return "기본적인 안전 수칙을 따라 침착하게 행동하세요.";
    }

    let context = "다음 공식 안전 매뉴얼을 참조하여 답변하세요:\n\n";
    
    manuals.forEach((manual, index) => {
      context += `[매뉴얼 ${index + 1}] ${manual.title}\n`;
      context += `출처: ${manual.source}\n`;
      context += `신뢰도: ${(manual.confidence * 100).toFixed(1)}%\n`;
      context += `내용: ${manual.content}\n\n`;
    });

    context += `사용자 정보를 고려하여 위 매뉴얼 내용을 바탕으로 구체적이고 실행 가능한 가이드를 제공하세요.`;
    
    return context;
  }

  /**
   * PDF 매뉴얼 추가
   */
  async addPDFManual(
    filePath: string,
    metadata: {
      title: string;
      disasterType: string;
      category: string;
      source: string;
    }
  ): Promise<void> {
    try {
      await vectorStoreService.addPDFDocument(filePath, metadata);
      console.log(`✅ PDF 매뉴얼 추가 완료: ${metadata.title}`);
    } catch (error) {
      console.error(`❌ PDF 매뉴얼 추가 실패: ${metadata.title}`, error);
      throw error;
    }
  }

  /**
   * 벡터 저장소 저장
   */
  async saveKnowledgeBase(): Promise<void> {
    try {
      const vectorStoreDir = require('path').join(process.cwd(), 'data', 'vector_store');
      await vectorStoreService.saveVectorStore(vectorStoreDir);
      console.log('💾 지식베이스 저장 완료');
    } catch (error) {
      console.error('❌ 지식베이스 저장 실패:', error);
      throw error;
    }
  }

  /**
   * 개인화된 가이드 생성 (RAG 통합)
   */
  async generatePersonalizedGuide(request: PersonalizedGuideRequest): Promise<string> {
    try {
      // RAG로 관련 매뉴얼 검색
      const relevantManuals = await this.searchRelevantManuals(
        'earthquake', // 현재는 지진으로 고정
        {
          age: request.userProfile.age,
          mobility: request.userProfile.mobility,
          location: request.situation.locationContext,
          accessibility: request.userProfile.accessibility
        }
      );

      // 검색된 매뉴얼들을 컨텍스트로 변환
      const context = this.generateContext(relevantManuals, request.userProfile);

      // OpenAI 요청에 RAG 컨텍스트 추가
      const enhancedRequest = {
        ...request,
        relevantManuals: [context]
      };

      // OpenAI API로 가이드 생성
      const result = await generatePersonalizedGuide(enhancedRequest);
      return typeof result === 'string' ? result : result.guide;

    } catch (error) {
      console.error('❌ RAG 기반 가이드 생성 실패:', error);
      return this.generateBasicEmergencyGuide(request);
    }
  }

  /**
   * 기본 비상 가이드 생성 (RAG 실패시 대체)
   */
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

  /**
   * 현재 지식 베이스 상태 조회
   */
  getKnowledgeBaseStats(): { totalManuals: number; sources: string[]; isInitialized: boolean } {
    const documents = vectorStoreService.getStoredDocuments();
    const sources = Array.from(new Set(documents.map(d => d.source)));
    
    return {
      totalManuals: documents.length,
      sources,
      isInitialized: vectorStoreService.isInitialized()
    };
  }
}

export const ragService = new RagService();

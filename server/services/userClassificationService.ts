import { User } from "../../shared/schema.js";

export interface UserSituation {
  locationContext: string; // '집안', '사무실', '길거리', '지하철'
  canMove: boolean;
  currentLocation?: { lat: number; lng: number };
  additionalInfo?: string;
}

export interface UserClassificationResult {
  riskLevel: 'high' | 'medium' | 'low';
  priorityGroup: 'immediate' | 'urgent' | 'standard';
  specialNeeds: string[];
  guideStyle: {
    language: string;
    fontSize: 'large' | 'normal';
    useVoice: boolean;
    useVibration: boolean;
    simplifiedText: boolean;
  };
  evacuationCapability: 'independent' | 'assisted' | 'rescue_needed';
  classification: string; // 최종 분류 텍스트
}

export class UserClassificationService {

  /**
   * 2차 사용자 분류 - 1차 DB 정보 + 2차 현장 상황 통합 분석
   */
  classifyUser(
    userProfile: User, 
    situation: UserSituation
  ): UserClassificationResult {
    console.log('👤 2차 사용자 분류 시작:', { 
      user: userProfile.name, 
      age: userProfile.age,
      accessibility: userProfile.accessibility,
      mobility: userProfile.mobility,
      situation: situation.locationContext,
      canMove: situation.canMove
    });

    // 위험도 평가
    const riskLevel = this.assessRiskLevel(userProfile, situation);
    
    // 우선순위 그룹 결정
    const priorityGroup = this.determinePriorityGroup(userProfile, situation, riskLevel);
    
    // 특별 지원 필요사항
    const specialNeeds = this.identifySpecialNeeds(userProfile, situation);
    
    // 가이드 스타일 결정
    const guideStyle = this.determineGuideStyle(userProfile);
    
    // 대피 능력 평가
    const evacuationCapability = this.assessEvacuationCapability(userProfile, situation);
    
    // 최종 분류 텍스트 생성
    const classification = this.generateClassificationText(
      userProfile, situation, riskLevel, priorityGroup, specialNeeds
    );

    const result: UserClassificationResult = {
      riskLevel,
      priorityGroup,
      specialNeeds,
      guideStyle,
      evacuationCapability,
      classification
    };

    console.log('✅ 사용자 분류 완료:', result);
    return result;
  }

  /**
   * 위험도 평가 알고리즘
   */
  private assessRiskLevel(user: User, situation: UserSituation): 'high' | 'medium' | 'low' {
    let riskScore = 0;

    // 연령별 위험도
    if (user.age >= 70) riskScore += 3;
    else if (user.age >= 60) riskScore += 2;
    else if (user.age <= 10) riskScore += 3;

    // 접근성 제약별 위험도
    if (user.accessibility.includes('visual')) riskScore += 2;
    if (user.accessibility.includes('hearing')) riskScore += 1;
    if (user.accessibility.includes('cognitive')) riskScore += 2;

    // 이동능력별 위험도
    if (user.mobility === 'unable') riskScore += 3;
    else if (user.mobility === 'assisted') riskScore += 2;

    // 현재 상황별 위험도
    if (!situation.canMove) riskScore += 3;
    if (situation.locationContext === '지하철') riskScore += 2;
    else if (situation.locationContext === '길거리') riskScore += 1;

    // 위험도 분류
    if (riskScore >= 6) return 'high';
    if (riskScore >= 3) return 'medium';
    return 'low';
  }

  /**
   * 우선순위 그룹 결정
   */
  private determinePriorityGroup(
    user: User, 
    situation: UserSituation, 
    riskLevel: 'high' | 'medium' | 'low'
  ): 'immediate' | 'urgent' | 'standard' {
    
    // 즉시 지원 필요 (최우선)
    if (riskLevel === 'high' || 
        !situation.canMove || 
        user.mobility === 'unable' ||
        (user.age >= 70 && user.accessibility.length > 0)) {
      return 'immediate';
    }

    // 신속 지원 필요
    if (riskLevel === 'medium' || 
        user.mobility === 'assisted' ||
        user.age >= 65 ||
        user.accessibility.length > 0) {
      return 'urgent';
    }

    // 표준 지원
    return 'standard';
  }

  /**
   * 특별 지원 필요사항 식별
   */
  private identifySpecialNeeds(user: User, situation: UserSituation): string[] {
    const needs: string[] = [];

    // 접근성 기반 지원
    if (user.accessibility.includes('visual')) {
      needs.push('음성 안내', '촉각 유도', '동행 지원');
    }
    if (user.accessibility.includes('hearing')) {
      needs.push('시각 신호', '진동 알림', '수화 통역');
    }
    if (user.accessibility.includes('cognitive')) {
      needs.push('단순 안내', '반복 설명', '보호자 연락');
    }

    // 이동능력 기반 지원
    if (user.mobility === 'unable') {
      needs.push('구조대 지원', '의료진 대기', '특수 이송');
    } else if (user.mobility === 'assisted') {
      needs.push('보조 기구', '동행 지원', '휴식 공간');
    }

    // 상황별 지원
    if (!situation.canMove) {
      needs.push('현장 구조', '응급 처치');
    }

    // 연령별 지원
    if (user.age >= 70) {
      needs.push('의료 지원', '온도 관리', '지속 모니터링');
    } else if (user.age <= 10) {
      needs.push('보호자 연락', '심리 안정', '특별 돌봄');
    }

    return Array.from(new Set(needs)); // 중복 제거
  }

  /**
   * 가이드 스타일 결정
   */
  private determineGuideStyle(user: User) {
    return {
      language: user.language,
      fontSize: (user.age >= 60 || user.accessibility.includes('visual')) ? 'large' as const : 'normal' as const,
      useVoice: user.accessibility.includes('visual') || user.age >= 65,
      useVibration: user.accessibility.includes('hearing'),
      simplifiedText: user.accessibility.includes('cognitive') || user.age >= 70
    };
  }

  /**
   * 대피 능력 평가
   */
  private assessEvacuationCapability(
    user: User, 
    situation: UserSituation
  ): 'independent' | 'assisted' | 'rescue_needed' {
    
    // 구조 필요
    if (!situation.canMove || 
        user.mobility === 'unable' ||
        (user.age >= 80 && user.accessibility.length > 1)) {
      return 'rescue_needed';
    }

    // 도움 필요
    if (user.mobility === 'assisted' ||
        user.age >= 70 ||
        user.accessibility.length > 0) {
      return 'assisted';
    }

    // 자력 대피 가능
    return 'independent';
  }

  /**
   * 최종 분류 텍스트 생성
   */
  private generateClassificationText(
    user: User,
    situation: UserSituation,
    riskLevel: string,
    priorityGroup: string,
    specialNeeds: string[]
  ): string {
    const age = user.age;
    const accessibility = user.accessibility.join(', ') || '없음';
    const mobility = this.getMobilityText(user.mobility);
    const location = situation.locationContext;
    const canMove = situation.canMove ? '가능' : '불가능';

    return `${age}세 ${mobility} 사용자 - 접근성: ${accessibility}, 현재위치: ${location}, 이동: ${canMove}, 위험도: ${riskLevel}, 우선순위: ${priorityGroup}`;
  }

  /**
   * 이동능력 텍스트 변환
   */
  private getMobilityText(mobility: string): string {
    switch (mobility) {
      case 'independent': return '독립적 이동';
      case 'assisted': return '보조 필요';
      case 'unable': return '이동 불가';
      default: return mobility;
    }
  }
}
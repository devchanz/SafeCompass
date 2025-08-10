import { DisasterClassificationService, DisasterAlert } from './disasterClassificationService.js';

export interface EmergencyNotification {
  id: string;
  type: 'emergency_alert' | 'status_check' | 'all_clear';
  title: string;
  body: string;
  data: {
    disasterType?: string;
    severity?: string;
    classification?: string;
    magnitude?: string;
    location?: string;
    action?: string;
    language?: string;
  };
  vibrationPattern?: number[];
  isActive: boolean;
  timestamp: Date;
}

export class EmergencyNotificationService {
  private disasterService: DisasterClassificationService;
  private activeAlert: EmergencyNotification | null = null;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.disasterService = new DisasterClassificationService();
  }

  /**
   * 재난 모니터링 시작 (실제로는 정부 API 주기적 호출)
   * 현재는 수동 시뮬레이션만 지원 - 자동 모니터링 비활성화
   */
  startMonitoring(): void {
    console.log('🔍 재난 모니터링 시작 (수동 모드)');
    
    // 자동 모니터링 비활성화 - 지진 시뮬레이션 버튼 클릭시에만 동작
    // this.monitoringInterval = setInterval(async () => {
    //   await this.checkForDisasters();
    // }, 30000); // 30초 간격

    // 즉시 실행도 비활성화 - 수동 트리거만 허용
    // this.checkForDisasters();
  }

  /**
   * 재난 모니터링 중지
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('⏹️ 재난 모니터링 중지');
    }
  }

  /**
   * 재난 발생 확인 및 분류
   */
  private async checkForDisasters(): Promise<void> {
    try {
      // 실제로는 정부 재난안전데이터 API 호출
      const disasterAlert = await this.disasterService.simulateGovernmentAlert();
      
      console.log('📡 재난 데이터 수신:', disasterAlert);

      // 위급/긴급 재난만 알림 발송
      if (disasterAlert.classification === '위급재난' || disasterAlert.classification === '긴급재난') {
        await this.sendEmergencyAlert(disasterAlert);
      } else {
        console.log('📝 일반재난으로 분류 - 알림 미발송');
      }

    } catch (error) {
      console.error('❌ 재난 모니터링 오류:', error);
    }
  }

  /**
   * 긴급 알림 발송 (다국어 지원)
   */
  private async sendEmergencyAlert(alert: DisasterAlert, userLanguage: string = 'ko'): Promise<void> {
    const notification: EmergencyNotification = {
      id: `emergency_${Date.now()}`,
      type: 'emergency_alert',
      title: this.getAlertTitle(alert, userLanguage),
      body: this.getAlertBody(alert, userLanguage),
      data: {
        disasterType: alert.type,
        severity: alert.severity,
        classification: alert.classification,
        magnitude: alert.magnitude,
        location: alert.location,
        action: 'open_emergency_page',
        language: userLanguage
      },
      vibrationPattern: this.getVibrationPattern(alert.classification),
      isActive: true,
      timestamp: new Date()
    };

    this.activeAlert = notification;
    
    console.log('🚨 긴급 알림 발송:', notification);
    
    // 브라우저 Push Notification 발송 (실제 구현 시)
    // await this.sendPushNotification(notification);
    
    // 진동 패턴 실행
    // await this.triggerVibration(notification.vibrationPattern);
  }

  /**
   * 재난 상황 종료 알림
   */
  async sendAllClearNotification(): Promise<void> {
    const notification: EmergencyNotification = {
      id: `all_clear_${Date.now()}`,
      type: 'all_clear',
      title: '재난 상황 종료',
      body: '재난 상황이 해제되었습니다. 안전 상태를 확인해주세요.',
      data: {
        action: 'status_check'
      },
      vibrationPattern: [200, 100, 200],
      isActive: false,
      timestamp: new Date()
    };

    this.activeAlert = null;
    console.log('✅ 상황 종료 알림 발송:', notification);
  }

  /**
   * 알림 제목 생성 (다국어 지원)
   */
  private getAlertTitle(alert: DisasterAlert, language: string = 'ko'): string {
    const typeNames: Record<string, Record<string, string>> = {
      earthquake: {
        ko: '지진 발생',
        en: 'Earthquake Alert',
        vi: 'Cảnh báo động đất',
        zh: '地震警报'
      },
      fire: {
        ko: '화재 발생',
        en: 'Fire Alert',
        vi: 'Cảnh báo hỏa hoạn',
        zh: '火灾警报'
      },
      flood: {
        ko: '홍수 발생',
        en: 'Flood Alert',
        vi: 'Cảnh báo lũ lụt',
        zh: '洪水警报'
      },
      typhoon: {
        ko: '태풍 접근',
        en: 'Typhoon Alert',
        vi: 'Cảnh báo bão',
        zh: '台风警报'
      }
    };

    const typeName = typeNames[alert.type]?.[language] || typeNames[alert.type]?.['ko'] || '재난 발생';
    const urgencyMark = alert.classification === '위급재난' ? '🚨' : '⚠️';
    
    return `${urgencyMark} ${typeName}`;
  }

  /**
   * 알림 내용 생성 (다국어 지원)
   */
  private getAlertBody(alert: DisasterAlert, language: string = 'ko'): string {
    const templates: Record<string, Record<string, string>> = {
      earthquake: {
        ko: `규모 ${alert.magnitude} 지진이 발생했습니다. 즉시 안전한 곳으로 대피하세요.`,
        en: `Magnitude ${alert.magnitude} earthquake detected. Seek shelter immediately.`,
        vi: `Phát hiện động đất cường độ ${alert.magnitude}. Hãy tìm nơi trú ẩn ngay lập tức.`,
        zh: `检测到${alert.magnitude}级地震。请立即寻找安全地点。`
      },
      fire: {
        ko: '대형 화재가 발생했습니다. 긴급히 대피하시기 바랍니다.',
        en: 'Major fire detected. Please evacuate immediately.',
        vi: 'Phát hiện hỏa hoạn lớn. Hãy sơ tán ngay lập tức.',
        zh: '检测到大火。请立即疏散。'
      }
    };

    const locationText: Record<string, string> = {
      ko: `${alert.location}에서 `,
      en: `In ${alert.location} - `,
      vi: `Tại ${alert.location} - `,
      zh: `在${alert.location} - `
    };

    const actionText: Record<string, string> = {
      ko: alert.classification === '위급재난' ? '즉시 안전한 곳으로 대피하세요.' : '신속히 대피 준비를 하세요.',
      en: alert.classification === '위급재난' ? 'Evacuate to safety immediately.' : 'Prepare for evacuation quickly.',
      vi: alert.classification === '위급재난' ? 'Sơ tán đến nơi an toàn ngay lập tức.' : 'Chuẩn bị sơ tán nhanh chóng.',
      zh: alert.classification === '위급재난' ? '立即撤离到安全地点。' : '迅速准备撤离。'
    };

    const template = templates[alert.type]?.[language] || templates[alert.type]?.['ko'];
    if (template) {
      return locationText[language] + template;
    }

    return locationText[language] + actionText[language];
  }

  /**
   * 진동 패턴 결정
   */
  private getVibrationPattern(classification: string): number[] {
    switch (classification) {
      case '위급재난':
        // 긴급: 빠르고 강한 패턴
        return [300, 100, 300, 100, 300, 100, 300];
      case '긴급재난':
        // 주의: 중간 패턴
        return [200, 150, 200, 150, 200];
      default:
        // 기본: 부드러운 패턴
        return [100, 100, 100];
    }
  }

  /**
   * 현재 활성 알림 가져오기
   */
  getActiveAlert(): EmergencyNotification | null {
    return this.activeAlert;
  }

  /**
   * 알림 읽음 처리
   */
  markAlertAsRead(): void {
    if (this.activeAlert) {
      console.log('📖 알림 읽음 처리:', this.activeAlert.id);
      // 읽음 처리는 하되 알림은 유지 (재난 상황이 계속되므로)
    }
  }

  /**
   * 사용자가 대응 완료 시 알림 제거
   */
  markEmergencyCompleted(): void {
    if (this.activeAlert) {
      console.log('✅ 재난 대응 완료 - 알림 제거:', this.activeAlert.id);
      this.activeAlert = null;
    }
  }

  /**
   * 수동 재난 상황 시뮬레이션 (데모용)
   */
  async triggerEmergencyDemo(disasterType: 'earthquake' | 'fire' = 'earthquake'): Promise<EmergencyNotification> {
    const mockAlert: DisasterAlert = {
      type: disasterType,
      severity: 'critical',
      classification: '위급재난',
      magnitude: disasterType === 'earthquake' ? '5.8' : undefined,
      location: '대전광역시 유성구',
      description: disasterType === 'earthquake' 
        ? '대전광역시 유성구에서 규모 5.8 지진이 발생했습니다.' 
        : '대전광역시 유성구에서 대형 화재가 발생했습니다.',
      isRelevant: true,
      confidence: 0.95
    };

    await this.sendEmergencyAlert(mockAlert);
    return this.activeAlert!;
  }
}
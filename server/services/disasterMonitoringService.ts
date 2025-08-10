/**
 * 실제 정부 재난 API와 연동되는 재난 모니터링 서비스
 * 실시간으로 긴급재난문자를 감시하고 사용자에게 알림
 */
import { disasterMessageAPI } from './disasterMessageAPI.js';
import { DisasterClassificationService } from './disasterClassificationService.js';

interface DisasterMonitoringConfig {
  checkInterval: number; // 확인 간격 (초)
  enableRealAPI: boolean; // 실제 API 사용 여부
  maxRetries: number;     // 최대 재시도 횟수
}

export class DisasterMonitoringService {
  private config: DisasterMonitoringConfig;
  private disasterClassifier: DisasterClassificationService;
  private isMonitoring: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private retryCount: number = 0;

  constructor(config: Partial<DisasterMonitoringConfig> = {}) {
    this.config = {
      checkInterval: 30, // 30초마다 확인
      enableRealAPI: true,
      maxRetries: 3,
      ...config
    };
    
    this.disasterClassifier = new DisasterClassificationService();
  }

  /**
   * 재난 모니터링 시작
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.log('⚠️ 재난 모니터링이 이미 실행중입니다');
      return;
    }

    console.log('🔍 실시간 재난 모니터링 시작');
    console.log(`⏱️ 확인 간격: ${this.config.checkInterval}초`);
    console.log(`🌐 실제 API 사용: ${this.config.enableRealAPI ? 'ON' : 'OFF'}`);

    this.isMonitoring = true;
    this.retryCount = 0;

    // 즉시 한번 확인
    await this.checkDisasterStatus();

    // 정기적으로 확인
    this.intervalId = setInterval(async () => {
      await this.checkDisasterStatus();
    }, this.config.checkInterval * 1000);
  }

  /**
   * 재난 모니터링 중지
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      console.log('⚠️ 재난 모니터링이 실행되고 있지 않습니다');
      return;
    }

    console.log('⏹️ 재난 모니터링 중지');
    this.isMonitoring = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * 재난 상태 확인
   */
  private async checkDisasterStatus(): Promise<void> {
    try {
      console.log('🔄 재난 상황 확인 중...');

      if (this.config.enableRealAPI) {
        // 실제 정부 재난 API 확인
        const activeDisaster = await disasterMessageAPI.hasActiveDisaster();
        
        if (activeDisaster.active && activeDisaster.latestMessage) {
          const message = activeDisaster.latestMessage;
          console.log('🚨 실제 재난 감지:', {
            disaster: message.disaster_name,
            location: message.location_name,
            time: message.create_date,
            content: message.msg.substring(0, 100) + '...'
          });

          // 재난 분류 및 분석
          const disasterAlert = await this.disasterClassifier.classifyDisaster(
            message.msg,
            message.location_name
          );

          // 푸시 알림 발송 (실제 구현에서는 웹푸시 서비스 연동)
          await this.sendDisasterAlert(disasterAlert, message);
          
          this.retryCount = 0; // 성공시 재시도 카운트 리셋
        } else {
          console.log('✅ 현재 활성 재난 없음');
          this.retryCount = 0;
        }
      } else {
        // 시뮬레이션 모드
        const simulatedAlert = await this.disasterClassifier.simulateGovernmentAlert();
        
        if (simulatedAlert.type !== 'none') {
          console.log('🎭 시뮬레이션 재난:', simulatedAlert);
          await this.sendDisasterAlert(simulatedAlert);
        }
      }

    } catch (error) {
      this.retryCount++;
      console.error(`❌ 재난 상태 확인 실패 (${this.retryCount}/${this.config.maxRetries}):`, error);

      if (this.retryCount >= this.config.maxRetries) {
        console.log('🔄 최대 재시도 횟수 도달 - 시뮬레이션 모드로 전환');
        this.config.enableRealAPI = false;
        this.retryCount = 0;
      }
    }
  }

  /**
   * 재난 알림 발송
   */
  private async sendDisasterAlert(
    disasterAlert: any, 
    originalMessage?: any
  ): Promise<void> {
    try {
      // 웹푸시 알림 데이터 준비
      const alertData = {
        type: 'disaster_alert',
        severity: disasterAlert.severity,
        title: this.getAlertTitle(disasterAlert),
        body: this.getAlertBody(disasterAlert),
        data: {
          disasterType: disasterAlert.type,
          location: disasterAlert.location,
          timestamp: new Date().toISOString(),
          originalMessage: originalMessage || null
        }
      };

      console.log('📢 재난 알림 발송:', alertData.title);
      
      // 실제 구현에서는 웹푸시 서비스로 전송
      // await webPushService.sendToAllUsers(alertData);
      
    } catch (error) {
      console.error('❌ 재난 알림 발송 실패:', error);
    }
  }

  /**
   * 알림 제목 생성
   */
  private getAlertTitle(disasterAlert: any): string {
    const typeMap: Record<string, string> = {
      earthquake: '🚨 지진 경보',
      tsunami: '🌊 쓰나미 경보',
      fire: '🔥 화재 경보',
      flood: '🌊 홍수 경보',
      landslide: '⛰️ 산사태 경보',
      heavyRain: '🌧️ 호우 경보',
      typhoon: '🌀 태풍 경보'
    };

    return typeMap[disasterAlert.type] || '⚠️ 긴급 재난 경보';
  }

  /**
   * 알림 내용 생성
   */
  private getAlertBody(disasterAlert: any): string {
    const location = disasterAlert.location || '지역';
    const description = disasterAlert.description?.substring(0, 100) || '';
    
    return `${location}에 ${disasterAlert.classification} 발생. ${description}`;
  }

  /**
   * 모니터링 상태 조회
   */
  getStatus(): {
    isMonitoring: boolean;
    config: DisasterMonitoringConfig;
    retryCount: number;
    lastCheck: string;
  } {
    return {
      isMonitoring: this.isMonitoring,
      config: this.config,
      retryCount: this.retryCount,
      lastCheck: new Date().toISOString()
    };
  }
}

// 싱글톤 인스턴스 생성
export const disasterMonitoring = new DisasterMonitoringService({
  checkInterval: 30,
  enableRealAPI: !!process.env.DISASTER_API_KEY,
  maxRetries: 3
});
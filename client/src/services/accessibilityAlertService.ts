import { useSpeechService } from "./speechService";
import { useHapticService } from "./hapticService";

export interface AccessibilityAlertConfig {
  type: 'visual' | 'hearing' | 'both';
  severity: 'critical' | 'high' | 'moderate';
  disasterType: string;
  location: string;
  message: string;
  language: string;
}

export class AccessibilityAlertService {
  private static instance: AccessibilityAlertService;
  
  static getInstance(): AccessibilityAlertService {
    if (!AccessibilityAlertService.instance) {
      AccessibilityAlertService.instance = new AccessibilityAlertService();
    }
    return AccessibilityAlertService.instance;
  }

  /**
   * 자동 접근성 알림 실행
   */
  async triggerAutomaticAlert(config: AccessibilityAlertConfig): Promise<void> {
    console.log('🚨 자동 접근성 알림 실행:', config);

    try {
      if (config.type === 'visual' || config.type === 'both') {
        await this.triggerVisualAlert(config);
      }

      if (config.type === 'hearing' || config.type === 'both') {
        await this.triggerHearingAlert(config);
      }
    } catch (error) {
      console.error('❌ 접근성 알림 실행 실패:', error);
    }
  }

  /**
   * 시각 지원 알림 (TTS)
   */
  private async triggerVisualAlert(config: AccessibilityAlertConfig): Promise<void> {
    const message = this.buildTTSMessage(config);
    
    // TTS 음성 안내
    if ('speechSynthesis' in window) {
      // 기존 음성 중단
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = this.getLanguageCode(config.language);
      utterance.rate = this.getTTSRate(config.severity);
      utterance.volume = this.getTTSVolume(config.severity);

      // 중요한 알림은 3번 반복
      const repeatCount = config.severity === 'critical' ? 3 : 1;
      
      for (let i = 0; i < repeatCount; i++) {
        await new Promise<void>((resolve) => {
          utterance.onend = () => resolve();
          utterance.onerror = () => resolve();
          speechSynthesis.speak(utterance);
        });
        
        // 반복 간격
        if (i < repeatCount - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
  }

  /**
   * 청각 지원 알림 (진동 + 시각효과)
   */
  private async triggerHearingAlert(config: AccessibilityAlertConfig): Promise<void> {
    // 진동 패턴 실행
    const vibrationPattern = this.getVibrationPattern(config.severity);
    
    // 진동 지원 여부 확인 및 실행
    if (navigator.vibrate) {
      console.log('📳 진동 패턴 실행:', vibrationPattern);
      const vibrationResult = navigator.vibrate(vibrationPattern);
      console.log('📳 진동 실행 결과:', vibrationResult);
      
      // iOS Safari 대안: 오디오 기반 햅틱 피드백
      this.triggerAudioHaptic(config.severity);
    } else {
      console.log('❌ 진동 미지원 - 대안 피드백 실행');
      // 진동이 지원되지 않는 경우 대안 실행
      this.triggerAlternativeHaptic(config.severity);
    }

    // 시각적 플래시 효과
    await this.triggerVisualFlash(config.severity);
    
    // 모바일 화면 깨우기 (iOS 대응)
    await this.triggerScreenWake();
  }

  /**
   * TTS 메시지 생성
   */
  private buildTTSMessage(config: AccessibilityAlertConfig): string {
    const urgencyText = this.getUrgencyText(config.severity, config.language);
    const disasterText = this.getDisasterText(config.disasterType, config.language);
    const actionText = this.getActionText(config.disasterType, config.language);

    return `${urgencyText} ${disasterText} ${config.location}에서 발생했습니다. ${actionText}`;
  }

  /**
   * 심각도별 진동 패턴
   */
  private getVibrationPattern(severity: string): number[] {
    switch (severity) {
      case 'critical':
        return [500, 200, 500, 200, 500, 200, 500]; // 길게-짧게 4회
      case 'high':
        return [300, 150, 300, 150, 300]; // 길게-짧게 3회
      case 'moderate':
        return [200, 100, 200, 100, 200]; // 중간-짧게 3회
      default:
        return [100, 50, 100];
    }
  }

  /**
   * TTS 속도 조절
   */
  private getTTSRate(severity: string): number {
    switch (severity) {
      case 'critical': return 0.9; // 빠르게
      case 'high': return 0.8; // 보통
      case 'moderate': return 0.7; // 천천히
      default: return 0.8;
    }
  }

  /**
   * TTS 음량 조절
   */
  private getTTSVolume(severity: string): number {
    switch (severity) {
      case 'critical': return 1.0; // 최대
      case 'high': return 0.9; // 높게
      case 'moderate': return 0.8; // 보통
      default: return 0.8;
    }
  }

  /**
   * 시각적 플래시 효과
   */
  private async triggerVisualFlash(severity: string): Promise<void> {
    const flashColor = this.getFlashColor(severity);
    const flashCount = severity === 'critical' ? 6 : severity === 'high' ? 4 : 2;

    for (let i = 0; i < flashCount; i++) {
      // 화면 전체 플래시
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.backgroundColor = flashColor;
      overlay.style.zIndex = '9999';
      overlay.style.pointerEvents = 'none';
      overlay.style.opacity = '0.8';

      document.body.appendChild(overlay);

      // 플래시 지속 시간
      await new Promise(resolve => setTimeout(resolve, 200));
      
      document.body.removeChild(overlay);
      
      // 플래시 간격
      if (i < flashCount - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  /**
   * 심각도별 플래시 색상
   */
  private getFlashColor(severity: string): string {
    switch (severity) {
      case 'critical': return '#FF0000'; // 빨간색
      case 'high': return '#FF6600'; // 주황색
      case 'moderate': return '#FFAA00'; // 노란색
      default: return '#FFAA00';
    }
  }

  /**
   * 언어별 긴급도 텍스트
   */
  private getUrgencyText(severity: string, language: string): string {
    const texts: Record<string, Record<string, string>> = {
      ko: {
        critical: '위급 상황입니다!',
        high: '긴급 상황입니다!',
        moderate: '주의 상황입니다!'
      },
      en: {
        critical: 'Critical emergency!',
        high: 'Emergency alert!',
        moderate: 'Attention alert!'
      },
      vi: {
        critical: 'Tình huống khẩn cấp!',
        high: 'Cảnh báo khẩn cấp!',
        moderate: 'Cảnh báo chú ý!'
      },
      zh: {
        critical: '紧急情况！',
        high: '紧急警报！',
        moderate: '注意警报！'
      }
    };

    return texts[language]?.[severity] || texts.ko[severity];
  }

  /**
   * 재난 유형별 텍스트
   */
  private getDisasterText(disasterType: string, language: string): string {
    const texts: Record<string, Record<string, string>> = {
      ko: {
        earthquake: '지진이',
        tsunami: '쓰나미가',
        fire: '화재가',
        flood: '홍수가',
        landslide: '산사태가',
        heavyRain: '호우가',
        typhoon: '태풍이'
      },
      en: {
        earthquake: 'An earthquake has',
        tsunami: 'A tsunami has',
        fire: 'A fire has',
        flood: 'A flood has',
        landslide: 'A landslide has',
        heavyRain: 'Heavy rain has',
        typhoon: 'A typhoon has'
      },
      vi: {
        earthquake: 'Động đất đã',
        tsunami: 'Sóng thần đã',
        fire: 'Hỏa hoạn đã',
        flood: 'Lũ lụt đã',
        landslide: 'Lở đất đã',
        heavyRain: 'Mưa lớn đã',
        typhoon: 'Bão đã'
      },
      zh: {
        earthquake: '地震已',
        tsunami: '海啸已',
        fire: '火灾已',
        flood: '洪水已',
        landslide: '山体滑坡已',
        heavyRain: '暴雨已',
        typhoon: '台风已'
      }
    };

    return texts[language]?.[disasterType] || texts.ko[disasterType] || '재난이';
  }

  /**
   * 행동 지침 텍스트
   */
  private getActionText(disasterType: string, language: string): string {
    const texts: Record<string, Record<string, string>> = {
      ko: {
        earthquake: '즉시 탁자 아래로 대피하고 머리를 보호하세요.',
        tsunami: '즉시 고지대로 대피하세요.',
        fire: '즉시 안전한 곳으로 대피하세요.',
        flood: '즉시 고지대로 대피하세요.',
        landslide: '즉시 안전한 곳으로 대피하세요.',
        heavyRain: '저지대나 하천 근처를 피하세요.',
        typhoon: '실내에 머물며 창문을 피하세요.'
      },
      en: {
        earthquake: 'Take cover under a table and protect your head immediately.',
        tsunami: 'Evacuate to higher ground immediately.',
        fire: 'Evacuate to a safe location immediately.',
        flood: 'Move to higher ground immediately.',
        landslide: 'Evacuate to a safe location immediately.',
        heavyRain: 'Avoid low-lying areas and waterways.',
        typhoon: 'Stay indoors and away from windows.'
      },
      vi: {
        earthquake: 'Ngay lập tức trú ẩn dưới bàn và bảo vệ đầu.',
        tsunami: 'Sơ tán lên vùng đất cao ngay lập tức.',
        fire: 'Sơ tán đến nơi an toàn ngay lập tức.',
        flood: 'Di chuyển lên vùng đất cao ngay lập tức.',
        landslide: 'Sơ tán đến nơi an toàn ngay lập tức.',
        heavyRain: 'Tránh các khu vực trũng và gần sông.',
        typhoon: 'Ở trong nhà và tránh xa cửa sổ.'
      },
      zh: {
        earthquake: '立即躲到桌子下面保护头部。',
        tsunami: '立即撤离到高地。',
        fire: '立即撤离到安全地点。',
        flood: '立即转移到高地。',
        landslide: '立即撤离到安全地点。',
        heavyRain: '避开低洼地区和河道。',
        typhoon: '待在室内，远离窗户。'
      }
    };

    return texts[language]?.[disasterType] || texts.ko[disasterType] || '안전한 곳으로 대피하세요.';
  }

  /**
   * iOS Safari용 오디오 기반 햅틱 피드백
   */
  private triggerAudioHaptic(severity: string): void {
    try {
      // 무음 오디오로 iOS 햅틱 트리거
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // 극도로 낮은 볼륨으로 설정 (거의 무음)
      gainNode.gain.setValueAtTime(0.001, audioContext.currentTime);
      
      // 짧은 톤 생성
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
      
      console.log('🔊 iOS 오디오 햅틱 실행됨');
    } catch (error) {
      console.log('오디오 햅틱 실행 실패:', error);
    }
  }

  /**
   * 진동 미지원 환경용 대안 피드백
   */
  private triggerAlternativeHaptic(severity: string): void {
    // 강한 시각적 피드백으로 대체
    const flashCount = severity === 'critical' ? 8 : severity === 'high' ? 6 : 4;
    
    // 연속 플래시로 진동 효과 대체
    for (let i = 0; i < flashCount; i++) {
      setTimeout(() => {
        document.body.style.backgroundColor = this.getFlashColor(severity);
        setTimeout(() => {
          document.body.style.backgroundColor = '';
        }, 150);
      }, i * 300);
    }
    
    console.log('⚡ 대안 시각 피드백 실행됨 (진동 대체)');
  }

  /**
   * 모바일 화면 깨우기 (iOS 대응)
   */
  private async triggerScreenWake(): Promise<void> {
    try {
      // Wake Lock API 사용 (지원되는 경우)
      if ('wakeLock' in navigator) {
        const wakeLock = await (navigator as any).wakeLock.request('screen');
        setTimeout(() => {
          wakeLock.release();
        }, 1000);
        console.log('📱 화면 깨우기 실행됨');
      }
    } catch (error) {
      console.log('화면 깨우기 실패:', error);
    }
  }

  /**
   * 언어 코드 변환
   */
  private getLanguageCode(language: string): string {
    const langMap: Record<string, string> = {
      ko: 'ko-KR',
      en: 'en-US',
      vi: 'vi-VN',
      zh: 'zh-CN'
    };

    return langMap[language] || 'ko-KR';
  }
}

// React Hook으로 사용할 수 있도록 export
export function useAccessibilityAlert() {
  const service = AccessibilityAlertService.getInstance();

  return {
    triggerAutomaticAlert: (config: AccessibilityAlertConfig) => service.triggerAutomaticAlert(config)
  };
}
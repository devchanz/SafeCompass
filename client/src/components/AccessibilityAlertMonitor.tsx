import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAccessibilityAlert } from "@/services/accessibilityAlertService";

interface AccessibilityAlertData {
  type: string;
  disasterType: string;
  severity: string;
  location: string;
  message: string;
  timestamp: string;
}

/**
 * 접근성 사용자를 위한 자동 알림 모니터링 컴포넌트
 * 백그라운드에서 서버의 접근성 알림을 주기적으로 확인하고 자동 실행
 */
export default function AccessibilityAlertMonitor() {
  const { data: userProfile } = useUserProfile();
  const { language } = useLanguage();
  const { triggerAutomaticAlert } = useAccessibilityAlert();
  const queryClient = useQueryClient();
  const lastProcessedTimestamp = useRef<string>('');

  // 사용자의 접근성 설정 확인
  const hasVisualSupport = userProfile?.accessibility?.includes('visual') || false;
  const hasHearingSupport = userProfile?.accessibility?.includes('hearing') || false;
  const needsAccessibilitySupport = hasVisualSupport || hasHearingSupport;

  // 접근성 알림 폴링
  const { data: alertResponse } = useQuery<{ success: boolean; alert: AccessibilityAlertData | null }>({
    queryKey: ['/api/accessibility/latest-alert'],
    enabled: needsAccessibilitySupport, // 접근성 지원이 필요한 사용자만 활성화
    refetchInterval: 3000, // 3초마다 확인
    staleTime: 0, // 항상 fresh 체크
  });

  // 새로운 접근성 알림 처리
  useEffect(() => {
    if (!needsAccessibilitySupport || !alertResponse?.alert) {
      return;
    }

    const alert: AccessibilityAlertData = alertResponse.alert;
    
    // 이미 처리한 알림인지 확인
    if (alert.timestamp === lastProcessedTimestamp.current) {
      return;
    }

    console.log('🚨 새로운 접근성 알림 감지:', alert);
    
    // 자동 접근성 알림 실행
    const accessibilityType = hasVisualSupport && hasHearingSupport 
      ? 'both'
      : hasVisualSupport 
      ? 'visual' 
      : 'hearing';

    triggerAutomaticAlert({
      type: accessibilityType,
      severity: alert.severity as 'critical' | 'high' | 'moderate',
      disasterType: alert.disasterType,
      location: alert.location,
      message: alert.message,
      language: language
    });

    // 처리 완료 표시
    lastProcessedTimestamp.current = alert.timestamp;
    
    // 알림 처리 완료 후 서버에서 제거
    setTimeout(() => {
      fetch('/api/accessibility/clear-alert', { method: 'POST' })
        .then(() => {
          console.log('🔇 접근성 알림 처리 완료');
          queryClient.invalidateQueries({ queryKey: ['/api/accessibility/latest-alert'] });
        })
        .catch(error => console.error('접근성 알림 초기화 실패:', error));
    }, 5000); // 5초 후 자동 제거

  }, [alertResponse, needsAccessibilitySupport, hasVisualSupport, hasHearingSupport, language, triggerAutomaticAlert, queryClient]);

  // 디버그 정보 (개발 모드에서만)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && needsAccessibilitySupport) {
      console.log('🔍 접근성 알림 모니터링 활성화:', {
        visual: hasVisualSupport,
        hearing: hasHearingSupport,
        language: language
      });
    }
  }, [needsAccessibilitySupport, hasVisualSupport, hasHearingSupport, language]);

  // 이 컴포넌트는 UI를 렌더링하지 않음 (백그라운드 모니터링)
  return null;
}
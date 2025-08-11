import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
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

  // 사용자 프로필 디버깅
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('👤 사용자 프로필 정보:', {
        userProfile,
        accessibility: userProfile?.accessibility,
        hasVisualSupport,
        hasHearingSupport,
        needsAccessibilitySupport
      });
    }
  }, [userProfile, hasVisualSupport, hasHearingSupport, needsAccessibilitySupport]);

  // 접근성 알림 폴링 - 언어 설정 페이지에서는 비활성화
  const [location] = useLocation();
  const isLanguagePage = location === '/language';

  const { data: alertResponse } = useQuery<{ success: boolean; alert: AccessibilityAlertData | null }>({
    queryKey: ['/api/accessibility/latest-alert'],
    enabled: needsAccessibilitySupport && !isLanguagePage, // 언어 설정 페이지에서는 비활성화
    refetchInterval: 1000, // 1초마다 확인 (빠른 반응을 위해)
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
      console.log('🔄 이미 처리된 접근성 알림:', alert.timestamp);
      return;
    }

    console.log('🚨 새로운 접근성 알림 감지:', alert);
    console.log('🎯 사용자 접근성 설정:', { hasVisualSupport, hasHearingSupport });
    
    // 자동 접근성 알림 실행
    const accessibilityType = hasVisualSupport && hasHearingSupport 
      ? 'both'
      : hasVisualSupport 
      ? 'visual' 
      : 'hearing';

    console.log('🔥 접근성 알림 실행:', accessibilityType);
    
    triggerAutomaticAlert({
      type: accessibilityType,
      severity: alert.severity as 'critical' | 'high' | 'moderate',
      disasterType: alert.disasterType,
      location: alert.location,
      message: alert.message,
      language: language
    });

    console.log('✅ 접근성 알림 트리거 완료');

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
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 접근성 알림 모니터링 상태:', {
        needsSupport: needsAccessibilitySupport,
        visual: hasVisualSupport,
        hearing: hasHearingSupport,
        language: language,
        location: location,
        isLanguagePage: isLanguagePage,
        enabled: needsAccessibilitySupport && !isLanguagePage,
        alertResponse: alertResponse
      });
    }
  }, [needsAccessibilitySupport, hasVisualSupport, hasHearingSupport, language, location, isLanguagePage, alertResponse]);

  // 이 컴포넌트는 UI를 렌더링하지 않음 (백그라운드 모니터링)
  return null;
}
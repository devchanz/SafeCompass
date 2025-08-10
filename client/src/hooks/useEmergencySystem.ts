import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface EmergencyAlert {
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
  };
  vibrationPattern?: number[];
  isActive: boolean;
  timestamp: Date;
}

interface UserClassification {
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
  classification: string;
}

export function useEmergencySystem() {
  const queryClient = useQueryClient();
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);

  // 현재 활성 알림 조회 - 항상 체크하되 데모 실행 후에만 알림 활성화
  const { data: currentAlert, isLoading: alertLoading } = useQuery({
    queryKey: ['/api/emergency/current-alert'],
    refetchInterval: 5000, // 항상 5초마다 체크
    enabled: true
  });

  // 2차 사용자 분류
  const classifyUserMutation = useMutation({
    mutationFn: async ({ userId, situation }: { 
      userId: string, 
      situation: {
        locationContext: string;
        canMove: boolean;
        currentLocation?: { lat: number; lng: number };
        additionalInfo?: string;
      }
    }) => {
      const response = await fetch('/api/emergency/classify-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, situation })
      });
      
      if (!response.ok) {
        throw new Error('사용자 분류에 실패했습니다');
      }
      
      return response.json() as Promise<UserClassification>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emergency'] });
    }
  });

  // 알림 읽음 처리
  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/emergency/mark-read', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('알림 읽음 처리에 실패했습니다');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emergency/current-alert'] });
    }
  });

  // 재난 상황 종료
  const endEmergencyMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/emergency/all-clear', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('재난 상황 종료에 실패했습니다');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setIsEmergencyActive(false);
      queryClient.invalidateQueries({ queryKey: ['/api/emergency'] });
    }
  });

  // 데모 긴급 상황 트리거 - 수동 시뮬레이션만 (다국어 지원)
  const triggerEmergencyDemoMutation = useMutation({
    mutationFn: async ({ disasterType = 'earthquake', language = 'ko' }: { 
      disasterType?: 'earthquake' | 'fire';
      language?: string;
    }) => {
      // 긴급 상황 활성화 (수동 트리거만)
      setIsEmergencyActive(true);
      
      const response = await fetch('/api/emergency/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disasterType, language })
      });
      
      if (!response.ok) {
        throw new Error('데모 상황 생성에 실패했습니다');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setIsEmergencyActive(true);
      queryClient.invalidateQueries({ queryKey: ['/api/emergency/current-alert'] });
    }
  });

  // 전역 처리된 알림 ID 저장 (브라우저 세션 스토리지 사용)
  useEffect(() => {
    const alert = currentAlert as any;
    if (alert && alert.isActive && alert.id) {
      const alertId = alert.id as string;
      
      // 전역적으로 처리된 알림인지 확인 (모든 페이지 간 공유)
      const processedAlerts = JSON.parse(sessionStorage.getItem('processedAlerts') || '[]');
      if (processedAlerts.includes(alertId)) {
        console.log('🔄 이미 처리된 알림 ID:', alertId);
        // 상태 업데이트 제거 - 무한 루프 방지
        return;
      }
      
      console.log('🚨 새로운 긴급 알림 감지:', alertId);
      
      // 전역 처리 목록에 추가
      processedAlerts.push(alertId);
      sessionStorage.setItem('processedAlerts', JSON.stringify(processedAlerts));
      
      // 브라우저 알림 한 번만 실행
      if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted' && alert.title && alert.body) {
            new Notification(alert.title, {
              body: alert.body,
              icon: '/favicon.ico',
              tag: alertId,
              requireInteraction: true
            });
          }
        });
      }

      // 진동 한 번만 실행 
      if ('vibrate' in navigator && alert.vibrationPattern) {
        console.log('📳 진동 패턴 실행:', alert.vibrationPattern);
        navigator.vibrate(alert.vibrationPattern);
      }
    } else if (!alert || !alert.isActive) {
      console.log('📴 긴급 상황 종료');
    }
  }, [currentAlert?.id, currentAlert?.isActive]); // 특정 속성만 추적하여 무한 루프 방지

  return {
    // 상태
    isEmergencyActive,
    currentAlert: currentAlert as EmergencyAlert | null,
    alertLoading,
    
    // 동작
    classifyUser: classifyUserMutation.mutateAsync,
    markAsRead: markAsReadMutation.mutateAsync,
    endEmergency: endEmergencyMutation.mutateAsync,
    triggerEmergencyDemo: triggerEmergencyDemoMutation.mutateAsync,
    
    // 로딩 상태
    isClassifying: classifyUserMutation.isPending,
    isEndingEmergency: endEmergencyMutation.isPending,
    isTriggeringDemo: triggerEmergencyDemoMutation.isPending
  };
}
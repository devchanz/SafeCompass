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

  // 현재 활성 알림 조회 - 수동 트리거 후에만 체크
  const { data: currentAlert, isLoading: alertLoading } = useQuery({
    queryKey: ['/api/emergency/current-alert'],
    refetchInterval: isEmergencyActive ? 5000 : false, // 긴급 상황일 때만 체크
    enabled: isEmergencyActive
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

  // 데모 긴급 상황 트리거 - 수동 시뮬레이션만
  const triggerEmergencyDemoMutation = useMutation({
    mutationFn: async (disasterType: 'earthquake' | 'fire' = 'earthquake') => {
      // 긴급 상황 활성화 (수동 트리거만)
      setIsEmergencyActive(true);
      
      const response = await fetch('/api/emergency/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disasterType })
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

  // 긴급 상황 감지
  useEffect(() => {
    if (currentAlert && currentAlert.isActive) {
      setIsEmergencyActive(true);
      
      // 브라우저 알림 권한 요청 및 진동
      if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(currentAlert.title, {
              body: currentAlert.body,
              icon: '/favicon.ico'
            });
          }
        });
      }

      // 진동 실행
      if ('vibrate' in navigator && currentAlert.vibrationPattern) {
        navigator.vibrate(currentAlert.vibrationPattern);
      }
    } else {
      setIsEmergencyActive(false);
    }
  }, [currentAlert]);

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
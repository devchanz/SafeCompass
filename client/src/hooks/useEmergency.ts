import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/services/api";
import { useUserProfile } from "./useUserProfile";
import { useToast } from "./use-toast";

interface EmergencySituation {
  locationContext: string;
  canMove: boolean;
}

interface PersonalizedGuideResponse {
  message: string;
  guide: {
    primaryActions: string[];
    safetyTips: string[];
    specialConsiderations: string[];
    emergencyContacts: string[];
  };
  audioText: string;
  estimatedReadingTime: number;
  shelters: any[];
}

export function useEmergency() {
  const [, setLocation] = useLocation();
  const { data: userProfile } = useUserProfile();
  const { toast } = useToast();
  const [generatedGuide, setGeneratedGuide] = useState<PersonalizedGuideResponse | null>(null);

  const generateGuide = useMutation({
    mutationFn: async (situation: EmergencySituation) => {
      if (!userProfile) {
        throw new Error("사용자 프로필이 필요합니다");
      }

      const response = await apiRequest("POST", "/api/manual/generate", {
        userId: userProfile.id,
        disasterType: "earthquake",
        situation: {
          ...situation,
          gps: { lat: 37.5665, lng: 126.9780 } // Mock GPS coordinates
        }
      });

      return response.json() as Promise<PersonalizedGuideResponse>;
    },
    onSuccess: (data) => {
      setGeneratedGuide(data);
      toast({
        title: "맞춤형 가이드 생성 완료",
        description: "개인화된 안전 가이드가 준비되었습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "가이드 생성 실패",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const simulateEarthquake = () => {
    // Request notification permission if not already granted
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          showEarthquakeNotification();
        }
      });
    } else if (Notification.permission === 'granted') {
      showEarthquakeNotification();
    }

    // Navigate to emergency alert screen
    setLocation("/emergency");

    // Trigger haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([500, 1000, 500, 1000, 500]);
    }
  };

  const showEarthquakeNotification = () => {
    new Notification('지진 경보', {
      body: '규모 5.2 지진이 감지되었습니다. 즉시 안전한 곳으로 대피하세요.',
      icon: '/manifest-icon-192.png',
      tag: 'earthquake-alert',
      requireInteraction: true,
    });
  };

  return {
    generateGuide,
    generatedGuide,
    simulateEarthquake,
  };
}

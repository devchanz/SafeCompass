import React from 'react';
import { Button } from '@/components/ui/button';
import { useAccessibilityAlert } from '@/services/accessibilityAlertService';
import { useLanguage } from '@/contexts/LanguageContext';

interface DemoAccessibilityButtonProps {
  onDemoComplete?: () => void;
}

/**
 * 접근성 알림 데모 버튼
 * 사용자 프로필과 관계없이 모든 접근성 기능을 테스트할 수 있는 버튼
 */
export default function DemoAccessibilityButton({ onDemoComplete }: DemoAccessibilityButtonProps) {
  const { triggerAutomaticAlert } = useAccessibilityAlert();
  const { language } = useLanguage();

  const handleDemoAlert = async (type: 'visual' | 'hearing' | 'both') => {
    console.log(`🎯 접근성 알림 데모 실행: ${type}`);
    
    try {
      await triggerAutomaticAlert({
        type,
        severity: 'critical',
        disasterType: 'earthquake',
        location: '대전광역시 유성구',
        message: '규모 5.8 지진이 발생했습니다. 즉시 안전한 곳으로 대피하세요.',
        language
      });
      
      onDemoComplete?.();
    } catch (error) {
      console.error('접근성 알림 데모 실패:', error);
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-gray-700 mb-2">접근성 알림 테스트</div>
      
      <Button 
        variant="outline" 
        size="sm"
        className="w-full justify-start text-blue-600 border-blue-200 hover:bg-blue-50"
        onClick={() => handleDemoAlert('visual')}
      >
        <i className="fas fa-eye mr-2" aria-hidden="true"></i>
        시각 지원 알림 (TTS)
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        className="w-full justify-start text-yellow-600 border-yellow-200 hover:bg-yellow-50"
        onClick={() => handleDemoAlert('hearing')}
      >
        <i className="fas fa-assistive-listening-systems mr-2" aria-hidden="true"></i>
        청각 지원 알림 (진동+플래시)
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        className="w-full justify-start text-purple-600 border-purple-200 hover:bg-purple-50"
        onClick={() => handleDemoAlert('both')}
      >
        <i className="fas fa-universal-access mr-2" aria-hidden="true"></i>
        통합 접근성 알림
      </Button>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { useLanguage } from '../contexts/LanguageContext';

interface PushNotificationProps {
  alert: {
    id: string;
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
  } | null;
  onDismiss: () => void;
  onOpen: () => void;
}

export default function PushNotification({ alert, onDismiss, onOpen }: PushNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  
  // 다국어 텍스트
  const getText = (key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      click_to_respond: {
        ko: '클릭하여 대응하기 →',
        en: 'Click to respond →',
        vi: 'Nhấp để ứng phó →',
        zh: '点击响应 →'
      },
      magnitude: {
        ko: '규모',
        en: 'Magnitude',
        vi: 'Cường độ',
        zh: '震级'
      }
    };
    
    return translations[key]?.[language] || translations[key]?.['ko'] || key;
  };

  useEffect(() => {
    if (alert && alert.isActive) {
      setIsVisible(true);
      
      // 자동 숨김 (15초 후)
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss();
      }, 15000);
      
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [alert?.id, alert?.isActive]); // onDismiss 의존성 제거하여 무한 루프 방지

  if (!alert || !isVisible) return null;

  const handleNotificationClick = () => {
    onOpen();
    setLocation('/emergency');
    setIsVisible(false);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    onDismiss();
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-in slide-in-from-top duration-500">
      <Card 
        className="bg-red-600 border-red-700 text-white cursor-pointer hover:bg-red-700 transition-colors shadow-2xl"
        onClick={handleNotificationClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <h3 className="font-bold text-lg">{alert.title}</h3>
                <span className="text-xs bg-red-800 px-2 py-1 rounded">
                  {alert.data.classification}
                </span>
              </div>
              <p className="text-sm text-red-100 mb-3 leading-relaxed">
                {alert.body}
              </p>
              <div className="flex items-center justify-between">
                <div className="text-xs text-red-200">
                  {alert.data.magnitude && `${getText('magnitude')} ${alert.data.magnitude} | `}
                  {alert.data.location}
                </div>
                <div className="text-xs text-red-200">
                  {getText('click_to_respond')}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-red-800 p-1"
              onClick={handleDismiss}
            >
              <i className="fas fa-times" aria-hidden="true"></i>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
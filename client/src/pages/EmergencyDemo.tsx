import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEmergencySystem } from "@/hooks/useEmergencySystem";

export default function EmergencyDemo() {
  const { language } = useLanguage();
  const { triggerEmergencyDemo, isTriggeringDemo, currentAlert } = useEmergencySystem();
  const [lastTriggered, setLastTriggered] = useState<string>('');

  const getText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      ko: {
        title: '🚨 긴급 재난 시스템 데모',
        description: '초개인화 재난 대응 시스템을 체험해보세요',
        trigger_earthquake: '지진 발생 시뮬레이션',
        trigger_fire: '화재 발생 시뮬레이션',
        triggering: '시뮬레이션 실행 중...',
        current_status: '현재 상태',
        no_active_alert: '활성 알림 없음',
        alert_info: '알림 정보',
        classification: '분류',
        severity: '심각도',
        location: '발생 위치',
        timestamp: '발생 시간',
        last_demo: '마지막 데모',
        instructions: '시스템 작동 방식',
        step1: '1. 정부 재난 문자 수신 (API 모니터링)',
        step2: '2. Rule-Based + LLM 재난 분류',
        step3: '3. 위급/긴급 재난일 경우 PUSH 알림',
        step4: '4. 사용자가 앱 실행 시 2차 상황 입력',
        step5: '5. 1차(DB) + 2차(현장) 정보 통합 분류',
        step6: '6. 초개인화 맞춤형 안전 가이드 생성',
        step7: '7. 단계별 TTS, 진동, 대피소, SOS 기능'
      },
      en: {
        title: '🚨 Emergency Disaster System Demo',
        description: 'Experience the ultra-personalized disaster response system',
        trigger_earthquake: 'Earthquake Simulation',
        trigger_fire: 'Fire Simulation',
        triggering: 'Running simulation...',
        current_status: 'Current Status',
        no_active_alert: 'No active alerts',
        alert_info: 'Alert Information',
        classification: 'Classification',
        severity: 'Severity',
        location: 'Location',
        timestamp: 'Timestamp',
        last_demo: 'Last Demo',
        instructions: 'System Operation',
        step1: '1. Receive government disaster alerts (API monitoring)',
        step2: '2. Rule-Based + LLM disaster classification',
        step3: '3. Push notifications for critical/urgent disasters',
        step4: '4. Secondary situation input when user opens app',
        step5: '5. Integrate primary (DB) + secondary (field) information',
        step6: '6. Generate ultra-personalized safety guides',
        step7: '7. Step-by-step TTS, vibration, shelters, SOS features'
      }
    };
    return texts[language]?.[key] || texts['ko'][key] || key;
  };

  const handleTriggerDemo = async (disasterType: 'earthquake' | 'fire') => {
    try {
      await triggerEmergencyDemo(disasterType);
      setLastTriggered(`${disasterType} - ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      console.error('데모 실행 오류:', error);
      alert('데모 실행 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <Card className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            {getText('title')}
          </CardTitle>
          <p className="text-center text-lg opacity-90">
            {getText('description')}
          </p>
        </CardHeader>
      </Card>

      {/* 시뮬레이션 버튼 */}
      <Card>
        <CardHeader>
          <CardTitle>데모 실행</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              size="lg"
              className="h-16 bg-red-600 hover:bg-red-700 text-white"
              onClick={() => handleTriggerDemo('earthquake')}
              disabled={isTriggeringDemo}
            >
              <i className="fas fa-mountain mr-3 text-xl" aria-hidden="true"></i>
              <div className="flex flex-col">
                <span className="font-bold">{getText('trigger_earthquake')}</span>
                <span className="text-sm opacity-80">규모 5.8 대전 유성구</span>
              </div>
            </Button>

            <Button
              size="lg"
              className="h-16 bg-orange-600 hover:bg-orange-700 text-white"
              onClick={() => handleTriggerDemo('fire')}
              disabled={isTriggeringDemo}
            >
              <i className="fas fa-fire mr-3 text-xl" aria-hidden="true"></i>
              <div className="flex flex-col">
                <span className="font-bold">{getText('trigger_fire')}</span>
                <span className="text-sm opacity-80">대형화재 대전 중구</span>
              </div>
            </Button>
          </div>

          {isTriggeringDemo && (
            <div className="text-center text-blue-600 font-medium">
              <i className="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i>
              {getText('triggering')}
            </div>
          )}

          {lastTriggered && (
            <div className="text-center text-green-600">
              {getText('last_demo')}: {lastTriggered}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 현재 상태 */}
      <Card>
        <CardHeader>
          <CardTitle>{getText('current_status')}</CardTitle>
        </CardHeader>
        <CardContent>
          {currentAlert ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                <span className="font-bold text-red-600">활성 알림 있음</span>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-bold text-red-800 mb-2">{currentAlert.title}</h3>
                <p className="text-red-700 mb-3">{currentAlert.body}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">{getText('classification')}:</span>
                    <span className="ml-2">{currentAlert.data.classification}</span>
                  </div>
                  <div>
                    <span className="font-semibold">{getText('severity')}:</span>
                    <span className="ml-2">{currentAlert.data.severity}</span>
                  </div>
                  <div>
                    <span className="font-semibold">{getText('location')}:</span>
                    <span className="ml-2">{currentAlert.data.location}</span>
                  </div>
                  <div>
                    <span className="font-semibold">{getText('timestamp')}:</span>
                    <span className="ml-2">{new Date(currentAlert.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <i className="fas fa-check-circle text-3xl mb-2" aria-hidden="true"></i>
              <p>{getText('no_active_alert')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 시스템 작동 방식 */}
      <Card>
        <CardHeader>
          <CardTitle>{getText('instructions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">1</span>
              <span>{getText('step1')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">2</span>
              <span>{getText('step2')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-sm">3</span>
              <span>{getText('step3')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">4</span>
              <span>{getText('step4')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">5</span>
              <span>{getText('step5')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">6</span>
              <span>{getText('step6')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-sm">7</span>
              <span>{getText('step7')}</span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
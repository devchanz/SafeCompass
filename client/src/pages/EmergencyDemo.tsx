import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEmergencySystem } from "@/hooks/useEmergencySystem";
import { useLocation } from "wouter";

interface DemoStep {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  data?: any;
}

export default function EmergencyDemo() {
  const { language } = useLanguage();
  const { triggerEmergencyDemo, isTriggeringDemo, currentAlert } = useEmergencySystem();
  const [, setLocation] = useLocation();
  
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<DemoStep[]>([]);
  const [progress, setProgress] = useState(0);

  const getText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      ko: {
        title: '🚨 재난 대응 시스템 실제 작동 데모',
        description: '지진 발생부터 개인화된 안전 가이드까지 전체 플로우를 직접 체험하세요',
        start_demo: '🚨 지진 시뮬레이션 시작',
        demo_running: '시스템 작동 중...',
        step_progress: '진행 단계',
        disaster_detection: '재난 감지 및 분류',
        alert_system: '긴급 알림 발송',
        user_redirect: '사용자 앱 자동 이동',
        situation_input: '현장 상황 입력',
        guide_generation: '맞춤형 가이드 생성',
        demo_complete: '데모 완료',
        view_guide: '개인화된 가이드 보기',
        restart_demo: '데모 다시 시작',
        demo_completed: '✅ 전체 시스템 작동 완료!'
      },
      en: {
        title: '🚨 Disaster Response System Live Demo',
        description: 'Experience the complete flow from earthquake detection to personalized safety guides',
        start_demo: '🚨 Start Earthquake Simulation',
        demo_running: 'System Operating...',
        step_progress: 'Step Progress',
        disaster_detection: 'Disaster Detection & Classification',
        alert_system: 'Emergency Alert Dispatch',
        user_redirect: 'Auto User App Redirect',
        situation_input: 'Field Situation Input',
        guide_generation: 'Personalized Guide Generation',
        demo_complete: 'Demo Complete',
        view_guide: 'View Personalized Guide',
        restart_demo: 'Restart Demo',
        demo_completed: '✅ Complete System Operation Finished!'
      }
    };
    return texts[language]?.[key] || texts['ko'][key] || key;
  };

  const initializeSteps = (): DemoStep[] => [
    {
      id: 1,
      title: getText('disaster_detection'),
      description: '정부 재난 API 모니터링 → Rule-Based + LLM 분류',
      status: 'pending'
    },
    {
      id: 2,
      title: getText('alert_system'),
      description: '위급재난 판별 → PUSH 알림 + 진동 발송',
      status: 'pending'
    },
    {
      id: 3,
      title: getText('user_redirect'),
      description: '사용자 앱 자동 실행 → Emergency 페이지 이동',
      status: 'pending'
    },
    {
      id: 4,
      title: getText('situation_input'),
      description: '현재 위치 + 상황 정보 입력 → 2차 분류',
      status: 'pending'
    },
    {
      id: 5,
      title: getText('guide_generation'),
      description: '1차+2차 정보 통합 → OpenAI 개인화 가이드 생성',
      status: 'pending'
    }
  ];

  const updateStepStatus = (stepId: number, status: 'pending' | 'running' | 'completed' | 'error', data?: any) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, data } : step
    ));
  };

  const simulateSystemFlow = async () => {
    setIsRunning(true);
    setSteps(initializeSteps());
    setCurrentStep(1);
    setProgress(0);

    try {
      // Step 1: 재난 감지 및 분류
      updateStepStatus(1, 'running');
      setProgress(10);
      
      console.log('🔥 Step 1: 재난 감지 시작...');
      const demoResponse = await fetch('/api/emergency/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disasterType: 'earthquake' })
      });
      const demoData = await demoResponse.json();
      
      updateStepStatus(1, 'completed', demoData);
      setProgress(20);
      
      // Step 2: 알림 발송 (자동으로 이미 발송됨)
      setTimeout(() => {
        updateStepStatus(2, 'running');
        setProgress(40);
        
        setTimeout(() => {
          updateStepStatus(2, 'completed', { alert: 'PUSH 알림 발송됨' });
          setProgress(60);
          
          // Step 3: 자동 페이지 이동
          setTimeout(() => {
            updateStepStatus(3, 'running');
            setProgress(80);
            
            setTimeout(() => {
              updateStepStatus(3, 'completed');
              setProgress(100);
              
              // 시뮬레이션 완료 후 대시보드로 이동하여 PUSH 알림 표시
              setTimeout(() => {
                console.log('🚀 지진 시뮬레이션 완료 - Dashboard로 이동합니다...');
                
                // 알림 중복 방지를 위해 현재 알림 ID 기록
                if (currentAlert?.id) {
                  const processedAlerts = JSON.parse(sessionStorage.getItem('processedAlerts') || '[]');
                  if (!processedAlerts.includes(currentAlert.id)) {
                    processedAlerts.push(currentAlert.id);
                    sessionStorage.setItem('processedAlerts', JSON.stringify(processedAlerts));
                  }
                }
                
                setLocation('/');
              }, 1000);
              
            }, 1500);
          }, 1000);
        }, 2000);
      }, 1500);
      
    } catch (error) {
      console.error('데모 실행 오류:', error);
      updateStepStatus(currentStep, 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Demo Header */}
      <Card className="emergency-card bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-red-700">
            {getText('title')}
          </CardTitle>
          <p className="text-gray-600 mt-2">{getText('description')}</p>
        </CardHeader>
      </Card>

      {/* Demo Control */}
      <Card className="emergency-card">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="space-y-3">
              <Button
                onClick={simulateSystemFlow}
                disabled={isRunning}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
                size="lg"
              >
              {isRunning ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i>
                  {getText('demo_running')}
                </>
              ) : (
                <>
                  <i className="fas fa-play mr-2" aria-hidden="true"></i>
                  {getText('start_demo')}
                </>
              )}
              </Button>
              
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">또는 간단한 지진 시뮬레이션만</p>
                <Button
                  onClick={async () => {
                    try {
                      await fetch('/api/emergency/demo', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ disasterType: 'earthquake' })
                      });
                      setLocation('/');
                    } catch (error) {
                      console.error('지진 시뮬레이션 오류:', error);
                    }
                  }}
                  variant="outline"
                  className="text-sm px-4 py-2"
                >
                  <i className="fas fa-bolt mr-2" aria-hidden="true"></i>
                  바로 지진 시뮬레이션
                </Button>
              </div>
            </div>
            
            {isRunning && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">{getText('step_progress')}</p>
                <Progress value={progress} className="w-full" />
                <p className="text-xs text-gray-500">{progress}% 완료</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step Progress */}
      {steps.length > 0 && (
        <Card className="emergency-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-tasks mr-2 text-blue-600" aria-hidden="true"></i>
              시스템 작동 단계
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-start space-x-4 p-4 rounded-lg border">
                  <div className="flex-shrink-0">
                    {step.status === 'pending' && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm text-gray-500">{step.id}</span>
                      </div>
                    )}
                    {step.status === 'running' && (
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <i className="fas fa-spinner fa-spin text-blue-600" aria-hidden="true"></i>
                      </div>
                    )}
                    {step.status === 'completed' && (
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <i className="fas fa-check text-green-600" aria-hidden="true"></i>
                      </div>
                    )}
                    {step.status === 'error' && (
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <i className="fas fa-times text-red-600" aria-hidden="true"></i>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold">{step.title}</h4>
                      <Badge variant={
                        step.status === 'completed' ? 'default' :
                        step.status === 'running' ? 'secondary' :
                        step.status === 'error' ? 'destructive' : 'outline'
                      }>
                        {step.status === 'pending' ? '대기중' :
                         step.status === 'running' ? '실행중' :
                         step.status === 'completed' ? '완료' : '오류'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{step.description}</p>
                    
                    {step.data && step.status === 'completed' && (
                      <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
                        {step.id === 1 && `✅ 재난 분류: ${step.data.data?.classification} (${step.data.data?.disasterType})`}
                        {step.id === 2 && `✅ ${step.data.alert}`}
                        {step.id === 3 && `✅ Emergency 페이지로 자동 이동`}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {progress === 100 && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <div className="text-green-700 font-semibold mb-2">
                  {getText('demo_completed')}
                </div>
                <p className="text-sm text-green-600 mb-4">
                  Dashboard에서 PUSH 알림을 확인하고 Emergency 페이지로 진행하세요.
                </p>
                <Button 
                  onClick={() => setLocation('/')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <i className="fas fa-home mr-2" aria-hidden="true"></i>
                  Dashboard로 이동
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
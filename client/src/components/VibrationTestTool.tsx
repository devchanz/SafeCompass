import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/**
 * 아이폰/모바일 진동 테스트 전용 도구
 */
export default function VibrationTestTool() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [deviceInfo, setDeviceInfo] = useState<string>('');

  const addResult = (result: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, `${timestamp}: ${result}`]);
  };

  const getDeviceInfo = () => {
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      vibrationSupport: 'vibrate' in navigator,
      touchSupport: 'ontouchstart' in window,
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
      isSafari: /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
    };
    
    setDeviceInfo(JSON.stringify(info, null, 2));
    addResult(`디바이스 정보 수집됨: iOS=${info.isIOS}, Safari=${info.isSafari}, 진동지원=${info.vibrationSupport}`);
  };

  const testBasicVibration = () => {
    if (navigator.vibrate) {
      addResult('기본 진동 테스트 시작...');
      navigator.vibrate(200);
      addResult('✅ 기본 진동 (200ms) 실행됨');
    } else {
      addResult('❌ 진동 API 미지원');
    }
  };

  const testPatternVibration = () => {
    if (navigator.vibrate) {
      addResult('패턴 진동 테스트 시작...');
      navigator.vibrate([100, 100, 100, 100, 300]);
      addResult('✅ 패턴 진동 실행됨');
    } else {
      addResult('❌ 진동 API 미지원');
    }
  };

  const testAudioHaptic = () => {
    addResult('오디오 햅틱 테스트 시작...');
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
      
      addResult('✅ 오디오 햅틱 실행됨 (iOS 대안)');
    } catch (error) {
      addResult(`❌ 오디오 햅틱 실패: ${error}`);
    }
  };

  const testVisualFlash = async () => {
    addResult('시각적 플래시 테스트 시작...');
    
    for (let i = 0; i < 3; i++) {
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.backgroundColor = '#FF0000';
      overlay.style.zIndex = '9999';
      overlay.style.opacity = '0.7';
      overlay.style.pointerEvents = 'none';

      document.body.appendChild(overlay);
      
      await new Promise(resolve => setTimeout(resolve, 200));
      document.body.removeChild(overlay);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    addResult('✅ 시각적 플래시 완료');
  };

  const testScreenWake = async () => {
    addResult('화면 깨우기 테스트 시작...');
    try {
      if ('wakeLock' in navigator) {
        const wakeLock = await (navigator as any).wakeLock.request('screen');
        addResult('✅ Wake Lock 활성화됨');
        setTimeout(() => {
          wakeLock.release();
          addResult('✅ Wake Lock 해제됨');
        }, 2000);
      } else {
        addResult('❌ Wake Lock API 미지원');
      }
    } catch (error) {
      addResult(`❌ Wake Lock 실패: ${error}`);
    }
  };

  const testEmergencyPattern = () => {
    addResult('🚨 비상 패턴 통합 테스트 시작...');
    
    // 1. 진동 시도
    if (navigator.vibrate) {
      navigator.vibrate([500, 200, 500, 200, 500]);
      addResult('📳 비상 진동 패턴 실행');
    }
    
    // 2. 오디오 햅틱
    testAudioHaptic();
    
    // 3. 시각적 플래시
    setTimeout(() => testVisualFlash(), 500);
    
    addResult('🚨 비상 패턴 통합 테스트 완료');
  };

  const clearResults = () => {
    setTestResults([]);
    setDeviceInfo('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-red-600">
            📱 모바일 진동/햅틱 테스트 도구
          </CardTitle>
          <p className="text-gray-600">아이폰 브라우저 환경에서 진동 및 대안 피드백 테스트</p>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* 디바이스 정보 */}
          <div>
            <Button onClick={getDeviceInfo} className="mb-4">
              📊 디바이스 정보 확인
            </Button>
            {deviceInfo && (
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                {deviceInfo}
              </pre>
            )}
          </div>

          <Separator />

          {/* 진동 테스트 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">진동 테스트</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={testBasicVibration} variant="outline">
                📳 기본 진동
              </Button>
              <Button onClick={testPatternVibration} variant="outline">
                🔄 패턴 진동
              </Button>
            </div>
          </div>

          <Separator />

          {/* 대안 피드백 테스트 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">iOS 대안 피드백</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={testAudioHaptic} variant="outline">
                🔊 오디오 햅틱
              </Button>
              <Button onClick={testVisualFlash} variant="outline">
                ⚡ 시각적 플래시
              </Button>
              <Button onClick={testScreenWake} variant="outline">
                📱 화면 깨우기
              </Button>
              <Button onClick={testEmergencyPattern} className="bg-red-600 text-white">
                🚨 비상 패턴
              </Button>
            </div>
          </div>

          <Separator />

          {/* 테스트 결과 */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">테스트 결과</h3>
              <Button onClick={clearResults} variant="ghost" size="sm">
                🗑️ 결과 지우기
              </Button>
            </div>
            
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
              {testResults.length === 0 ? (
                <div className="text-gray-500">테스트 결과가 여기에 표시됩니다...</div>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="mb-1">
                    {result}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 사용 안내 */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">📋 사용 안내</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 아이폰에서 진동이 작동하지 않는 경우 "오디오 햅틱"이나 "시각적 플래시"를 확인하세요</li>
              <li>• iOS Safari는 진동 API를 제한적으로 지원합니다</li>
              <li>• "비상 패턴"은 모든 대안 피드백을 동시에 테스트합니다</li>
              <li>• 소리가 켜져 있는 상태에서 테스트하는 것이 좋습니다</li>
            </ul>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
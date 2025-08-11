import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * 플래시라이트 테스트 도구
 * 안드로이드/iOS에서 실제 카메라 플래시 작동 여부를 테스트
 */
export default function FlashlightTestTool() {
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [track, setTrack] = useState<MediaStreamTrack | null>(null);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [testResult, setTestResult] = useState<string>('');

  const initializeCamera = async () => {
    try {
      setTestResult('📸 카메라 초기화 중...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // 후면 카메라
          width: { ideal: 1 },
          height: { ideal: 1 }
        }
      });

      const videoTrack = mediaStream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities() as any;

      setStream(mediaStream);
      setTrack(videoTrack);

      if (capabilities.torch) {
        setIsSupported(true);
        setTestResult('✅ 플래시라이트 지원됨! 테스트 가능');
      } else {
        setIsSupported(false);
        setTestResult('❌ 플래시라이트 미지원 (이 기기는 화면 플래시만 가능)');
      }
    } catch (error) {
      setIsSupported(false);
      setTestResult(`❌ 카메라 접근 실패: ${(error as Error).message}`);
      console.error('카메라 초기화 실패:', error);
    }
  };

  const toggleFlash = async () => {
    if (!track || !isSupported) {
      setTestResult('❌ 플래시라이트를 사용할 수 없습니다');
      return;
    }

    try {
      const newState = !isFlashOn;
      
      await track.applyConstraints({
        advanced: [{ torch: newState } as any]
      });
      
      setIsFlashOn(newState);
      setTestResult(newState ? '🔦 플래시라이트 켜짐' : '🔦 플래시라이트 꺼짐');
    } catch (error) {
      setTestResult(`❌ 플래시 제어 실패: ${(error as Error).message}`);
      console.error('플래시 제어 실패:', error);
    }
  };

  const testFlashPattern = async () => {
    if (!track || !isSupported) {
      setTestResult('❌ 플래시라이트를 사용할 수 없습니다');
      return;
    }

    try {
      setTestResult('🔦 플래시 패턴 테스트 중...');
      
      // 3번 깜빡이는 패턴
      for (let i = 0; i < 3; i++) {
        // 플래시 켜기
        await track.applyConstraints({
          advanced: [{ torch: true } as any]
        });
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 플래시 끄기
        await track.applyConstraints({
          advanced: [{ torch: false } as any]
        });
        
        if (i < 2) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      setTestResult('✅ 플래시 패턴 테스트 완료');
      setIsFlashOn(false);
    } catch (error) {
      setTestResult(`❌ 플래시 패턴 테스트 실패: ${(error as Error).message}`);
      console.error('플래시 패턴 테스트 실패:', error);
    }
  };

  const cleanup = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setTrack(null);
      setIsFlashOn(false);
      setIsSupported(null);
      setTestResult('📸 카메라 해제됨');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-mobile-alt mr-2 text-blue-600" aria-hidden="true"></i>
            📱 실제 플래시라이트 테스트
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">
            안드로이드/iOS 스마트폰에서 실제 카메라 플래시가 작동하는지 테스트합니다.
            브라우저에서 카메라 권한을 허용해주세요.
          </div>

          {/* 테스트 결과 */}
          {testResult && (
            <div className="p-3 bg-gray-100 rounded-lg border">
              <div className="text-sm font-mono">{testResult}</div>
            </div>
          )}

          {/* 제어 버튼들 */}
          <div className="space-y-3">
            {!stream && (
              <Button 
                onClick={initializeCamera}
                className="w-full"
              >
                <i className="fas fa-camera mr-2" aria-hidden="true"></i>
                📸 카메라 초기화
              </Button>
            )}

            {stream && isSupported && (
              <>
                <Button 
                  onClick={toggleFlash}
                  variant={isFlashOn ? "destructive" : "default"}
                  className="w-full"
                >
                  <i className={`fas ${isFlashOn ? 'fa-lightbulb' : 'fa-toggle-off'} mr-2`} aria-hidden="true"></i>
                  {isFlashOn ? '🔦 플래시 끄기' : '🔦 플래시 켜기'}
                </Button>

                <Button 
                  onClick={testFlashPattern}
                  variant="outline"
                  className="w-full"
                >
                  <i className="fas fa-bolt mr-2" aria-hidden="true"></i>
                  ⚡ 플래시 패턴 테스트
                </Button>
              </>
            )}

            {stream && (
              <Button 
                onClick={cleanup}
                variant="outline"
                className="w-full"
              >
                <i className="fas fa-times mr-2" aria-hidden="true"></i>
                📸 카메라 해제
              </Button>
            )}
          </div>

          {/* 지원 정보 */}
          <div className="text-xs text-gray-500 space-y-1">
            <div>• Android: Chrome, Samsung Internet, Firefox 지원</div>
            <div>• iOS: Safari 15.4+ 지원 (iOS 15.4 이상)</div>
            <div>• 일부 기기에서는 보안상 플래시 제어가 제한될 수 있습니다</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSpeechService } from "@/services/speechService";
import { useHapticService } from "@/services/hapticService";

export default function AccessibilityTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const { speak, isSupported: ttsSupported } = useSpeechService();
  const { vibrate, isSupported: hapticSupported } = useHapticService();

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testTTS = async () => {
    try {
      addResult("TTS 테스트 시작...");
      await speak("안전나침반 음성 지원 테스트입니다. 시각 장애인을 위한 음성 안내 기능이 정상적으로 작동하고 있습니다.", "ko");
      addResult("✅ TTS 음성 재생 완료 - 시각장애인 지원 정상");
    } catch (error) {
      addResult(`❌ TTS 오류: ${error}`);
    }
  };

  const testVibration = async () => {
    try {
      addResult("진동 테스트 시작...");
      // 긴급 상황 패턴: 짧은-긴-짧은-긴-짧은
      await vibrate([100, 100, 300, 100, 100, 100, 300, 100, 100]);
      addResult("✅ 진동 패턴 실행 완료 - 청각장애인 지원 정상");
    } catch (error) {
      addResult(`❌ 진동 오류: ${error}`);
    }
  };

  const testGeolocation = () => {
    addResult("위치 서비스 테스트 시작...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          addResult(`✅ 위치 정보 획득: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
        },
        (error) => {
          addResult(`❌ 위치 정보 오류: ${error.message}`);
        }
      );
    } else {
      addResult("❌ 위치 서비스 미지원");
    }
  };

  const testNotifications = async () => {
    try {
      addResult("알림 권한 테스트 시작...");
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('안전나침반 테스트', {
          body: '푸시 알림 기능이 정상적으로 작동합니다',
          icon: '/favicon.ico',
          vibrate: [200, 100, 200]
        });
        addResult("✅ 푸시 알림 전송 완료");
      } else {
        addResult(`❌ 알림 권한 거부: ${permission}`);
      }
    } catch (error) {
      addResult(`❌ 알림 오류: ${error}`);
    }
  };

  const generateQRCode = () => {
    const currentUrl = window.location.origin;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl + '/accessibility-test')}`;
    
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head><title>안전나침반 QR 코드</title></head>
          <body style="text-align: center; padding: 50px; font-family: Arial;">
            <h2>모바일에서 테스트하기</h2>
            <img src="${qrUrl}" alt="QR Code" style="border: 1px solid #ccc; padding: 20px;"/>
            <p>이 QR 코드를 스마트폰으로 스캔하여<br/>모바일 환경에서 접근성 기능을 테스트하세요</p>
            <p style="font-size: 12px; color: #666;">URL: ${currentUrl}/accessibility-test</p>
          </body>
        </html>
      `);
    }
    addResult("📱 모바일 테스트용 QR 코드 생성됨");
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-blue-600">
            🔧 접근성 기능 테스트 도구
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* 브라우저 지원 현황 */}
          <div className="grid grid-cols-2 gap-4">
            <Card className={ttsSupported ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <CardContent className="p-4 text-center">
                <div className={`text-2xl mb-2 ${ttsSupported ? "text-green-600" : "text-red-600"}`}>
                  {ttsSupported ? "✅" : "❌"}
                </div>
                <p className="font-medium">음성 지원 (TTS)</p>
                <p className="text-sm text-gray-600">시각장애인 지원</p>
              </CardContent>
            </Card>
            
            <Card className={hapticSupported ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <CardContent className="p-4 text-center">
                <div className={`text-2xl mb-2 ${hapticSupported ? "text-green-600" : "text-red-600"}`}>
                  {hapticSupported ? "✅" : "❌"}
                </div>
                <p className="font-medium">진동 지원</p>
                <p className="text-sm text-gray-600">청각장애인 지원</p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* 테스트 버튼들 */}
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={testTTS} 
              disabled={!ttsSupported}
              className="h-16"
            >
              🔊 음성 지원 테스트
              <br />
              <span className="text-xs">시각장애인용</span>
            </Button>
            
            <Button 
              onClick={testVibration} 
              disabled={!hapticSupported}
              className="h-16"
            >
              📳 진동 알림 테스트
              <br />
              <span className="text-xs">청각장애인용</span>
            </Button>
            
            <Button 
              onClick={testGeolocation}
              className="h-16"
            >
              📍 위치 서비스 테스트
              <br />
              <span className="text-xs">거리 계산용</span>
            </Button>
            
            <Button 
              onClick={testNotifications}
              className="h-16"
            >
              🔔 푸시 알림 테스트
              <br />
              <span className="text-xs">긴급 상황용</span>
            </Button>
          </div>

          <Separator />

          {/* 모바일 테스트 */}
          <div className="text-center">
            <Button 
              onClick={generateQRCode}
              variant="outline"
              className="h-16 w-full"
            >
              📱 모바일에서 테스트하기
              <br />
              <span className="text-xs">QR 코드로 모바일 접속</span>
            </Button>
            <p className="text-sm text-gray-600 mt-2">
              모바일 환경에서 진동과 TTS가 더 잘 작동합니다
            </p>
          </div>

          <Separator />

          {/* 테스트 결과 로그 */}
          <div>
            <h3 className="font-bold text-lg mb-3">테스트 결과 로그</h3>
            <Card className="bg-gray-50">
              <CardContent className="p-4 max-h-64 overflow-y-auto">
                {testResults.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    위 버튼들을 클릭하여 접근성 기능을 테스트하세요
                  </p>
                ) : (
                  <div className="space-y-1 text-sm font-mono">
                    {testResults.map((result, index) => (
                      <div key={index} className="border-b border-gray-200 pb-1">
                        {result}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            {testResults.length > 0 && (
              <Button 
                onClick={() => setTestResults([])} 
                variant="outline" 
                size="sm" 
                className="mt-2"
              >
                로그 지우기
              </Button>
            )}
          </div>

          {/* 사용법 안내 */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <h4 className="font-bold text-blue-800 mb-2">💡 테스트 방법</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>음성 지원:</strong> 헤드폰을 착용하고 테스트하세요</li>
                <li>• <strong>진동 알림:</strong> 모바일에서 진동이 더 명확하게 느껴집니다</li>
                <li>• <strong>QR 코드:</strong> 스마트폰으로 스캔해서 실제 모바일 환경 테스트</li>
                <li>• <strong>권한 설정:</strong> 알림, 위치, 음성 권한이 필요할 수 있습니다</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
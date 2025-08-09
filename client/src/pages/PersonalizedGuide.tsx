import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEmergency } from "@/hooks/useEmergency";
import { useSpeechService } from "@/services/speechService";
import { useHapticService } from "@/services/hapticService";

export default function PersonalizedGuide() {
  const { generatedGuide } = useEmergency();
  const { speak } = useSpeechService();
  const { vibrate } = useHapticService();

  if (!generatedGuide) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="emergency-card">
          <CardContent className="text-center py-8">
            <i className="fas fa-exclamation-circle text-4xl text-emergency mb-4" aria-hidden="true"></i>
            <h2 className="text-2xl font-bold mb-4">가이드가 없습니다</h2>
            <p className="text-gray-600 mb-6">
              먼저 응급 상황을 설정하고 가이드를 생성해주세요.
            </p>
            <Link href="/emergency">
              <Button className="bg-emergency hover:bg-emergency-dark">
                <i className="fas fa-arrow-left mr-2" aria-hidden="true"></i>
                응급 상황으로 돌아가기
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handlePlayAudio = () => {
    speak(generatedGuide.audioText);
  };

  const handleTriggerHaptic = () => {
    vibrate([100, 50, 100, 50, 100]);
  };

  const handleCall119 = () => {
    window.location.href = 'tel:119';
  };

  const handleContactPartner = () => {
    const message = encodeURIComponent(`긴급상황! 현재 위치에서 도움이 필요합니다.`);
    window.location.href = `sms:010-1234-5678?body=${message}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Guide Header */}
      <Card className="emergency-card mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-emergency">맞춤 안전 가이드</h1>
            <div className="flex space-x-2">
              <Button
                onClick={handlePlayAudio}
                className="p-2 bg-safety hover:bg-green-600 rounded-full"
                title="음성으로 듣기"
              >
                <i className="fas fa-volume-up" aria-hidden="true"></i>
              </Button>
              <Button
                onClick={handleTriggerHaptic}
                className="p-2 bg-warning hover:bg-orange-600 rounded-full"
                title="진동 알림"
              >
                <i className="fas fa-mobile-alt" aria-hidden="true"></i>
              </Button>
            </div>
          </div>
          
          {/* User Context Display */}
          <div className="bg-gray-50 p-3 rounded-lg text-sm">
            <p><strong>상황 분석:</strong> 개인 맞춤형 안전 가이드가 생성되었습니다</p>
          </div>
        </CardContent>
      </Card>

      {/* Generated Guide Content */}
      <div className="emergency-grid">
        
        {/* Primary Actions */}
        <Card className="emergency-card">
          <CardContent className="pt-6">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <span className="w-6 h-6 bg-emergency text-white rounded-full flex items-center justify-center text-sm mr-2">1</span>
              즉시 행동 사항
            </h2>
            <div className="space-y-3 text-gray-700">
              {generatedGuide.guide.primaryActions.map((action, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <i className="fas fa-exclamation-circle text-emergency mt-1" aria-hidden="true"></i>
                  <p>{action}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Safety Precautions */}
        <Card className="emergency-card">
          <CardContent className="pt-6">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <span className="w-6 h-6 bg-warning text-white rounded-full flex items-center justify-center text-sm mr-2">2</span>
              안전 수칙
            </h2>
            <div className="space-y-3 text-gray-700">
              {generatedGuide.guide.safetyTips.map((tip, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <i className="fas fa-shield-alt text-safety mt-1" aria-hidden="true"></i>
                  <p>{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Special Considerations */}
        <Card className="emergency-card border-l-4 border-l-warning">
          <CardContent className="pt-6">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <span className="w-6 h-6 bg-warning text-white rounded-full flex items-center justify-center text-sm mr-2">3</span>
              특별 주의사항
            </h2>
            <div className="space-y-3 text-gray-700">
              {generatedGuide.guide.specialConsiderations.map((consideration, index) => (
                <div key={index} className="bg-yellow-50 p-3 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <i className="fas fa-warning text-warning mt-1" aria-hidden="true"></i>
                    <p>{consideration}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card className="emergency-card">
          <CardContent className="pt-6">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <span className="w-6 h-6 bg-emergency text-white rounded-full flex items-center justify-center text-sm mr-2">4</span>
              긴급 연락
            </h2>
            <div className="space-y-3">
              <Button 
                onClick={handleCall119}
                className="w-full bg-emergency hover:bg-emergency-dark p-3 font-semibold"
              >
                <i className="fas fa-phone mr-2" aria-hidden="true"></i>
                119 신고
              </Button>
              <Button 
                onClick={handleContactPartner}
                className="w-full bg-safety hover:bg-green-600 p-3 font-semibold"
              >
                <i className="fas fa-sms mr-2" aria-hidden="true"></i>
                동행 파트너에게 알리기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation to Map */}
      <div className="mt-6">
        <Link href="/shelters">
          <Button className="w-full bg-safety hover:bg-green-600 py-4 px-6 text-lg">
            <i className="fas fa-map-marker-alt mr-2" aria-hidden="true"></i>
            가까운 대피소 찾기
          </Button>
        </Link>
      </div>
    </div>
  );
}

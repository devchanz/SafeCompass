import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEmergency } from "@/hooks/useEmergency";
import { useSpeechService } from "@/services/speechService";
import { useHapticService } from "@/services/hapticService";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PersonalizedGuide() {
  const { generatedGuide } = useEmergency();
  const { speak } = useSpeechService();
  const { vibrate } = useHapticService();
  const { language } = useLanguage();

  // 하드코딩된 다국어 텍스트
  const getText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      ko: {
        no_guide: '가이드가 없습니다',
        no_guide_desc: '먼저 응급 상황을 설정하고 가이드를 생성해주세요.',
        back_to_emergency: '응급 상황으로 돌아가기',
        personalized_guide: '맞춤 안전 가이드',
        voice_play: '음성으로 듣기',
        vibration_alert: '진동 알림'
      },
      en: {
        no_guide: 'No guide available',
        no_guide_desc: 'Please set up an emergency situation and generate a guide first.',
        back_to_emergency: 'Back to Emergency',
        personalized_guide: 'Personalized Safety Guide',
        voice_play: 'Listen with voice',
        vibration_alert: 'Vibration alert'
      },
      vi: {
        no_guide: 'Không có hướng dẫn',
        no_guide_desc: 'Vui lòng thiết lập tình huống khẩn cấp và tạo hướng dẫn trước.',
        back_to_emergency: 'Quay lại tình huống khẩn cấp',
        personalized_guide: 'Hướng dẫn an toàn cá nhân hóa',
        voice_play: 'Nghe bằng giọng nói',
        vibration_alert: 'Cảnh báo rung'
      },
      zh: {
        no_guide: '没有可用的指南',
        no_guide_desc: '请先设置紧急情况并生成指南。',
        back_to_emergency: '返回紧急情况',
        personalized_guide: '个性化安全指南',
        voice_play: '语音播放',
        vibration_alert: '振动提醒'
      }
    };
    return texts[language]?.[key] || texts['ko'][key] || key;
  };

  if (!generatedGuide) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="emergency-card">
          <CardContent className="text-center py-8">
            <i className="fas fa-exclamation-circle text-4xl text-emergency mb-4" aria-hidden="true"></i>
            <h2 className="text-2xl font-bold mb-4">{getText('no_guide')}</h2>
            <p className="text-gray-600 mb-6">
              {getText('no_guide_desc')}
            </p>
            <Link href="/emergency">
              <Button className="bg-emergency hover:bg-emergency-dark">
                <i className="fas fa-arrow-left mr-2" aria-hidden="true"></i>
{getText('back_to_emergency')}
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
            <h1 className="text-2xl font-bold text-emergency">{getText('personalized_guide')}</h1>
            <div className="flex space-x-2">
              <Button
                onClick={handlePlayAudio}
                className="p-2 bg-safety hover:bg-green-600 rounded-full"
                title={getText('voice_play')}
              >
                <i className="fas fa-volume-up" aria-hidden="true"></i>
              </Button>
              <Button
                onClick={handleTriggerHaptic}
                className="p-2 bg-warning hover:bg-orange-600 rounded-full"
                title={getText('vibration_alert')}
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

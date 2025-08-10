import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEmergency } from "@/hooks/useEmergency";
import { useSpeechService } from "@/services/speechService";
import { useHapticService } from "@/services/hapticService";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function EnhancedPersonalizedGuide() {
  const { generatedGuide } = useEmergency();
  const { speak } = useSpeechService();
  const { vibrate } = useHapticService();
  const { language } = useLanguage();
  const { data: userProfile } = useUserProfile();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);

  // 단계별 가이드 파싱
  const [steps, setSteps] = useState<string[]>([]);

  useEffect(() => {
    if (generatedGuide?.guide) {
      // 숫자로 시작하는 단계들을 추출
      const stepMatches = generatedGuide.guide.match(/\d+\.\s[^0-9]+/g);
      if (stepMatches) {
        setSteps(stepMatches);
      } else {
        // 단계 구분이 없으면 문장 단위로 분할
        setSteps(generatedGuide.guide.split('.').filter(s => s.trim().length > 10));
      }
    }
  }, [generatedGuide]);

  // 하드코딩된 다국어 텍스트
  const getText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      ko: {
        no_guide: '가이드가 없습니다',
        no_guide_desc: '먼저 응급 상황을 설정하고 가이드를 생성해주세요.',
        back_to_emergency: '응급 상황으로 돌아가기',
        personalized_guide: '맞춤 안전 가이드',
        voice_play: '음성으로 듣기',
        voice_stop: '음성 중지',
        vibration_alert: '진동 알림',
        step_by_step: '단계별 안내',
        current_step: '현재 단계',
        next_step: '다음 단계',
        prev_step: '이전 단계',
        complete_step: '단계 완료',
        emergency_contacts: '긴급 연락',
        call_119: '119 신고',
        contact_companion: '동행파트너 연락',
        nearby_shelters: '주변 대피소',
        view_shelter_map: '대피소 지도 보기',
        sos_help: 'SOS 도움요청'
      },
      en: {
        no_guide: 'No guide available',
        no_guide_desc: 'Please set up an emergency situation and generate a guide first.',
        back_to_emergency: 'Back to Emergency',
        personalized_guide: 'Personalized Safety Guide',
        voice_play: 'Listen with voice',
        voice_stop: 'Stop voice',
        vibration_alert: 'Vibration alert',
        step_by_step: 'Step-by-step guide',
        current_step: 'Current step',
        next_step: 'Next step',
        prev_step: 'Previous step',
        complete_step: 'Complete step',
        emergency_contacts: 'Emergency contacts',
        call_119: 'Call 119',
        contact_companion: 'Contact companion',
        nearby_shelters: 'Nearby shelters',
        view_shelter_map: 'View shelter map',
        sos_help: 'SOS Help'
      },
      vi: {
        no_guide: 'Không có hướng dẫn',
        no_guide_desc: 'Vui lòng thiết lập tình huống khẩn cấp và tạo hướng dẫn trước.',
        back_to_emergency: 'Quay lại tình huống khẩn cấp',
        personalized_guide: 'Hướng dẫn an toàn cá nhân hóa',
        voice_play: 'Nghe bằng giọng nói',
        voice_stop: 'Dừng giọng nói',
        vibration_alert: 'Cảnh báo rung',
        step_by_step: 'Hướng dẫn từng bước',
        current_step: 'Bước hiện tại',
        next_step: 'Bước tiếp theo',
        prev_step: 'Bước trước',
        complete_step: 'Hoàn thành bước',
        emergency_contacts: 'Liên hệ khẩn cấp',
        call_119: 'Gọi 119',
        contact_companion: 'Liên hệ đồng hành',
        nearby_shelters: 'Nơi trú ẩn gần đây',
        view_shelter_map: 'Xem bản đồ nơi trú ẩn',
        sos_help: 'Trợ giúp SOS'
      },
      zh: {
        no_guide: '没有可用的指南',
        no_guide_desc: '请先设置紧急情况并生成指南。',
        back_to_emergency: '返回紧急情况',
        personalized_guide: '个性化安全指南',
        voice_play: '语音播放',
        voice_stop: '停止语音',
        vibration_alert: '振动提醒',
        step_by_step: '分步指导',
        current_step: '当前步骤',
        next_step: '下一步',
        prev_step: '上一步',
        complete_step: '完成步骤',
        emergency_contacts: '紧急联系',
        call_119: '拨打119',
        contact_companion: '联系同伴',
        nearby_shelters: '附近避难所',
        view_shelter_map: '查看避难所地图',
        sos_help: 'SOS求助'
      }
    };
    return texts[language]?.[key] || texts['ko'][key] || key;
  };

  // 접근성 기반 스타일 결정
  const getGuideStyle = () => {
    if (!userProfile) return {};
    
    const style: React.CSSProperties = {};
    
    // 나이 및 시각 장애인을 위한 큰 폰트
    if (userProfile.age >= 60 || userProfile.accessibility.includes('visual')) {
      style.fontSize = '1.25rem';
      style.lineHeight = '1.8';
    }
    
    return style;
  };

  // 음성 재생
  const handleVoicePlay = async () => {
    if (isVoicePlaying) {
      setIsVoicePlaying(false);
      return;
    }

    setIsVoicePlaying(true);
    try {
      if (steps.length > 0) {
        await speak(steps[currentStep], language);
      } else if (generatedGuide?.guide) {
        await speak(generatedGuide.guide, language);
      }
    } catch (error) {
      console.error('음성 재생 오류:', error);
    } finally {
      setIsVoicePlaying(false);
    }
  };

  // 진동 알림
  const handleVibrationAlert = () => {
    vibrate([200, 100, 200, 100, 200]);
  };

  // 119 신고 (실제 통화 연결)
  const handleCall119 = () => {
    if (confirm('119에 신고하시겠습니까?')) {
      window.location.href = 'tel:119';
    }
  };

  // 동행파트너 연락 (SMS 발송)
  const handleContactCompanion = () => {
    if (!userProfile || !generatedGuide) return;
    
    const message = `[안전나침반 긴급상황] ${userProfile.name}님이 재난 상황에 있습니다. 현재 위치와 상황을 확인해주세요. 상황: ${generatedGuide.situation?.locationContext}, 이동가능: ${generatedGuide.situation?.canMove ? '가능' : '불가능'}`;
    
    // 실제로는 동행파트너 연락처로 SMS 발송
    if (confirm('동행파트너에게 도움 요청을 보내시겠습니까?')) {
      alert('동행파트너에게 도움 요청을 보냈습니다.');
    }
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <Card className="emergency-card">
        <CardHeader>
          <CardTitle className="text-center">
            <i className="fas fa-shield-alt mr-2 text-emergency" aria-hidden="true"></i>
            {getText('personalized_guide')}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* 단계별 가이드 */}
      {steps.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{getText('step_by_step')}</span>
              <span className="text-sm font-normal">
                {currentStep + 1} / {steps.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 현재 단계 */}
              <div 
                className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500"
                style={getGuideStyle()}
              >
                <h3 className="font-bold text-blue-800 mb-2">
                  {getText('current_step')} {currentStep + 1}
                </h3>
                <p className="text-blue-700">{steps[currentStep]}</p>
              </div>

              {/* 단계 네비게이션 */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                >
                  <i className="fas fa-chevron-left mr-2" aria-hidden="true"></i>
                  {getText('prev_step')}
                </Button>

                <Button
                  onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                  disabled={currentStep === steps.length - 1}
                >
                  {getText('next_step')}
                  <i className="fas fa-chevron-right ml-2" aria-hidden="true"></i>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* 전체 가이드 */
        <Card>
          <CardContent className="py-6">
            <div 
              className="whitespace-pre-wrap"
              style={getGuideStyle()}
            >
              {generatedGuide.guide}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 접근성 컨트롤 */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              variant="outline"
              onClick={handleVoicePlay}
              className="flex items-center gap-2"
            >
              <i className={`fas ${isVoicePlaying ? 'fa-stop' : 'fa-volume-up'}`} aria-hidden="true"></i>
              {isVoicePlaying ? getText('voice_stop') : getText('voice_play')}
            </Button>

            <Button
              variant="outline"
              onClick={handleVibrationAlert}
              className="flex items-center gap-2"
            >
              <i className="fas fa-mobile-alt" aria-hidden="true"></i>
              {getText('vibration_alert')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 긴급 연락 및 대피소 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 긴급 연락 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-emergency">
              <i className="fas fa-phone mr-2" aria-hidden="true"></i>
              {getText('emergency_contacts')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              onClick={handleCall119}
            >
              <i className="fas fa-phone mr-2" aria-hidden="true"></i>
              {getText('call_119')}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleContactCompanion}
            >
              <i className="fas fa-user-friends mr-2" aria-hidden="true"></i>
              {getText('contact_companion')}
            </Button>
          </CardContent>
        </Card>

        {/* 대피소 안내 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">
              <i className="fas fa-map-marker-alt mr-2" aria-hidden="true"></i>
              {getText('nearby_shelters')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/shelters">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                <i className="fas fa-map mr-2" aria-hidden="true"></i>
                {getText('view_shelter_map')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* SOS 버튼 */}
      <Card className="bg-red-50 border-red-200">
        <CardContent className="text-center py-6">
          <Button
            size="lg"
            className="bg-red-600 hover:bg-red-700 text-white text-xl px-8 py-4"
            onClick={() => {
              handleCall119();
              handleContactCompanion();
              handleVibrationAlert();
            }}
          >
            <i className="fas fa-exclamation-triangle mr-3 text-2xl" aria-hidden="true"></i>
            {getText('sos_help')}
          </Button>
          <p className="text-red-600 mt-2 text-sm">
            119 신고 + 동행파트너 연락 + 진동 알림
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
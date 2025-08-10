import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useEmergencySystem } from "@/hooks/useEmergencySystem";

interface PersonalizedGuide {
  guide: {
    primaryActions: string[];
    safetyTips: string[];
    specialConsiderations: string[];
    emergencyContacts: string[];
  };
  audioText: string;
  estimatedReadingTime: number;
}

export default function SimplePersonalizedGuide() {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const { data: userProfile } = useUserProfile();
  const { currentAlert } = useEmergencySystem();
  
  const [isGenerating, setIsGenerating] = useState(true);
  const [generatedGuide, setGeneratedGuide] = useState<PersonalizedGuide | null>(null);

  const getText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      ko: {
        title: '🤖 AI 맞춤형 안전 가이드',
        generating: 'AI가 맞춤형 가이드를 생성하고 있습니다...',
        generated_guide: '생성된 맞춤형 안전 가이드',
        primary_actions: '즉시 행동사항',
        safety_tips: '안전 수칙',
        special_considerations: '특별 주의사항',
        emergency_contacts: '긴급 연락처',
        reading_time: '예상 읽기 시간',
        minutes: '분',
        view_shelters: '주변 대피소 보기',
        call_sos: 'SOS 긴급 연락',
        speak_guide: '음성으로 듣기',
        back_to_emergency: '응급 페이지로 돌아가기',
        disaster_info: '재난 정보',
        user_profile: '사용자 프로필'
      },
      en: {
        title: '🤖 AI Personalized Safety Guide',
        generating: 'AI is generating your personalized guide...',
        generated_guide: 'Generated Personalized Safety Guide',
        primary_actions: 'Immediate Actions',
        safety_tips: 'Safety Tips',
        special_considerations: 'Special Considerations',
        emergency_contacts: 'Emergency Contacts',
        reading_time: 'Estimated Reading Time',
        minutes: 'minutes',
        view_shelters: 'View Nearby Shelters',
        call_sos: 'SOS Emergency Call',
        speak_guide: 'Listen with Voice',
        back_to_emergency: 'Back to Emergency',
        disaster_info: 'Disaster Information',
        user_profile: 'User Profile'
      }
    };
    return texts[language]?.[key] || texts['ko'][key] || key;
  };

  // URL에서 상황 정보 가져오기
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const locationContext = urlParams.get('location') || '집 안';
    const canMove = urlParams.get('canMove') === 'true';

    generatePersonalizedGuide(locationContext, canMove);
  }, []);

  const generatePersonalizedGuide = async (locationContext: string, canMove: boolean) => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/guides/personalized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile: {
            age: userProfile?.age || 30,
            gender: userProfile?.gender || '미상',
            language: language,
            accessibility: userProfile?.accessibility || ['기본 지원'],
            mobility: userProfile?.mobility || '독립적',
            address: userProfile?.address || '대전광역시 유성구'
          },
          situation: {
            disasterType: currentAlert?.data.disasterType || 'earthquake',
            locationContext: locationContext,
            canMove: canMove,
            severity: currentAlert?.data.severity,
            classification: currentAlert?.data.classification,
            magnitude: currentAlert?.data.magnitude,
            location: currentAlert?.data.location
          },
          relevantManuals: [
            '지진 발생 시 행동 요령',
            '실내 대피 방법',
            '긴급 상황 대응 매뉴얼'
          ]
        })
      });
      
      if (!response.ok) throw new Error('가이드 생성 실패');
      
      const result = await response.json();
      setGeneratedGuide(result);
      
      // 가이드 생성 완료시 PUSH 알림 제거
      setTimeout(() => {
        fetch('/api/emergency/mark-completed', { method: 'POST' })
          .then(() => console.log('✅ PUSH 알림 제거됨 - 사용자가 맞춤형 가이드를 받았습니다'))
          .catch(error => console.error('알림 제거 오류:', error));
      }, 1000);
      
    } catch (error) {
      console.error('가이드 생성 오류:', error);
      // 더미 데이터로 대체
      setGeneratedGuide({
        guide: {
          primaryActions: [
            "1단계: 즉시 책상 아래로 몸을 숨기고 '드롭, 커버, 홀드 온' 자세를 취하세요",
            "2단계: 진동이 멈춘 후 가스와 전기를 차단하고 출입구를 확보하세요", 
            "3단계: 계단을 이용하여 건물 밖 안전한 장소로 대피하세요",
            "4단계: 119에 신고하고 가족들에게 안전을 알리세요"
          ],
          safetyTips: [
            "엘리베이터 사용을 금지하고 반드시 계단을 이용하세요",
            "유리창이나 간판 등 낙하물을 주의하며 이동하세요",
            "여진에 대비하여 넓은 공터나 학교 운동장으로 대피하세요"
          ],
          specialConsiderations: [
            `${userProfile?.age}세 연령대: 침착함을 유지하고 무리한 동작을 피하세요`,
            `이동성 ${userProfile?.mobility}: 도움이 필요시 주변에 큰 소리로 구조를 요청하세요`,
            `접근성 지원: 시각/청각 장애가 있는 경우 동반자와 함께 대피하세요`
          ],
          emergencyContacts: [
            "119 (재난신고센터) - 즉시 연락",
            "지역 재난관리본부: 042-270-4119",
            "대전시 통합상황실: 042-270-2500", 
            "가족 비상연락망 활성화"
          ]
        },
        audioText: generateTTSTextFallback(language),
        estimatedReadingTime: 180
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const speakGuide = () => {
    if (generatedGuide?.guide && 'speechSynthesis' in window) {
      // 사용자 언어에 맞는 TTS 텍스트 생성
      const ttsText = generateTTSText(generatedGuide.guide, language);
      
      const utterance = new SpeechSynthesisUtterance(ttsText);
      
      // 언어별 음성 설정
      const languageMap: Record<string, string> = {
        ko: 'ko-KR',
        en: 'en-US', 
        vi: 'vi-VN',
        zh: 'zh-CN'
      };
      
      utterance.lang = languageMap[language] || 'ko-KR';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      speechSynthesis.speak(utterance);
    }
  };

  // 언어별 TTS 텍스트 생성
  const generateTTSText = (guide: any, lang: string): string => {
    const ttsTemplates: Record<string, Record<string, string>> = {
      ko: {
        intro: '지진 발생 시 안전 가이드를 안내합니다.',
        actions: '즉시 행동사항: ',
        safety: '안전 수칙: ',
        contacts: '긴급연락처는 119입니다.'
      },
      en: {
        intro: 'Emergency earthquake safety guide.',
        actions: 'Immediate actions: ',
        safety: 'Safety tips: ',
        contacts: 'Emergency contact: 119.'
      },
      vi: {
        intro: 'Hướng dẫn an toàn động đất khẩn cấp.',
        actions: 'Hành động ngay lập tức: ',
        safety: 'Lời khuyên an toàn: ',
        contacts: 'Liên hệ khẩn cấp: 119.'
      },
      zh: {
        intro: '地震应急安全指南。',
        actions: '立即行动: ',
        safety: '安全提示: ',
        contacts: '紧急联系电话：119。'
      }
    };

    const template = ttsTemplates[lang] || ttsTemplates['ko'];
    
    let ttsText = template.intro + ' ';
    ttsText += template.actions;
    ttsText += guide.primaryActions.slice(0, 2).join('. ') + '. ';
    ttsText += template.safety;
    ttsText += guide.safetyTips.slice(0, 2).join('. ') + '. ';
    ttsText += template.contacts;

    return ttsText;
  };

  // fallback TTS 텍스트 생성
  const generateTTSTextFallback = (lang: string): string => {
    const fallbackTexts: Record<string, string> = {
      ko: '지진이 발생했습니다. 침착하게 안전수칙을 따라주세요. 즉시 안전한 곳으로 대피하세요.',
      en: 'Earthquake detected. Please stay calm and follow safety procedures. Evacuate to safety immediately.',
      vi: 'Phát hiện động đất. Hãy bình tĩnh và tuân theo quy trình an toàn. Sơ tán đến nơi an toàn ngay lập tức.',
      zh: '检测到地震。请保持冷静并遵循安全程序。立即疏散到安全地点。'
    };
    
    return fallbackTexts[lang] || fallbackTexts['ko'];
  };

  const callSOS = () => {
    if (confirm('119에 연결하시겠습니까?')) {
      window.open('tel:119');
    }
  };

  if (isGenerating) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 p-4">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-blue-700 mb-4">{getText('generating')}</h2>
            <p className="text-gray-600">개인 정보와 현재 상황을 분석하여 최적의 대응 방안을 제시합니다.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!generatedGuide) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-green-700">
            <i className="fas fa-check-circle mr-2"></i>
            {getText('generated_guide')}
          </CardTitle>
          <p className="text-gray-600 mt-2">
            {getText('reading_time')}: {Math.ceil(generatedGuide.estimatedReadingTime / 60)} {getText('minutes')}
          </p>
        </CardHeader>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={speakGuide} className="bg-purple-600 hover:bg-purple-700 text-white h-14">
              <i className="fas fa-volume-up mr-2"></i>
              {getText('speak_guide')}
            </Button>
            <Button onClick={() => setLocation('/shelter-map')} className="bg-blue-600 hover:bg-blue-700 text-white h-14">
              <i className="fas fa-map-marked-alt mr-2"></i>
              {getText('view_shelters')}
            </Button>
            <Button onClick={callSOS} className="bg-red-600 hover:bg-red-700 text-white h-14">
              <i className="fas fa-phone-alt mr-2"></i>
              {getText('call_sos')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Guide Content */}
      <div className="space-y-4">
        {/* Primary Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-red-700">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {getText('primary_actions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {generatedGuide.guide.primaryActions.map((action, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="text-gray-800">{action}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Safety Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-blue-700">
              <i className="fas fa-shield-alt mr-2"></i>
              {getText('safety_tips')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {generatedGuide.guide.safetyTips.map((tip, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <i className="fas fa-lightbulb text-blue-500 mt-1 flex-shrink-0"></i>
                  <span className="text-gray-800">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Special Considerations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-orange-700">
              <i className="fas fa-star mr-2"></i>
              {getText('special_considerations')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {generatedGuide.guide.specialConsiderations.map((consideration, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <i className="fas fa-star text-orange-500 mt-1 flex-shrink-0"></i>
                  <span className="text-gray-800">{consideration}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-purple-700">
              <i className="fas fa-phone mr-2"></i>
              {getText('emergency_contacts')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {generatedGuide.guide.emergencyContacts.map((contact, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <i className="fas fa-phone text-purple-500 mt-1 flex-shrink-0"></i>
                  <span className="text-gray-800">{contact}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Back Button */}
      <div className="text-center">
        <Button 
          onClick={() => setLocation('/emergency')}
          variant="outline"
          className="px-8"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          {getText('back_to_emergency')}
        </Button>
      </div>
    </div>
  );
}
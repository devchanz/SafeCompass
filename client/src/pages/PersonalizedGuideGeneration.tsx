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

export default function PersonalizedGuideGeneration() {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const { data: userProfile } = useUserProfile();
  const { currentAlert } = useEmergencySystem();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedGuide, setGeneratedGuide] = useState<PersonalizedGuide | null>(null);
  const [userSituation, setUserSituation] = useState({
    locationContext: '',
    canMove: true,
    additionalInfo: ''
  });
  const [step, setStep] = useState<'input' | 'generating' | 'result'>('input');

  const getText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      ko: {
        title: '🤖 AI 맞춤형 안전 가이드 생성',
        description: '현재 상황과 개인 정보를 바탕으로 최적화된 안전 가이드를 생성합니다',
        current_situation: '현재 상황 정보',
        location_context: '현재 위치',
        mobility_status: '이동 가능성',
        additional_info: '추가 정보',
        can_move: '이동 가능',
        need_help: '도움 필요',
        generate_guide: 'AI 가이드 생성',
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
        title: '🤖 AI Personalized Safety Guide Generation',
        description: 'Generate optimized safety guide based on your current situation and personal information',
        current_situation: 'Current Situation Information',
        location_context: 'Current Location',
        mobility_status: 'Mobility Status',
        additional_info: 'Additional Information',
        can_move: 'Can Move',
        need_help: 'Need Help',
        generate_guide: 'Generate AI Guide',
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

  const generatePersonalizedGuide = async () => {
    setIsGenerating(true);
    setStep('generating');
    
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
            locationContext: userSituation.locationContext,
            canMove: userSituation.canMove,
            severity: currentAlert?.data.severity,
            classification: currentAlert?.data.classification,
            magnitude: currentAlert?.data.magnitude,
            location: currentAlert?.data.location,
            additionalInfo: userSituation.additionalInfo
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
      setStep('result');
      
    } catch (error) {
      console.error('가이드 생성 오류:', error);
      alert('가이드 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  const speakGuide = () => {
    if (generatedGuide?.guide && 'speechSynthesis' in window) {
      // OpenAI에서 실제 생성된 맞춤형 가이드 텍스트를 TTS로 읽기
      const fullGuideText = [
        getText('generated_guide') + '를 안내드리겠습니다.',
        getText('primary_actions') + ':',
        ...generatedGuide.guide.primaryActions,
        getText('safety_tips') + ':',
        ...generatedGuide.guide.safetyTips,
        getText('special_considerations') + ':',
        ...generatedGuide.guide.specialConsiderations
      ].join(' ');
      
      const utterance = new SpeechSynthesisUtterance(fullGuideText);
      
      // 언어별 정확한 음성 설정
      const languageMap: Record<string, string> = {
        ko: 'ko-KR',
        en: 'en-US', 
        vi: 'vi-VN',
        zh: 'zh-CN'
      };
      
      utterance.lang = languageMap[language] || 'ko-KR';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      speechSynthesis.speak(utterance);
    } else if (generatedGuide?.audioText && 'speechSynthesis' in window) {
      // fallback to audioText if guide structure is not available
      const utterance = new SpeechSynthesisUtterance(generatedGuide.audioText);
      utterance.lang = language === 'ko' ? 'ko-KR' : 'en-US';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  const callSOS = () => {
    if (confirm('119에 연결하시겠습니까?')) {
      window.open('tel:119');
    }
  };

  if (step === 'input') {
    return (
      <div className="max-w-4xl mx-auto space-y-6 p-4">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-blue-700">
              {getText('title')}
            </CardTitle>
            <p className="text-gray-600 mt-2">{getText('description')}</p>
          </CardHeader>
        </Card>

        {/* Disaster Information */}
        {currentAlert && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-exclamation-triangle mr-2 text-red-600"></i>
                {getText('disaster_info')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-red-50 rounded-lg">
                  <span className="font-semibold text-red-800">재난 유형:</span>
                  <span className="ml-2">{currentAlert.data.disasterType === 'earthquake' ? '지진' : '화재'}</span>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <span className="font-semibold text-orange-800">심각도:</span>
                  <Badge variant="destructive" className="ml-2">{currentAlert.data.classification}</Badge>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <span className="font-semibold text-yellow-800">위치:</span>
                  <span className="ml-2">{currentAlert.data.location}</span>
                </div>
                {currentAlert.data.magnitude && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <span className="font-semibold text-purple-800">규모:</span>
                    <span className="ml-2">{currentAlert.data.magnitude}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Profile Summary */}
        {userProfile && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-user mr-2 text-blue-600"></i>
                {getText('user_profile')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <i className="fas fa-birthday-cake text-blue-600 mb-2"></i>
                  <div className="text-sm text-gray-600">나이</div>
                  <div className="font-semibold">{userProfile.age}세</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <i className="fas fa-walking text-green-600 mb-2"></i>
                  <div className="text-sm text-gray-600">이동성</div>
                  <div className="font-semibold">{userProfile.mobility}</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <i className="fas fa-universal-access text-purple-600 mb-2"></i>
                  <div className="text-sm text-gray-600">지원</div>
                  <div className="font-semibold">{userProfile.accessibility?.join(', ')}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Situation Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-map-marker-alt mr-2 text-green-600"></i>
              {getText('current_situation')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{getText('location_context')}</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['집 안', '사무실/학교', '길거리/야외', '지하철/버스'].map((loc) => (
                  <Button
                    key={loc}
                    variant={userSituation.locationContext === loc ? "default" : "outline"}
                    onClick={() => setUserSituation(prev => ({ ...prev, locationContext: loc }))}
                    className="h-12 text-sm"
                  >
                    {loc}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">{getText('mobility_status')}</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={userSituation.canMove ? "default" : "outline"}
                  onClick={() => setUserSituation(prev => ({ ...prev, canMove: true }))}
                  className="h-12"
                >
                  <i className="fas fa-walking mr-2"></i>
                  {getText('can_move')}
                </Button>
                <Button
                  variant={!userSituation.canMove ? "default" : "outline"}
                  onClick={() => setUserSituation(prev => ({ ...prev, canMove: false }))}
                  className="h-12"
                >
                  <i className="fas fa-hands-helping mr-2"></i>
                  {getText('need_help')}
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{getText('additional_info')}</label>
              <textarea
                className="w-full p-3 border rounded-lg resize-none"
                rows={3}
                placeholder="부상 상태, 동행자, 특별한 상황 등을 입력해주세요"
                value={userSituation.additionalInfo}
                onChange={(e) => setUserSituation(prev => ({ ...prev, additionalInfo: e.target.value }))}
              />
            </div>

            <Button
              onClick={generatePersonalizedGuide}
              disabled={!userSituation.locationContext || isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 text-lg"
            >
              <i className="fas fa-robot mr-2"></i>
              {getText('generate_guide')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'generating') {
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

  if (step === 'result' && generatedGuide) {
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

  return null;
}
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useEmergencySystem } from "@/hooks/useEmergencySystem";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  
  const [isGenerating, setIsGenerating] = useState(true);
  const [generatedGuide, setGeneratedGuide] = useState<PersonalizedGuide | null>(null);
  const [isSOSOpen, setIsSOSOpen] = useState(false);

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
        user_profile: '사용자 프로필',
        emergency_sos: '긴급 SOS',
        need_help: '도움이 필요한 상황을 알려주세요',
        call_119: '119 신고',
        notify_partner: '동행 파트너에게 알리기',
        cancel: '취소',
        emergency_message: '긴급상황! 현재 위치에서 도움이 필요합니다.',
        location_sent: '위치 정보와 함께 긴급 알림을 전송했습니다',
        no_partner: '등록된 동행 파트너가 없습니다. 프로필에서 추가하세요.',
        gps_getting: 'GPS 위치 확인 중...',
        registered_partner: '등록된 파트너'
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
        user_profile: 'User Profile',
        emergency_sos: 'Emergency SOS',
        need_help: 'Report emergency situation',
        call_119: 'Call 119',
        notify_partner: 'Notify Emergency Partner',
        cancel: 'Cancel',
        emergency_message: 'EMERGENCY! Need help at my current location.',
        location_sent: 'Emergency alert sent with location information',
        no_partner: 'No emergency partner registered. Add one in your profile.',
        gps_getting: 'Getting GPS location...',
        registered_partner: 'Registered Partner'
      },
      vi: {
        title: '🤖 Hướng dẫn An toàn Cá nhân hóa AI',
        generating: 'AI đang tạo hướng dẫn cá nhân hóa...',
        generated_guide: 'Hướng dẫn An toàn Cá nhân hóa Đã Tạo',
        primary_actions: 'Hành động Ngay lập tức',
        safety_tips: 'Mẹo An toàn',
        special_considerations: 'Lưu ý Đặc biệt',
        emergency_contacts: 'Liên lạc Khẩn cấp',
        reading_time: 'Thời gian Đọc Dự kiến',
        minutes: 'phút',
        view_shelters: 'Xem Nơi Trú ẩn Gần đây',
        call_sos: 'Gọi SOS Khẩn cấp',
        speak_guide: 'Nghe bằng Giọng nói',
        back_to_emergency: 'Quay lại Khẩn cấp',
        disaster_info: 'Thông tin Thảm họa',
        user_profile: 'Hồ sơ Người dùng',
        emergency_sos: 'SOS Khẩn cấp',
        need_help: 'Báo cáo tình huống khẩn cấp',
        call_119: 'Gọi 119',
        notify_partner: 'Thông báo Đối tác Khẩn cấp',
        cancel: 'Hủy',
        emergency_message: 'KHẨN CẤP! Cần trợ giúp tại vị trí hiện tại.',
        location_sent: 'Cảnh báo khẩn cấp đã được gửi cùng thông tin vị trí',
        no_partner: 'Chưa đăng ký đối tác khẩn cấp. Thêm trong hồ sơ của bạn.',
        gps_getting: 'Đang lấy vị trí GPS...',
        registered_partner: 'Đối tác Đã đăng ký'
      },
      zh: {
        title: '🤖 AI个性化安全指南',
        generating: 'AI正在生成您的个性化指南...',
        generated_guide: '生成的个性化安全指南',
        primary_actions: '立即行动',
        safety_tips: '安全提示',
        special_considerations: '特别注意事项',
        emergency_contacts: '紧急联系方式',
        reading_time: '预计阅读时间',
        minutes: '分钟',
        view_shelters: '查看附近避难所',
        call_sos: 'SOS紧急呼叫',
        speak_guide: '语音播放',
        back_to_emergency: '返回紧急页面',
        disaster_info: '灾难信息',
        user_profile: '用户资料',
        emergency_sos: '紧急SOS',
        need_help: '报告紧急情况',
        call_119: '拨打119',
        notify_partner: '通知紧急联系人',
        cancel: '取消',
        emergency_message: '紧急情况！当前位置需要帮助。',
        location_sent: '已发送紧急警报和位置信息',
        no_partner: '未注册紧急联系人。请在个人资料中添加。',
        gps_getting: '正在获取GPS位置...',
        registered_partner: '已注册联系人'
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
      // 사용자 언어에 맞는 완전 번역된 TTS 텍스트 생성
      const ttsText = generateFullyTranslatedTTS(generatedGuide.guide, language);
      
      const utterance = new SpeechSynthesisUtterance(ttsText);
      
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

  // 완전히 번역된 TTS 텍스트 생성
  const generateFullyTranslatedTTS = (guide: any, lang: string): string => {
    const fullyTranslatedGuides: Record<string, any> = {
      ko: {
        intro: '지진 발생 상황에 맞는 안전 가이드를 알려드립니다.',
        primaryActions: [
          "첫 번째로 즉시 책상 아래나 단단한 구조물 아래로 몸을 숨기고 드롭 커버 홀드 온 자세를 취하십시오",
          "두 번째로 진동이 멈춘 후 가스와 전기를 차단하고 출입구를 확보하십시오",
          "세 번째로 엘리베이터를 절대 사용하지 말고 계단을 이용하여 건물 밖 안전한 장소로 대피하십시오"
        ],
        safetyTips: [
          "엘리베이터 사용을 금지하고 반드시 계단만 이용하여 대피하십시오",
          "유리창이나 간판 등 낙하물을 주의하며 이동하고 머리를 보호하십시오"
        ],
        contacts: "긴급상황 발생 시 일일구 번에 즉시 신고하시기 바랍니다"
      },
      en: {
        intro: 'I will provide you with earthquake safety guidance for your current situation.',
        primaryActions: [
          "First, immediately take cover under a desk or sturdy structure and assume the Drop Cover and Hold On position",
          "Second, after shaking stops, shut off gas and electricity and secure all exits",
          "Third, never use elevators and use stairs only to evacuate to a safe location outside the building"
        ],
        safetyTips: [
          "Never use elevators and always use stairs only for evacuation",
          "Watch for falling objects like glass and signs while moving and protect your head"
        ],
        contacts: "Please call one one nine immediately in emergency situations"
      },
      vi: {
        intro: 'Tôi sẽ cung cấp cho bạn hướng dẫn an toàn động đất phù hợp với tình huống hiện tại.',
        primaryActions: [
          "Đầu tiên, ngay lập tức trú ẩn dưới bàn hoặc cấu trúc chắc chắn và thực hiện tư thế Cúi Che và Giữ chặt",
          "Thứ hai, sau khi rung lắc dừng, tắt gas và điện và đảm bảo tất cả lối thoát",
          "Thứ ba, không bao giờ sử dụng thang máy và chỉ sử dụng cầu thang để sơ tán đến vị trí an toàn bên ngoài tòa nhà"
        ],
        safetyTips: [
          "Không bao giờ sử dụng thang máy và luôn chỉ sử dụng cầu thang để sơ tán",
          "Cẩn thận các vật thể rơi như kính và biển hiệu khi di chuyển và bảo vệ đầu của bạn"
        ],
        contacts: "Vui lòng gọi một một chín ngay lập tức trong các tình huống khẩn cấp"
      },
      zh: {
        intro: '我将为您提供适合当前情况的地震安全指导。',
        primaryActions: [
          "首先，立即躲到桌子下或坚固的结构下，采取蹲下掩护抓紧的姿势",
          "其次，震动停止后，关闭煤气和电源，确保所有出口畅通",
          "第三，绝不使用电梯，只使用楼梯疏散到建筑物外的安全地点"
        ],
        safetyTips: [
          "绝不使用电梯，疏散时只能使用楼梯",
          "移动时注意玻璃和招牌等坠落物体，保护好头部"
        ],
        contacts: "紧急情况下请立即拨打一一九"
      }
    };

    const translated = fullyTranslatedGuides[lang] || fullyTranslatedGuides['ko'];
    
    let ttsText = translated.intro + ' ';
    ttsText += translated.primaryActions.slice(0, 3).join('. ') + '. ';
    ttsText += translated.safetyTips.slice(0, 2).join('. ') + '. ';
    ttsText += translated.contacts;

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

  const handleCall119 = () => {
    // 진동과 함께 119 연결
    if (navigator.vibrate) {
      navigator.vibrate([300, 100, 300, 100, 300]);
    }
    window.location.href = 'tel:119';
    setIsSOSOpen(false);
  };

  const handleContactPartner = async () => {
    // 사용자 프로필에서 파트너 정보 확인
    if (!userProfile?.partner?.phone) {
      toast({
        title: "⚠️ " + getText('no_partner'),
        variant: "destructive",
        duration: 4000,
      });
      return;
    }

    try {
      // GPS 위치 가져오기
      toast({
        title: "📍 " + getText('gps_getting'),
      });

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // 위치 정보 포함한 긴급 메시지
          const emergencyMessage = `${getText('emergency_message')} 
위치: https://maps.google.com/maps?q=${lat},${lng}
좌표: ${lat.toFixed(6)}, ${lng.toFixed(6)}
시간: ${new Date().toLocaleString()}`;

          const encodedMessage = encodeURIComponent(emergencyMessage);
          
          // SMS 전송
          window.location.href = `sms:${userProfile.partner.phone}?body=${encodedMessage}`;
          
          // 성공 토스트
          toast({
            title: "✅ " + getText('location_sent'),
            description: `${userProfile.partner.name} (${userProfile.partner.phone})`,
            duration: 5000,
          });

          // 진동 피드백
          if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          }
        },
        (error) => {
          console.error('위치 정보 오류:', error);
          // 위치 없이도 전송
          const basicMessage = getText('emergency_message');
          const encodedMessage = encodeURIComponent(basicMessage + ` 시간: ${new Date().toLocaleString()}`);
          window.location.href = `sms:${userProfile.partner.phone}?body=${encodedMessage}`;
          
          toast({
            title: "📱 긴급 알림 전송됨",
            description: "위치 정보 없이 전송되었습니다",
            duration: 3000,
          });
        }
      );
    } catch (error) {
      console.error('파트너 연락 오류:', error);
      toast({
        title: "❌ 전송 실패",
        description: "다시 시도해주세요",
        variant: "destructive",
        duration: 3000,
      });
    }
    
    setIsSOSOpen(false);
  };

  const openSOSDialog = () => {
    setIsSOSOpen(true);
    
    // Trigger strong vibration for attention
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
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
            <Button onClick={openSOSDialog} className="bg-red-600 hover:bg-red-700 text-white h-14">
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

      {/* Navigation Buttons */}
      <div className="text-center space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => setLocation('/')}
            className="bg-green-600 hover:bg-green-700 text-white px-8"
          >
            <i className="fas fa-home mr-2"></i>
            홈 대시보드
          </Button>
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

      {/* SOS Dialog */}
      <Dialog open={isSOSOpen} onOpenChange={setIsSOSOpen}>
        <DialogContent className="max-w-md w-full mx-4">
          <DialogHeader>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <i className="fas fa-exclamation-triangle text-2xl" aria-hidden="true"></i>
              </div>
              <DialogTitle className="text-2xl font-bold text-red-600 mb-2">{getText('emergency_sos')}</DialogTitle>
              <p className="text-gray-600 mb-6">{getText('need_help')}</p>
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* 파트너 정보 표시 */}
            {userProfile?.partner?.name && (
              <Alert className="bg-blue-50 border-blue-200">
                <i className="fas fa-user-friends text-blue-600" aria-hidden="true"></i>
                <AlertDescription>
                  <strong>{getText('registered_partner')}:</strong><br />
                  {userProfile.partner.name} ({userProfile.partner.phone})
                </AlertDescription>
              </Alert>
            )}
            
            <Button 
              onClick={handleCall119}
              className="w-full bg-red-600 hover:bg-red-700 py-3 px-4 font-semibold"
            >
              <i className="fas fa-phone mr-2" aria-hidden="true"></i>
              {getText('call_119')}
            </Button>
            
            <Button 
              onClick={handleContactPartner}
              className="w-full bg-green-600 hover:bg-green-700 py-3 px-4 font-semibold"
              disabled={!userProfile?.partner?.phone}
            >
              <i className="fas fa-sms mr-2" aria-hidden="true"></i>
              {getText('notify_partner')}
            </Button>
            
            <Button 
              onClick={() => setIsSOSOpen(false)}
              variant="outline"
              className="w-full py-3 px-4 font-semibold"
            >
              {getText('cancel')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
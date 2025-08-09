import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEmergency } from "@/hooks/useEmergency";
import { useEmergencyNotification } from "@/hooks/useEmergencyNotification";
import { useLanguage } from "@/contexts/LanguageContext";

export default function EmergencyAlert() {
  const [, setLocation] = useLocation();
  const [locationContext, setLocationContext] = useState<string>("");
  const [canMove, setCanMove] = useState<boolean>(true);
  const { generateGuide } = useEmergency();
  const { currentAlert, markAlertAsRead } = useEmergencyNotification();
  const { language } = useLanguage();

  // 하드코딩된 다국어 텍스트
  const getText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      ko: {
        earthquake_detected: '지진이 감지되었습니다!',
        title: '현재 어디에 계신가요?',
        location_question: '현재 위치',
        location_home: '집 안\n(거실/침실)',
        location_office: '사무실/학교',
        location_outdoor: '길거리/야외',
        location_transport: '지하철/버스',
        mobility_question: '대피할 수 있나요?',
        mobility_yes: '예, 걸어서 대피할 수 있습니다',
        mobility_no: '아니요, 도움이 필요합니다',
        generate_guide: '맞춤형 가이드 생성',
        loading: '생성 중...',
        select_location: '위치를 선택해주세요',
        magnitude: '규모',
        earthquake: '지진',
        occurrence_time: '발생시간'
      },
      en: {
        earthquake_detected: 'Earthquake detected!',
        title: 'Where are you currently?',
        location_question: 'Current Location',
        location_home: 'At Home\n(Living/Bedroom)',
        location_office: 'Office/School',
        location_outdoor: 'Street/Outdoor',
        location_transport: 'Subway/Bus',
        mobility_question: 'Can you evacuate?',
        mobility_yes: 'Yes, I can walk and evacuate',
        mobility_no: 'No, I need assistance',
        generate_guide: 'Generate Personalized Guide',
        loading: 'Generating...',
        select_location: 'Please select your location',
        magnitude: 'Magnitude',
        earthquake: 'Earthquake',
        occurrence_time: 'Occurrence Time'
      },
      vi: {
        earthquake_detected: 'Phát hiện động đất!',
        title: 'Bạn hiện đang ở đâu?',
        location_question: 'Vị trí hiện tại',
        location_home: 'Ở nhà\n(Phòng khách/Ngủ)',
        location_office: 'Văn phòng/Trường học',
        location_outdoor: 'Đường phố/Ngoài trời',
        location_transport: 'Tàu điện ngầm/Xe buýt',
        mobility_question: 'Bạn có thể sơ tán không?',
        mobility_yes: 'Có, tôi có thể đi bộ và sơ tán',
        mobility_no: 'Không, tôi cần hỗ trợ',
        generate_guide: 'Tạo hướng dẫn cá nhân hóa',
        loading: 'Đang tạo...',
        select_location: 'Vui lòng chọn vị trí của bạn',
        magnitude: 'Cường độ',
        earthquake: 'Động đất',
        occurrence_time: 'Thời gian xảy ra'
      },
      zh: {
        earthquake_detected: '检测到地震！',
        title: '您目前在哪里？',
        location_question: '当前位置',
        location_home: '在家\n(客厅/卧室)',
        location_office: '办公室/学校',
        location_outdoor: '街道/户外',
        location_transport: '地铁/公交车',
        mobility_question: '您能撤离吗？',
        mobility_yes: '是的，我可以步行撤离',
        mobility_no: '不，我需要帮助',
        generate_guide: '生成个性化指南',
        loading: '生成中...',
        select_location: '请选择您的位置',
        magnitude: '震级',
        earthquake: '地震',
        occurrence_time: '发生时间'
      }
    };
    return texts[language]?.[key] || texts['ko'][key] || key;
  };

  useEffect(() => {
    // Mark alert as read when user enters the emergency page
    markAlertAsRead();
  }, [markAlertAsRead]);

  const handleGenerateGuide = async () => {
    if (!locationContext) {
      alert(getText('select_location'));
      return;
    }

    try {
      await generateGuide.mutateAsync({
        locationContext,
        canMove,
      });
      setLocation("/guide");
    } catch (error) {
      console.error("Guide generation failed:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Emergency Alert Header */}
      <Card className="emergency-card bg-emergency text-white mb-6 emergency-pulse">
        <CardContent className="pt-6 text-center">
          <i className="fas fa-exclamation-triangle text-6xl mb-4" aria-hidden="true"></i>
          <h1 className="text-3xl font-bold mb-2">{getText('earthquake_detected')}</h1>
          {currentAlert && (
            <>
              <p className="text-lg">
                {currentAlert.type === 'earthquake' ? 
                  `${currentAlert.magnitude ? `${getText('magnitude')} ${currentAlert.magnitude}` : ''} ${getText('earthquake')}` : 
                  currentAlert.type} - {currentAlert.location}
              </p>
              <p className="text-sm mt-2">
                {getText('occurrence_time')}: <span>{new Date(currentAlert.timestamp).toLocaleString()}</span>
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Current Status Input */}
      <Card className="emergency-card mb-6">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-emergency">
{getText('title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-lg font-semibold mb-3 block">
{getText('location_question')}
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={locationContext === "집 안 (거실/침실)" ? "default" : "outline"}
                className="h-16 flex flex-col items-center justify-center text-sm"
                onClick={() => setLocationContext("집 안 (거실/침실)")}
              >
                <i className="fas fa-home text-xl mb-1" aria-hidden="true"></i>
{getText('location_home')}
              </Button>
              <Button
                variant={locationContext === "사무실/학교" ? "default" : "outline"}
                className="h-16 flex flex-col items-center justify-center text-sm"
                onClick={() => setLocationContext("사무실/학교")}
              >
                <i className="fas fa-building text-xl mb-1" aria-hidden="true"></i>
{getText('location_office')}
              </Button>
              <Button
                variant={locationContext === "길거리/야외" ? "default" : "outline"}
                className="h-16 flex flex-col items-center justify-center text-sm"
                onClick={() => setLocationContext("길거리/야외")}
              >
                <i className="fas fa-road text-xl mb-1" aria-hidden="true"></i>
{getText('location_outdoor')}
              </Button>
              <Button
                variant={locationContext === "지하철/버스" ? "default" : "outline"}
                className="h-16 flex flex-col items-center justify-center text-sm"
                onClick={() => setLocationContext("지하철/버스")}
              >
                <i className="fas fa-subway text-xl mb-1" aria-hidden="true"></i>
{getText('location_transport')}
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-lg font-semibold mb-3 block">
{getText('mobility_question')}
            </Label>
            <div className="grid grid-cols-1 gap-3">
              <Button
                variant={canMove ? "default" : "outline"}
                className="h-16 flex items-center justify-center text-base"
                onClick={() => setCanMove(true)}
              >
                <i className="fas fa-walking text-xl mr-3 text-green-600" aria-hidden="true"></i>
{getText('mobility_yes')}
              </Button>
              <Button
                variant={!canMove ? "default" : "outline"}
                className="h-16 flex items-center justify-center text-base"
                onClick={() => setCanMove(false)}
              >
                <i className="fas fa-wheelchair text-xl mr-3 text-red-600" aria-hidden="true"></i>
{getText('mobility_no')}
              </Button>
            </div>
          </div>

          <Button 
            onClick={handleGenerateGuide}
            className="w-full bg-emergency hover:bg-emergency/90 text-white text-lg py-3"
            disabled={generateGuide.isPending}
          >
            {generateGuide.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i>
{getText('loading')}
              </>
            ) : (
              <>
                <i className="fas fa-compass mr-2" aria-hidden="true"></i>
{getText('generate_guide')}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";

export default function EarthquakeManual() {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("prevention");

  const getText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      ko: {
        title: '지진 대응 매뉴얼',
        subtitle: '지진 발생 전 예방과 대응 방법',
        back_to_manuals: '매뉴얼 목록으로',
        prevention: '지진 예방',
        response: '지진 대응',
        assistance: '도움 요청',
        visual_disability: '시각 장애인',
        mobility_disability: '이동 불편자',
        wheelchair: '휠체어 사용자',
        hearing_disability: '청각 장애인',
        prevention_title: '지진 발생 전 예방 준비',
        response_title: '지진 발생 시 대응 방법',
        assistance_title: '도움 요청 및 구조 요청',
        emergency_kit: '비상용품 준비',
        evacuation_plan: '대피 계획 수립',
        furniture_securing: '가구 고정',
        gas_electricity: '가스/전기 차단 방법',
        drop_cover_hold: '엎드리기-숨기기-잡기',
        evacuation_routes: '대피 경로 확인',
        emergency_contacts: '긴급 연락처',
        sos_button: 'SOS 버튼 사용법',
        partner_contact: '동행 파트너 연락',
        visual_guide: '시각 장애인을 위한 지진 대응 가이드',
        visual_prevention: '시각 장애인 지진 예방',
        visual_response: '시각 장애인 지진 대응',
        visual_assistance: '시각 장애인 도움 요청',
        mobility_guide: '이동 불편자를 위한 지진 대응 가이드',
        mobility_prevention: '이동 불편자 지진 예방',
        mobility_response: '이동 불편자 지진 대응',
        mobility_assistance: '이동 불편자 도움 요청',
        wheelchair_guide: '휠체어 사용자를 위한 지진 대응 가이드',
        wheelchair_prevention: '휠체어 사용자 지진 예방',
        wheelchair_response: '휠체어 사용자 지진 대응',
        wheelchair_assistance: '휠체어 사용자 도움 요청',
        hearing_guide: '청각 장애인을 위한 지진 대응 가이드',
        hearing_prevention: '청각 장애인 지진 예방',
        hearing_response: '청각 장애인 지진 대응',
        hearing_assistance: '청각 장애인 도움 요청'
      },
      en: {
        title: 'Earthquake Response Manual',
        subtitle: 'Prevention and response methods before earthquake',
        back_to_manuals: 'Back to Manuals',
        prevention: 'Earthquake Prevention',
        response: 'Earthquake Response',
        assistance: 'Request Help',
        visual_disability: 'Visual Disability',
        mobility_disability: 'Mobility Impaired',
        wheelchair: 'Wheelchair User',
        hearing_disability: 'Hearing Disability',
        prevention_title: 'Prevention preparation before earthquake',
        response_title: 'Response methods during earthquake',
        assistance_title: 'Help request and rescue request',
        emergency_kit: 'Emergency kit preparation',
        evacuation_plan: 'Evacuation plan establishment',
        furniture_securing: 'Furniture securing',
        gas_electricity: 'Gas/electricity cutoff method',
        drop_cover_hold: 'Drop-Cover-Hold',
        evacuation_routes: 'Evacuation route confirmation',
        emergency_contacts: 'Emergency contacts',
        sos_button: 'SOS button usage',
        partner_contact: 'Partner contact',
        visual_guide: 'Earthquake Response Guide for Visual Disabilities',
        visual_prevention: 'Visual Disability Earthquake Prevention',
        visual_response: 'Visual Disability Earthquake Response',
        visual_assistance: 'Visual Disability Help Request',
        mobility_guide: 'Earthquake Response Guide for Mobility Impaired',
        mobility_prevention: 'Mobility Impaired Earthquake Prevention',
        mobility_response: 'Mobility Impaired Earthquake Response',
        mobility_assistance: 'Mobility Impaired Help Request',
        wheelchair_guide: 'Earthquake Response Guide for Wheelchair Users',
        wheelchair_prevention: 'Wheelchair User Earthquake Prevention',
        wheelchair_response: 'Wheelchair User Earthquake Response',
        wheelchair_assistance: 'Wheelchair User Help Request',
        hearing_guide: 'Earthquake Response Guide for Hearing Disabilities',
        hearing_prevention: 'Hearing Disability Earthquake Prevention',
        hearing_response: 'Hearing Disability Earthquake Response',
        hearing_assistance: 'Hearing Disability Help Request'
      },
      vi: {
        title: 'Sổ Tay Ứng Phó Động Đất',
        subtitle: 'Phương pháp phòng ngừa và ứng phó trước động đất',
        back_to_manuals: 'Quay lại Sổ tay',
        prevention: 'Phòng ngừa động đất',
        response: 'Ứng phó động đất',
        assistance: 'Yêu cầu trợ giúp',
        visual_disability: 'Khiếm thị',
        mobility_disability: 'Vận động khó khăn',
        wheelchair: 'Người dùng xe lăn',
        hearing_disability: 'Khiếm thính',
        prevention_title: 'Chuẩn bị phòng ngừa trước động đất',
        response_title: 'Phương pháp ứng phó khi động đất',
        assistance_title: 'Yêu cầu trợ giúp và cứu hộ',
        emergency_kit: 'Chuẩn bị đồ dùng khẩn cấp',
        evacuation_plan: 'Lập kế hoạch sơ tán',
        furniture_securing: 'Cố định đồ đạc',
        gas_electricity: 'Phương pháp cắt gas/điện',
        drop_cover_hold: 'Nằm xuống-Che chắn-Giữ chặt',
        evacuation_routes: 'Xác nhận đường sơ tán',
        emergency_contacts: 'Liên lạc khẩn cấp',
        sos_button: 'Cách sử dụng nút SOS',
        partner_contact: 'Liên lạc đối tác',
        visual_guide: 'Hướng dẫn ứng phó động đất cho người khiếm thị',
        visual_prevention: 'Phòng ngừa động đất cho người khiếm thị',
        visual_response: 'Ứng phó động đất cho người khiếm thị',
        visual_assistance: 'Yêu cầu trợ giúp cho người khiếm thị',
        mobility_guide: 'Hướng dẫn ứng phó động đất cho người vận động khó khăn',
        mobility_prevention: 'Phòng ngừa động đất cho người vận động khó khăn',
        mobility_response: 'Ứng phó động đất cho người vận động khó khăn',
        mobility_assistance: 'Yêu cầu trợ giúp cho người vận động khó khăn',
        wheelchair_guide: 'Hướng dẫn ứng phó động đất cho người dùng xe lăn',
        wheelchair_prevention: 'Phòng ngừa động đất cho người dùng xe lăn',
        wheelchair_response: 'Ứng phó động đất cho người dùng xe lăn',
        wheelchair_assistance: 'Yêu cầu trợ giúp cho người dùng xe lăn',
        hearing_guide: 'Hướng dẫn ứng phó động đất cho người khiếm thính',
        hearing_prevention: 'Phòng ngừa động đất cho người khiếm thính',
        hearing_response: 'Ứng phó động đất cho người khiếm thính',
        hearing_assistance: 'Yêu cầu trợ giúp cho người khiếm thính'
      },
      zh: {
        title: '地震应对手册',
        subtitle: '地震发生前预防和应对方法',
        back_to_manuals: '返回手册列表',
        prevention: '地震预防',
        response: '地震应对',
        assistance: '求助请求',
        visual_disability: '视觉障碍',
        mobility_disability: '行动不便',
        wheelchair: '轮椅使用者',
        hearing_disability: '听觉障碍',
        prevention_title: '地震发生前预防准备',
        response_title: '地震发生时应对方法',
        assistance_title: '求助请求和救援请求',
        emergency_kit: '应急用品准备',
        evacuation_plan: '避难计划制定',
        furniture_securing: '家具固定',
        gas_electricity: '燃气/电力切断方法',
        drop_cover_hold: '趴下-掩护-抓牢',
        evacuation_routes: '避难路线确认',
        emergency_contacts: '紧急联系方式',
        sos_button: 'SOS按钮使用方法',
        partner_contact: '同行伙伴联系',
        visual_guide: '视觉障碍者地震应对指南',
        visual_prevention: '视觉障碍者地震预防',
        visual_response: '视觉障碍者地震应对',
        visual_assistance: '视觉障碍者求助请求',
        mobility_guide: '行动不便者地震应对指南',
        mobility_prevention: '行动不便者地震预防',
        mobility_response: '行动不便者地震应对',
        mobility_assistance: '行动不便者求助请求',
        wheelchair_guide: '轮椅使用者地震应对指南',
        wheelchair_prevention: '轮椅使用者地震预防',
        wheelchair_response: '轮椅使用者地震应对',
        wheelchair_assistance: '轮椅使用者求助请求',
        hearing_guide: '听觉障碍者地震应对指南',
        hearing_prevention: '听觉障碍者地震预防',
        hearing_response: '听觉障碍者地震应对',
        hearing_assistance: '听觉障碍者求助请求'
      }
    };
    
    return texts[language]?.[key] || texts['ko'][key] || key;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {getText('title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {getText('subtitle')}
              </p>
            </div>
            <Button 
              onClick={() => setLocation('/emergency-manuals')}
              variant="outline"
              className="rounded-full"
            >
              <i className="fas fa-arrow-left mr-2" aria-hidden="true"></i>
              {getText('back_to_manuals')}
            </Button>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="prevention" className="text-sm">
              {getText('prevention')}
            </TabsTrigger>
            <TabsTrigger value="response" className="text-sm">
              {getText('response')}
            </TabsTrigger>
            <TabsTrigger value="assistance" className="text-sm">
              {getText('assistance')}
            </TabsTrigger>
          </TabsList>

          {/* Prevention Tab */}
          <TabsContent value="prevention" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  {getText('prevention_title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      {getText('emergency_kit')}
                    </h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• 비상용품 가방 준비</li>
                      <li>• 물, 식량, 의약품</li>
                      <li>• 손전등, 배터리</li>
                      <li>• 휴대폰 충전기</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                      {getText('evacuation_plan')}
                    </h4>
                    <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                      <li>• 가족과 대피 장소 약속</li>
                      <li>• 대피 경로 미리 확인</li>
                      <li>• 비상 연락처 준비</li>
                      <li>• 정기적인 대피 훈련</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Response Tab */}
          <TabsContent value="response" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  {getText('response_title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                      {getText('drop_cover_hold')}
                    </h4>
                    <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                      <li>• 엎드리기: 바닥에 엎드리기</li>
                      <li>• 숨기기: 튼튼한 책상 아래</li>
                      <li>• 잡기: 책상 다리 잡기</li>
                      <li>• 흔들림이 멈출 때까지 대기</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                      {getText('evacuation_routes')}
                    </h4>
                    <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1">
                      <li>• 계단 이용 (엘리베이터 금지)</li>
                      <li>• 건물 밖으로 대피</li>
                      <li>• 넓은 공간으로 이동</li>
                      <li>• 낙하물 주의</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assistance Tab */}
          <TabsContent value="assistance" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  {getText('assistance_title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                      {getText('sos_button')}
                    </h4>
                    <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                      <li>• 앱 내 SOS 버튼 클릭</li>
                      <li>• 119 자동 연결</li>
                      <li>• 동행 파트너에게 알림</li>
                      <li>• GPS 위치 정보 전송</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
                      {getText('emergency_contacts')}
                    </h4>
                    <ul className="text-sm text-indigo-800 dark:text-indigo-200 space-y-1">
                      <li>• 119: 소방서/구조</li>
                      <li>• 112: 경찰서</li>
                      <li>• 1588-3650: 재난신고</li>
                      <li>• 동행 파트너 연락처</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Accessibility Specific Guides */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            접근성별 맞춤 가이드
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Visual Disability */}
            <Card className="shadow-lg border-0 bg-white dark:bg-gray-800 hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <span className="text-2xl mr-2">👁️</span>
                  {getText('visual_disability')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {getText('visual_guide')}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setActiveTab('prevention')}
                >
                  자세히 보기
                </Button>
              </CardContent>
            </Card>

            {/* Mobility Disability */}
            <Card className="shadow-lg border-0 bg-white dark:bg-gray-800 hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <span className="text-2xl mr-2">🚶</span>
                  {getText('mobility_disability')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {getText('mobility_guide')}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setActiveTab('response')}
                >
                  자세히 보기
                </Button>
              </CardContent>
            </Card>

            {/* Wheelchair */}
            <Card className="shadow-lg border-0 bg-white dark:bg-gray-800 hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <span className="text-2xl mr-2">♿</span>
                  {getText('wheelchair')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {getText('wheelchair_guide')}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setActiveTab('assistance')}
                >
                  자세히 보기
                </Button>
              </CardContent>
            </Card>

            {/* Hearing Disability */}
            <Card className="shadow-lg border-0 bg-white dark:bg-gray-800 hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <span className="text-2xl mr-2">🦻</span>
                  {getText('hearing_disability')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {getText('hearing_guide')}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setActiveTab('prevention')}
                >
                  자세히 보기
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

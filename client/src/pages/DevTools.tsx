import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEmergencySystem } from "@/hooks/useEmergencySystem";
import { clearBrowserCache, forcePageReload, resetUserSession, debugStorageState } from "@/utils/cacheUtils";
import DemoAccessibilityButton from "@/components/DemoAccessibilityButton";

export default function DevTools() {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const { triggerEmergencyDemo } = useEmergencySystem();

  const getText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      ko: {
        title: '개발 도구',
        subtitle: '앱 개발 및 테스트를 위한 도구들',
        back_to_dashboard: '대시보드로 돌아가기',
        disaster_simulation: '재난 시뮬레이션',
        disaster_simulation_desc: '개인화된 접근성 알림 포함',
        new_user_registration: '새 사용자 등록',
        clear_cache: '캐시 정리',
        reload_page: '새로고침',
        vibration_test: '진동 테스트 도구',
        flashlight_test: '플래시라이트 테스트 도구',
        disaster_message_check: '최신 재난문자 확인',
        accessibility_demo: '접근성 알림 데모',
        emergency_simulation: '긴급 상황 시뮬레이션',
        emergency_simulation_desc: '재난 대응 시스템 테스트',
        user_management: '사용자 관리',
        user_management_desc: '사용자 등록 및 프로필 관리',
        system_tools: '시스템 도구',
        system_tools_desc: '캐시 정리 및 페이지 새로고침',
        accessibility_tools: '접근성 도구',
        accessibility_tools_desc: '진동, 플래시라이트, 접근성 테스트'
      },
      en: {
        title: 'Development Tools',
        subtitle: 'Tools for app development and testing',
        back_to_dashboard: 'Back to Dashboard',
        disaster_simulation: 'Disaster Simulation',
        disaster_simulation_desc: 'Including personalized accessibility alerts',
        new_user_registration: 'New User Registration',
        clear_cache: 'Clear Cache',
        reload_page: 'Reload Page',
        vibration_test: 'Vibration Test Tool',
        flashlight_test: 'Flashlight Test Tool',
        disaster_message_check: 'Check Latest Disaster Messages',
        accessibility_demo: 'Accessibility Alert Demo',
        emergency_simulation: 'Emergency Situation Simulation',
        emergency_simulation_desc: 'Disaster response system test',
        user_management: 'User Management',
        user_management_desc: 'User registration and profile management',
        system_tools: 'System Tools',
        system_tools_desc: 'Cache clearing and page reloading',
        accessibility_tools: 'Accessibility Tools',
        accessibility_tools_desc: 'Vibration, flashlight, and accessibility testing'
      },
      vi: {
        title: 'Công Cụ Phát Triển',
        subtitle: 'Công cụ để phát triển và kiểm tra ứng dụng',
        back_to_dashboard: 'Quay lại Bảng điều khiển',
        disaster_simulation: 'Mô Phỏng Thảm Họa',
        disaster_simulation_desc: 'Bao gồm cảnh báo tiếp cận cá nhân hóa',
        new_user_registration: 'Đăng Ký Người Dùng Mới',
        clear_cache: 'Xóa Bộ Nhớ Đệm',
        reload_page: 'Tải Lại Trang',
        vibration_test: 'Công Cụ Kiểm Tra Rung',
        flashlight_test: 'Công Cụ Kiểm Tra Đèn Pin',
        disaster_message_check: 'Kiểm Tra Tin Nhắn Thảm Họa Mới Nhất',
        accessibility_demo: 'Bản Demo Cảnh Báo Tiếp Cận',
        emergency_simulation: 'Mô Phỏng Tình Huống Khẩn Cấp',
        emergency_simulation_desc: 'Kiểm tra hệ thống ứng phó thảm họa',
        user_management: 'Quản Lý Người Dùng',
        user_management_desc: 'Đăng ký người dùng và quản lý hồ sơ',
        system_tools: 'Công Cụ Hệ Thống',
        system_tools_desc: 'Xóa bộ nhớ đệm và tải lại trang',
        accessibility_tools: 'Công Cụ Tiếp Cận',
        accessibility_tools_desc: 'Kiểm tra rung, đèn pin và tiếp cận'
      },
      zh: {
        title: '开发工具',
        subtitle: '用于应用程序开发和测试的工具',
        back_to_dashboard: '返回仪表板',
        disaster_simulation: '灾害模拟',
        disaster_simulation_desc: '包括个性化无障碍警报',
        new_user_registration: '新用户注册',
        clear_cache: '清除缓存',
        reload_page: '重新加载页面',
        vibration_test: '振动测试工具',
        flashlight_test: '手电筒测试工具',
        disaster_message_check: '检查最新灾害消息',
        accessibility_demo: '无障碍警报演示',
        emergency_simulation: '紧急情况模拟',
        emergency_simulation_desc: '灾害响应系统测试',
        user_management: '用户管理',
        user_management_desc: '用户注册和配置文件管理',
        system_tools: '系统工具',
        system_tools_desc: '缓存清理和页面重新加载',
        accessibility_tools: '无障碍工具',
        accessibility_tools_desc: '振动、手电筒和无障碍测试'
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
              onClick={() => setLocation('/')}
              variant="outline"
              className="rounded-full"
            >
              <i className="fas fa-arrow-left mr-2" aria-hidden="true"></i>
              {getText('back_to_dashboard')}
            </Button>
          </div>
        </div>

        {/* Tool Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Emergency Simulation */}
          <div>
            <Card className="shadow-xl border-0 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <i className="fas fa-exclamation-triangle mr-2 text-orange-600" aria-hidden="true"></i>
                  {getText('emergency_simulation')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start rounded-xl text-orange-600 border-orange-200 hover:bg-orange-50"
                  onClick={async () => {
                    try {
                      console.log('🚨 재난 시뮬레이션 시작 - 개인화된 접근성 알림 포함');
                      await triggerEmergencyDemo({ disasterType: 'earthquake', language });
                      
                      // 기본 진동 피드백
                      if (navigator.vibrate) {
                        navigator.vibrate([200, 100, 200]);
                      }
                      
                      console.log('✅ 재난 시뮬레이션 완료 - 접근성 알림이 활성화된 사용자에게 개인화된 알림 제공');
                    } catch (error) {
                      console.error('재난 시뮬레이션 오류:', error);
                    }
                  }}
                >
                  <i className="fas fa-exclamation-triangle mr-2" aria-hidden="true"></i>
                  {getText('disaster_simulation')}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start rounded-xl text-blue-600 border-blue-200 hover:bg-blue-50"
                  onClick={() => setLocation('/registration')}
                >
                  <i className="fas fa-user-plus mr-2" aria-hidden="true"></i>
                  {getText('new_user_registration')}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* System Tools */}
          <div>
            <Card className="shadow-xl border-0 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <i className="fas fa-tools mr-2 text-blue-600" aria-hidden="true"></i>
                  {getText('system_tools')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start rounded-xl"
                  onClick={() => {
                    clearBrowserCache();
                    window.location.reload();
                  }}
                >
                  <i className="fas fa-trash mr-2" aria-hidden="true"></i>
                  {getText('clear_cache')}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start rounded-xl"
                  onClick={() => {
                    debugStorageState();
                    forcePageReload();
                  }}
                >
                  <i className="fas fa-refresh mr-2" aria-hidden="true"></i>
                  {getText('reload_page')}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start rounded-xl text-green-600 border-green-200 hover:bg-green-50"
                  onClick={async () => {
                    try {
                      console.log('🔍 최신 재난문자 조회 시작');
                      const response = await fetch('/api/disaster/latest');
                      const result = await response.json();
                      console.log('📡 최신 재난 정보:', result);
                      
                      if (result.success && result.data) {
                        const disaster = result.data;
                        alert(`📨 최신 재난문자 정보\n\n` +
                          `제목: ${disaster.title}\n` +
                          `내용: ${disaster.content}\n` +
                          `위치: ${disaster.location}\n` +
                          `단계: ${disaster.severity}\n` +
                          `시간: ${new Date(disaster.timestamp).toLocaleString('ko-KR')}\n` +
                          `출처: ${disaster.source}`);
                      } else {
                        alert(`✅ API 연결 성공\n\n${result.message}\n\n현재 활성화된 재난문자가 없습니다.`);
                      }
                    } catch (error) {
                      console.error('최신 재난 정보 조회 오류:', error);
                      alert('최신 재난문자 조회에 실패했습니다.\n\n' + (error as Error).message);
                    }
                  }}
                >
                  <i className="fas fa-satellite-dish mr-2" aria-hidden="true"></i>
                  📡 {getText('disaster_message_check')}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Accessibility Tools */}
          <div>
            <Card className="shadow-xl border-0 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <i className="fas fa-universal-access mr-2 text-purple-600" aria-hidden="true"></i>
                  {getText('accessibility_tools')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start rounded-xl text-purple-600 border-purple-200 hover:bg-purple-50"
                  onClick={() => setLocation('/vibration-test')}
                >
                  <i className="fas fa-mobile-alt mr-2" aria-hidden="true"></i>
                  📳 {getText('vibration_test')}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start rounded-xl text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                  onClick={() => setLocation('/flashlight-test')}
                >
                  <i className="fas fa-lightbulb mr-2" aria-hidden="true"></i>
                  🔦 {getText('flashlight_test')}
                </Button>
                
                {/* 접근성 알림 데모 버튼들 */}
                <div className="border-t pt-3">
                  <DemoAccessibilityButton />
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

        {/* Info Card */}
        <Card className="mt-8 shadow-lg border-0 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fas fa-info-circle text-xl" aria-hidden="true"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  개발자 전용 페이지
                </h3>
                <p className="text-blue-700 dark:text-blue-200 text-sm leading-relaxed">
                  이 페이지는 앱 개발 및 테스트를 위한 도구들을 제공합니다. 
                  일반 사용자에게는 표시되지 않으며, /dev-tools URL로만 접근할 수 있습니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

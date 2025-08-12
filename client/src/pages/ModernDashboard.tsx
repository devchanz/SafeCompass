import { useState, useEffect } from "react";
import * as React from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useEmergency } from "@/hooks/useEmergency";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEmergencySystem } from "@/hooks/useEmergencySystem";

export default function ModernDashboard() {
  // 모든 Hook을 컴포넌트 최상단에서 호출 (조건부 호출 금지)
  const { data: userProfile, isLoading } = useUserProfile();
  const { simulateEarthquake } = useEmergency();
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const { currentAlert, triggerEmergencyDemo } = useEmergencySystem();
  const [showNotification, setShowNotification] = useState(false);

  // Check if user has registered
  const hasRegistered = localStorage.getItem('hasRegistered') === 'true';

  // 다국어 텍스트
  const getText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      ko: {
        loading: '로딩 중...',
        welcome: '안전나침반',
        welcome_subtitle: '개인 맞춤형 재난 대응 솔루션',
        welcome_desc: '맞춤형 안전 가이드를 받기 위해 먼저 개인정보를 등록해주세요.',
        register_now: '정보 등록하기',
        safety_status: '현재 안전 상태',
        status_safe: '안전',
        status_danger: '위험',
        status_message: '위험 요소가 감지되지 않았습니다',
        status_danger_message: '긴급 상황이 감지되었습니다',
        last_updated: '최근 업데이트',
        just_now: '방금 전',
        quick_actions: '빠른 실행',
        emergency_manual: '응급 매뉴얼',
        emergency_manual_desc: '재난별 대응 방법 확인',
        find_shelters: '대피소 찾기',
        find_shelters_desc: '주변 대피소 위치 및 경로',
        personalized_guide: '맞춤 가이드',
        personalized_guide_desc: 'AI 기반 개인화 안전 가이드',
        disaster_simulation: '재난 대응 시뮬레이션',
        disaster_simulation_desc: '재난 상황 대응 시스템 체험',
        alert_test: '알림 테스트',
        alert_test_desc: '재난 알림 시스템 체험',
        my_profile: '내 프로필',
        profile_info: '프로필 정보',
        name: '이름',
        age: '나이',
        age_suffix: '세',
        address: '주소',
        mobility: '이동성',
        accessibility: '접근성 지원',
        mobility_independent: '독립적',
        mobility_assisted: '지원 필요',
        mobility_unable: '이동 불가',
        edit_profile: '프로필 수정',
        demo_tools: '개발 도구',
        clear_cache: '캐시 정리',
        reload_page: '새로고침',
        data_sync_error: '데이터 동기화 문제',
        re_register: '다시 등록하기',
        alert_test_executed: '알림 테스트가 실행되었습니다!'
      },
      en: {
        loading: 'Loading...',
        welcome: 'Safe Compass',
        welcome_subtitle: 'Personalized Disaster Response Solution',
        welcome_desc: 'Please register your personal information first to receive customized safety guides.',
        register_now: 'Register Information',
        safety_status: 'Current Safety Status',
        status_safe: 'Safe',
        status_danger: 'Danger',
        status_message: 'No risk factors detected',
        status_danger_message: 'Emergency situation detected',
        last_updated: 'Last Updated',
        just_now: 'Just now',
        quick_actions: 'Quick Actions',
        emergency_manual: 'Emergency Manual',
        emergency_manual_desc: 'Check disaster response methods',
        find_shelters: 'Find Shelters',
        find_shelters_desc: 'Nearby shelter locations & routes',
        personalized_guide: 'Personalized Guide',
        personalized_guide_desc: 'AI-based personalized safety guide',
        disaster_simulation: 'Disaster Response Simulation',
        disaster_simulation_desc: 'Experience disaster response system',
        alert_test: 'Alert Test',
        alert_test_desc: 'Experience disaster alert system',
        my_profile: 'My Profile',
        profile_info: 'Profile Information',
        name: 'Name',
        age: 'Age',
        age_suffix: ' years old',
        address: 'Address',
        mobility: 'Mobility',
        accessibility: 'Accessibility Support',
        mobility_independent: 'Independent',
        mobility_assisted: 'Needs Assistance',
        mobility_unable: 'Unable to Move',
        edit_profile: 'Edit Profile',
        demo_tools: 'Development Tools',
        clear_cache: 'Clear Cache',
        reload_page: 'Reload Page',
        data_sync_error: 'Data Sync Error',
        re_register: 'Re-register',
        alert_test_executed: 'Alert test has been executed!'
      },
      vi: {
        loading: 'Đang tải...',
        welcome: 'La Bàn An Toàn',
        welcome_subtitle: 'Giải Pháp Ứng Phó Thảm Họa Cá Nhân Hóa',
        welcome_desc: 'Vui lòng đăng ký thông tin cá nhân trước để nhận hướng dẫn an toàn tùy chỉnh.',
        register_now: 'Đăng Ký Thông Tin',
        safety_status: 'Trạng Thái An Toàn Hiện Tại',
        status_safe: 'An Toàn',
        status_danger: 'Nguy Hiểm',
        status_message: 'Không phát hiện yếu tố nguy hiểm',
        status_danger_message: 'Tình huống khẩn cấp được phát hiện',
        last_updated: 'Cập Nhật Gần Đây',
        just_now: 'Vừa xong',
        quick_actions: 'Hành Động Nhanh',
        emergency_manual: 'Sổ Tay Khẩn Cấp',
        emergency_manual_desc: 'Kiểm tra phương pháp ứng phó thảm họa',
        find_shelters: 'Tìm Nơi Trú Ẩn',
        find_shelters_desc: 'Vị trí và đường đi nơi trú ẩn gần đây',
        personalized_guide: 'Hướng Dẫn Cá Nhân Hóa',
        personalized_guide_desc: 'Hướng dẫn an toàn cá nhân hóa dựa trên AI',
        disaster_simulation: 'Mô Phỏng Ứng Phó Thảm Họa',
        disaster_simulation_desc: 'Trải nghiệm hệ thống ứng phó thảm họa',
        alert_test: 'Kiểm Tra Cảnh Báo',
        alert_test_desc: 'Trải nghiệm hệ thống cảnh báo thảm họa',
        my_profile: 'Hồ Sơ Của Tôi',
        profile_info: 'Thông Tin Hồ Sơ',
        name: 'Tên',
        age: 'Tuổi',
        age_suffix: ' tuổi',
        address: 'Địa Chỉ',
        mobility: 'Khả Năng Di Chuyển',
        accessibility: 'Hỗ Trợ Tiếp Cận',
        mobility_independent: 'Độc Lập',
        mobility_assisted: 'Cần Hỗ Trợ',
        mobility_unable: 'Không Thể Di Chuyển',
        edit_profile: 'Chỉnh Sửa Hồ Sơ',
        demo_tools: 'Công Cụ Phát Triển',
        clear_cache: 'Xóa Bộ Nhớ Đệm',
        reload_page: 'Tải Lại Trang',
        data_sync_error: 'Lỗi Đồng Bộ Dữ Liệu',
        re_register: 'Đăng Ký Lại',
        alert_test_executed: 'Kiểm tra cảnh báo đã được thực hiện!'
      },
      zh: {
        loading: '加载中...',
        welcome: '安全指南针',
        welcome_subtitle: '个性化灾害应对解决方案',
        welcome_desc: '请先注册个人信息以获得定制安全指南。',
        register_now: '注册信息',
        safety_status: '当前安全状态',
        status_safe: '安全',
        status_danger: '危险',
        status_message: '未检测到风险因素',
        status_danger_message: '检测到紧急情况',
        last_updated: '最后更新',
        just_now: '刚刚',
        quick_actions: '快速操作',
        emergency_manual: '应急手册',
        emergency_manual_desc: '查看灾害应对方法',
        find_shelters: '寻找避难所',
        find_shelters_desc: '附近避难所位置和路线',
        personalized_guide: '个性化指南',
        personalized_guide_desc: 'AI驱动的个性化安全指南',
        disaster_simulation: '灾害应对模拟',
        disaster_simulation_desc: '体验灾害应对系统',
        alert_test: '警报测试',
        alert_test_desc: '体验灾害警报系统',
        my_profile: '我的资料',
        profile_info: '资料信息',
        name: '姓名',
        age: '年龄',
        age_suffix: '岁',
        address: '地址',
        mobility: '行动能力',
        accessibility: '无障碍支持',
        mobility_independent: '独立',
        mobility_assisted: '需要协助',
        mobility_unable: '无法移动',
        edit_profile: '编辑资料',
        demo_tools: '开发工具',
        clear_cache: '清除缓存',
        reload_page: '重新加载页面',
        data_sync_error: '数据同步问题',
        re_register: '重新注册',
        alert_test_executed: '警报测试已执行!'
      }
    };
    
    return texts[language]?.[key] || texts['ko'][key] || key;
  };

  // 대시보드 렌더링 시 스크롤을 최상단으로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 렌더링 로직을 함수로 분리하여 조건부 Hook 호출 방지
  const renderLoadingState = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">{getText('loading')}</p>
      </div>
    </div>
  );

  const renderRegistrationPrompt = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardContent className="text-center p-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-compass text-3xl" aria-hidden="true"></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {getText('welcome')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
              {getText('welcome_subtitle')}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {getText('welcome_desc')}
            </p>
            <Link href="/registration">
              <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg">
                <i className="fas fa-user-plus mr-2" aria-hidden="true"></i>
                {getText('register_now')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderDataSyncError = () => (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardContent className="text-center p-8">
            <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-exclamation-triangle text-3xl" aria-hidden="true"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {getText('data_sync_error')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              등록 정보가 서버와 동기화되지 않았습니다. 메모리 저장소를 사용 중입니다.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => setLocation('/registration')}
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-3 rounded-xl font-medium"
              >
                <i className="fas fa-user-plus mr-2" aria-hidden="true"></i>
                {getText('re_register')}
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  window.location.reload();
                }}
                className="w-full py-3 rounded-xl font-medium"
              >
                <i className="fas fa-refresh mr-2" aria-hidden="true"></i>
                {getText('reload_page')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderMainDashboard = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {getText('welcome')}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                {getText('welcome_subtitle')}
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-3">
              <Badge variant="outline" className={`px-4 py-2 text-sm ${currentAlert ? 'border-red-300 text-red-600' : 'border-green-300 text-green-600'}`}>
                <i className={`fas ${currentAlert ? 'fa-exclamation-triangle' : 'fa-shield-check'} mr-2`} aria-hidden="true"></i>
                {currentAlert ? getText('status_danger') : getText('status_safe')}
              </Badge>
            </div>
          </div>
          
          {/* Safety Status Card */}
          <Card className={`${currentAlert ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-green-500 to-emerald-600'} text-white border-0 shadow-xl`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                    <i className={`fas ${currentAlert ? 'fa-exclamation-triangle' : 'fa-shield-alt'} text-3xl`} aria-hidden="true"></i>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-1">{getText('safety_status')}</h3>
                    <p className={`${currentAlert ? 'text-red-100' : 'text-green-100'} text-lg`}>
                      {currentAlert ? getText('status_danger_message') : getText('status_message')}
                    </p>
                  </div>
                </div>
                <div className="text-right hidden md:block">
                  <p className={`${currentAlert ? 'text-red-100' : 'text-green-100'} text-sm mb-1`}>
                    {getText('last_updated')}
                  </p>
                  <p className="text-white font-medium">{getText('just_now')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {getText('quick_actions')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Emergency Manual */}
            <Link href="/emergency-manuals">
              <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 bg-white dark:bg-gray-800 shadow-lg hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <i className="fas fa-book text-2xl" aria-hidden="true"></i>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {getText('emergency_manual')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {getText('emergency_manual_desc')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Find Shelters */}
            <Link href="/shelter-map-fixed">
              <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 bg-white dark:bg-gray-800 shadow-lg hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <i className="fas fa-map-marker-alt text-2xl" aria-hidden="true"></i>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {getText('find_shelters')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {getText('find_shelters_desc')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Disaster Response Simulation */}
            <Card 
              className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 bg-white dark:bg-gray-800 shadow-lg hover:scale-105"
              onClick={async () => {
                try {
                  await triggerEmergencyDemo({ disasterType: 'earthquake', language });
                  if (navigator.vibrate) {
                    navigator.vibrate([200, 100, 200]);
                  }
                  alert('재난 대응 시뮬레이션이 실행되었습니다!');
                } catch (error) {
                  console.error('시뮬레이션 실행 오류:', error);
                }
              }}
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <i className="fas fa-exclamation-triangle text-2xl" aria-hidden="true"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {getText('disaster_simulation')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {getText('disaster_simulation_desc')}
                </p>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Profile Section */}
        <div className="grid grid-cols-1 gap-8">
          
          {/* Profile Card - 전체 너비로 확장 */}
          <div>
            <Card className="shadow-xl border-0 bg-white dark:bg-gray-800">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <i className="fas fa-user-circle mr-3 text-2xl text-blue-600" aria-hidden="true"></i>
                    {getText('my_profile')}
                  </CardTitle>
                  <Link href="/modify">
                    <Button variant="outline" size="sm" className="rounded-full">
                      <i className="fas fa-edit mr-2" aria-hidden="true"></i>
                      {getText('edit_profile')}
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        {getText('name')}
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {userProfile?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        {getText('age')}
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {userProfile?.age}{getText('age_suffix')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        {getText('address')}
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {userProfile?.address}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        {getText('mobility')}
                      </p>
                      <Badge variant="secondary" className="rounded-full">
                        {userProfile?.mobility === 'independent' ? getText('mobility_independent') :
                         userProfile?.mobility === 'assisted' ? getText('mobility_assisted') : 
                         getText('mobility_unable')}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        {getText('accessibility')}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {userProfile?.accessibility && userProfile.accessibility.length > 0 ? (
                          userProfile.accessibility.map((item: string, index: number) => (
                            <Badge key={index} variant="outline" className="rounded-full text-xs">
                              {item}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline" className="rounded-full text-xs">
                            기본 지원
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

      </div>
    </div>
  );

  // 메인 렌더링 로직 - 조건부 렌더링을 함수 호출로 처리
  if (isLoading) {
    return renderLoadingState();
  }

  if (!userProfile && !hasRegistered) {
    return renderRegistrationPrompt();
  }

  if (hasRegistered && !userProfile) {
    return renderDataSyncError();
  }

  return renderMainDashboard();
}
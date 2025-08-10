import { useState } from "react";
import * as React from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useEmergency } from "@/hooks/useEmergency";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEmergencySystem } from "@/hooks/useEmergencySystem";
import PushNotification from "@/components/PushNotification";
import { clearBrowserCache, forcePageReload, resetUserSession, debugStorageState } from "@/utils/cacheUtils";

export default function Dashboard() {
  const { data: userProfile, isLoading } = useUserProfile();
  const { simulateEarthquake } = useEmergency();
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const { currentAlert, triggerEmergencyDemo } = useEmergencySystem();
  const [showNotification, setShowNotification] = useState(false);

  // 알림 자동 표시
  React.useEffect(() => {
    if (currentAlert && currentAlert.isActive) {
      setShowNotification(true);
    }
  }, [currentAlert]);

  const handleDismissAlert = () => {
    setShowNotification(false);
  };

  const handleOpenAlert = () => {
    setShowNotification(false);
  };

  // 하드코딩된 다국어 텍스트
  const getText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      ko: {
        loading: '로딩 중...',
        loading_desc: '사용자 정보를 확인하고 있습니다.',
        data_sync_error: '데이터 동기화 문제',
        data_sync_desc: '등록 정보가 서버와 동기화되지 않았습니다.\n데이터베이스 연결 문제로 인해 임시 저장소를 사용 중입니다.',
        re_register: '다시 등록하기',
        reload_page: '페이지 새로고침',
        welcome: '환영합니다',
        welcome_desc: '안전나침반에 오신 것을 환영합니다',
        quick_actions: '빠른 실행',
        emergency_guide: '응급 가이드',
        shelter_map: '대피소 지도',
        profile_settings: '프로필 설정',
        demo_section: '개발 도구',
        simulate_earthquake: '지진 시뮬레이션',
        clear_cache: '캐시 정리',
        safety_tips: '안전 수칙',
        tip1: '지진 발생 시 탁자 아래로 대피',
        tip2: '진동이 멈춘 후 안전한 곳으로 이동',
        tip3: '엘리베이터 사용 금지',
        tip4: '가스와 전기 차단',
        safety_status: '안전 상태',
        no_danger_detected: '위험 요소 감지되지 않음',
        last_check: '마지막 확인',
        just_now: '방금 전',
        emergency_manual: '응급 매뉴얼',
        find_shelter: '대피소 찾기',
        alert_test: '알림 테스트',
        alert_test_executed: '알림 테스트가 실행되었습니다!',
        settings: '설정',
        user_profile: '사용자 프로필',
        name_label: '이름',
        age_label: '나이',
        age_suffix: '세',
        mobility_label: '이동성',
        accessibility_label: '접근성',
        mobility_independent: '독립적 이동 가능',
        mobility_assisted: '이동 지원 필요',
        mobility_unable: '이동 불가',
        visual_support: '시각 지원',
        hearing_support: '청각 지원',
        basic_support: '기본 지원',
        edit_profile: '프로필 수정',
        development_mode: '개발 모드',
        development_desc: '테스트 및 개발 도구',
        cache_clear: '캐시 정리',
        new_user: '새 사용자'
      },
      en: {
        loading: 'Loading...',
        loading_desc: 'Checking user information.',
        data_sync_error: 'Data Sync Issue',
        data_sync_desc: 'Registration information is not synced with server.\nUsing temporary storage due to database connection issues.',
        re_register: 'Register Again',
        reload_page: 'Reload Page',
        welcome: 'Welcome',
        welcome_desc: 'Welcome to Safe Compass',
        quick_actions: 'Quick Actions',
        emergency_guide: 'Emergency Guide',
        shelter_map: 'Shelter Map',
        profile_settings: 'Profile Settings',
        demo_section: 'Development Tools',
        simulate_earthquake: 'Simulate Earthquake',
        clear_cache: 'Clear Cache',
        safety_tips: 'Safety Tips',
        tip1: 'Take cover under a table during earthquake',
        tip2: 'Move to safe place after shaking stops',
        tip3: 'Do not use elevators',
        tip4: 'Turn off gas and electricity',
        safety_status: 'Safety Status',
        no_danger_detected: 'No danger detected',
        last_check: 'Last check',
        just_now: 'Just now',
        emergency_manual: 'Emergency Manual',
        find_shelter: 'Find Shelter',
        alert_test: 'Alert Test',
        alert_test_executed: 'Alert test executed!',
        settings: 'Settings',
        user_profile: 'User Profile',
        name_label: 'Name',
        age_label: 'Age',
        age_suffix: ' years old',
        mobility_label: 'Mobility',
        accessibility_label: 'Accessibility',
        mobility_independent: 'Independent',
        mobility_assisted: 'Needs assistance',
        mobility_unable: 'Unable to move',
        visual_support: 'Visual support',
        hearing_support: 'Hearing support',
        basic_support: 'Basic support',
        edit_profile: 'Edit Profile',
        development_mode: 'Development Mode',
        development_desc: 'Testing and development tools',
        cache_clear: 'Clear Cache',
        new_user: 'New User'
      },
      vi: {
        loading: 'Đang tải...',
        loading_desc: 'Đang kiểm tra thông tin người dùng.',
        data_sync_error: 'Lỗi đồng bộ dữ liệu',
        data_sync_desc: 'Thông tin đăng ký không đồng bộ với máy chủ.\nSử dụng bộ nhớ tạm thời do sự cố kết nối cơ sở dữ liệu.',
        re_register: 'Đăng ký lại',
        reload_page: 'Tải lại trang',
        welcome: 'Chào mừng',
        welcome_desc: 'Chào mừng đến với La bàn An toàn',
        quick_actions: 'Hành động nhanh',
        emergency_guide: 'Hướng dẫn khẩn cấp',
        shelter_map: 'Bản đồ nơi trú ẩn',
        profile_settings: 'Cài đặt hồ sơ',
        demo_section: 'Công cụ phát triển',
        simulate_earthquake: 'Mô phỏng động đất',
        clear_cache: 'Xóa bộ nhớ cache',
        safety_tips: 'Mẹo an toàn',
        tip1: 'Trú ẩn dưới bàn khi có động đất',
        tip2: 'Di chuyển đến nơi an toàn sau khi dừng rung',
        tip3: 'Không sử dụng thang máy',
        tip4: 'Tắt gas và điện',
        safety_status: 'Tình trạng an toàn',
        no_danger_detected: 'Không phát hiện nguy hiểm',
        last_check: 'Kiểm tra lần cuối',
        just_now: 'Vừa xong',
        emergency_manual: 'Sách hướng dẫn khẩn cấp',
        find_shelter: 'Tìm nơi trú ẩn',
        alert_test: 'Kiểm tra cảnh báo',
        alert_test_executed: 'Đã thực hiện kiểm tra cảnh báo!',
        settings: 'Cài đặt',
        user_profile: 'Hồ sơ người dùng',
        name_label: 'Tên',
        age_label: 'Tuổi',
        age_suffix: ' tuổi',
        mobility_label: 'Khả năng di chuyển',
        accessibility_label: 'Khả năng tiếp cận',
        mobility_independent: 'Độc lập',
        mobility_assisted: 'Cần hỗ trợ',
        mobility_unable: 'Không thể di chuyển',
        visual_support: 'Hỗ trợ thị giác',
        hearing_support: 'Hỗ trợ thính giác',
        basic_support: 'Hỗ trợ cơ bản',
        edit_profile: 'Chỉnh sửa hồ sơ',
        development_mode: 'Chế độ phát triển',
        development_desc: 'Công cụ kiểm tra và phát triển',
        cache_clear: 'Xóa bộ nhớ cache',
        new_user: 'Người dùng mới'
      },
      zh: {
        loading: '加载中...',
        loading_desc: '正在检查用户信息。',
        data_sync_error: '数据同步问题',
        data_sync_desc: '注册信息未与服务器同步。\n由于数据库连接问题，正在使用临时存储。',
        re_register: '重新注册',
        reload_page: '重新加载页面',
        welcome: '欢迎',
        welcome_desc: '欢迎来到安全指南针',
        quick_actions: '快速操作',
        emergency_guide: '应急指南',
        shelter_map: '避难所地图',
        profile_settings: '个人资料设置',
        demo_section: '开发工具',
        simulate_earthquake: '模拟地震',
        clear_cache: '清除缓存',
        safety_tips: '安全提示',
        tip1: '地震时躲在桌子下面',
        tip2: '震动停止后移动到安全地点',
        tip3: '不要使用电梯',
        tip4: '关闭煤气和电源',
        safety_status: '安全状态',
        no_danger_detected: '未检测到危险',
        last_check: '最后检查',
        just_now: '刚刚',
        emergency_manual: '应急手册',
        find_shelter: '寻找避难所',
        alert_test: '警报测试',
        alert_test_executed: '警报测试已执行！',
        settings: '设置',
        user_profile: '用户档案',
        name_label: '姓名',
        age_label: '年龄',
        age_suffix: '岁',
        mobility_label: '行动能力',
        accessibility_label: '无障碍',
        mobility_independent: '独立',
        mobility_assisted: '需要帮助',
        mobility_unable: '无法移动',
        visual_support: '视觉支持',
        hearing_support: '听力支持',
        basic_support: '基本支持',
        edit_profile: '编辑个人资料',
        development_mode: '开发模式',
        development_desc: '测试和开发工具',
        cache_clear: '清除缓存',
        new_user: '新用户'
      }
    };
    return texts[language]?.[key] || texts['ko'][key] || key;
  };

  // Debug user profile state
  const hasRegistered = localStorage.getItem('hasRegistered') === 'true';
  const currentUserId = localStorage.getItem('currentUserId');
  
  console.log('Dashboard state:', {
    userProfile: !!userProfile, 
    isLoading, 
    hasRegistered, 
    currentUserId,
    userProfileData: userProfile 
  });

  // Show loading state while checking user profile
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="emergency-card">
          <CardContent className="text-center py-8">
            <i className="fas fa-spinner fa-spin text-4xl text-emergency mb-4" aria-hidden="true"></i>
            <h2 className="text-2xl font-bold mb-4">{getText('loading')}</h2>
            <p className="text-gray-600">{getText('loading_desc')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is registered but profile is null (server issue), show error with reset option
  if (hasRegistered && currentUserId && !userProfile) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="emergency-card border-yellow-200 bg-yellow-50">
          <CardContent className="text-center py-8">
            <i className="fas fa-exclamation-triangle text-4xl text-yellow-600 mb-4" aria-hidden="true"></i>
            <h2 className="text-2xl font-bold mb-4 text-yellow-800">{getText('data_sync_error')}</h2>
            <p className="text-yellow-700 mb-6">
              {getText('data_sync_desc').split('\n').map((line, index) => (
                <span key={index}>{line}{index < getText('data_sync_desc').split('\n').length - 1 && <br />}</span>
              ))}
            </p>
            <div className="space-y-3">
              <Button 
                className="bg-yellow-600 hover:bg-yellow-700 w-full"
                onClick={() => {
                  localStorage.removeItem('hasRegistered');
                  localStorage.removeItem('currentUserId');
                  setLocation('/registration');
                }}
              >
                <i className="fas fa-user-plus mr-2" aria-hidden="true"></i>
{getText('re_register')}
              </Button>
              <Button 
                variant="outline"
                className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                onClick={() => {
                  debugStorageState();
                  window.location.reload();
                }}
              >
                <i className="fas fa-refresh mr-2" aria-hidden="true"></i>
{getText('reload_page')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If truly no user profile (not registered), show welcome screen
  if (!userProfile && !hasRegistered) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="emergency-card">
          <CardContent className="text-center py-8">
            <i className="fas fa-user-plus text-4xl text-emergency mb-4" aria-hidden="true"></i>
            <h2 className="text-2xl font-bold mb-4">{getText('welcome')}</h2>
            <p className="text-gray-600 mb-6">
              {getText('welcome_desc')}
            </p>
            <Link href="/registration">
              <Button className="bg-emergency hover:bg-emergency-dark">
                <i className="fas fa-arrow-right mr-2" aria-hidden="true"></i>
{getText('re_register')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Push Notification */}
      <PushNotification 
        alert={currentAlert}
        onDismiss={handleDismissAlert}
        onOpen={handleOpenAlert}
      />
      {/* Emergency Status Card */}
      <Card className="emergency-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-safety text-white rounded-full flex items-center justify-center">
                <i className="fas fa-shield-alt text-xl" aria-hidden="true"></i>
              </div>
              <div>
                <h2 className="text-xl font-bold text-safety">{getText('safety_status')}</h2>
                <p className="text-gray-600">{getText('no_danger_detected')}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">{getText('last_check')}</p>
              <p className="text-sm font-medium">{getText('just_now')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">{getText('quick_actions')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/guide">
            <Card className="emergency-card hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="text-center pt-6">
                <i className="fas fa-book text-2xl text-emergency mb-2" aria-hidden="true"></i>
                <p className="text-sm font-medium">{getText('emergency_manual')}</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/shelters">
            <Card className="emergency-card hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="text-center pt-6">
                <i className="fas fa-map-marker-alt text-2xl text-safety mb-2" aria-hidden="true"></i>
                <p className="text-sm font-medium">{getText('find_shelter')}</p>
              </CardContent>
            </Card>
          </Link>
          
          <Card 
            className="emergency-card hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => {
              if (navigator.vibrate) {
                navigator.vibrate([200, 100, 200]);
              }
              alert(getText('alert_test_executed'));
            }}
          >
            <CardContent className="text-center pt-6">
              <i className="fas fa-bell text-2xl text-warning mb-2" aria-hidden="true"></i>
              <p className="text-sm font-medium">{getText('alert_test')}</p>
            </CardContent>
          </Card>
          
          <Link href="/modify">
            <Card className="emergency-card hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="text-center pt-6">
                <i className="fas fa-cog text-2xl text-gray-600 mb-2" aria-hidden="true"></i>
                <p className="text-sm font-medium">{getText('settings')}</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* User Profile Summary */}
      <Card className="emergency-card">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <i className="fas fa-user-circle text-emergency mr-2" aria-hidden="true"></i>
{getText('user_profile')}
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{getText('name_label')}:</span>
              <span className="font-medium">{userProfile?.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{getText('age_label')}:</span>
              <span className="font-medium">{userProfile?.age}{getText('age_suffix')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{getText('mobility_label')}:</span>
              <span className={`font-medium ${
                userProfile?.mobility === 'independent' ? 'text-safety' :
                userProfile?.mobility === 'assisted' ? 'text-warning' : 'text-emergency'
              }`}>
                {userProfile?.mobility === 'independent' ? getText('mobility_independent') :
                 userProfile?.mobility === 'assisted' ? getText('mobility_assisted') : getText('mobility_unable')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{getText('accessibility_label')}:</span>
              <div className="flex space-x-2">
                {userProfile?.accessibility?.includes('visual') && (
                  <span className="px-2 py-1 bg-safety text-white text-xs rounded">{getText('visual_support')}</span>
                )}
                {userProfile?.accessibility?.includes('hearing') && (
                  <span className="px-2 py-1 bg-warning text-white text-xs rounded">{getText('hearing_support')}</span>
                )}
                {(!userProfile?.accessibility || userProfile?.accessibility?.length === 0) && (
                  <span className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded">{getText('basic_support')}</span>
                )}
              </div>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            className="mt-4 w-full text-emergency hover:text-emergency-dark"
            onClick={() => {
              setLocation('/modify');
            }}
          >
            <i className="fas fa-edit mr-1" aria-hidden="true"></i>
{getText('edit_profile')}
          </Button>
        </CardContent>
      </Card>

      {/* Demo Emergency Trigger */}
      <Card className="bg-yellow-50 border border-yellow-200">
        <CardContent className="pt-6">
          <p className="text-sm text-yellow-800 mb-3">
            <i className="fas fa-flask mr-2" aria-hidden="true"></i>
            <strong>{getText('development_mode')}:</strong> {getText('development_desc')}
          </p>
          <div className="grid gap-2">
            <Link href="/emergency-demo">
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                <i className="fas fa-exclamation-triangle mr-2" aria-hidden="true"></i>
                재난 시스템 데모
              </Button>
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => window.open('/clear-cache.html', '_blank')}
                variant="outline"
                size="sm"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <i className="fas fa-broom mr-1" aria-hidden="true"></i>
{getText('cache_clear')}
              </Button>
              <Button 
                onClick={() => {
                  if (confirm('모든 데이터를 초기화하고 처음부터 시작하시겠습니까?')) {
                    localStorage.clear();
                    sessionStorage.clear();
                    // Force reload to restart app flow
                    setTimeout(() => {
                      window.location.href = window.location.origin;
                    }, 100);
                  }
                }}
                variant="outline" 
                size="sm"
                className="border-green-300 text-green-700 hover:bg-green-50"
              >
                <i className="fas fa-user-plus mr-1" aria-hidden="true"></i>
{getText('new_user')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Push Notification - 조건부 렌더링 개선 */}
      {(currentAlert && currentAlert.isActive) || showNotification ? (
        <PushNotification 
          alert={currentAlert} 
          onDismiss={handleDismissAlert}
          onOpen={handleOpenAlert}
        />
      ) : null}
    </div>
  );
}

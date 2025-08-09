import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'ko' | 'en' | 'vi' | 'zh';

interface LanguageContextType {
  currentLanguage: Language;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  ko: {
    'nav.dashboard': '대시보드',
    'nav.registration': '정보 등록',
    'nav.emergency': '응급 상황',
    'nav.shelter': '대피소 찾기',
    'nav.guide': '맞춤형 가이드',
    'dashboard.title': '안전나침반',
    'dashboard.subtitle': '개인 맞춤형 지진 대응 가이드',
    'dashboard.emergency_alert': '지진 경보 발령',
    'dashboard.earthquake_info': '규모 6.2, 위치: 서울 인근',
    'dashboard.time_ago': '2분 전',
    'dashboard.respond': '대응하기',
    'dashboard.profile_info': '프로필 정보',
    'dashboard.name': '이름',
    'dashboard.age': '나이',
    'dashboard.evacuation_ability': '자력대피 능력',
    'dashboard.accessibility': '접근성 지원',
    'dashboard.address': '주소',
    'dashboard.companion': '동행 파트너',
    'dashboard.edit_profile': '프로필 수정',
    'dashboard.welcome': '환영합니다!',
    'dashboard.welcome_message': '맞춤형 안전 가이드를 받기 위해 먼저 개인정보를 등록해주세요.',
    'dashboard.register_info': '정보 등록하기',
    'dashboard.safety_status': '안전 상태',
    'dashboard.no_danger_detected': '현재 위험 상황이 감지되지 않았습니다',
    'dashboard.last_check': '마지막 확인',
    'dashboard.just_now': '방금 전',
    'dashboard.quick_actions': '빠른 실행',
    'dashboard.emergency_response': '응급 대응',
    'dashboard.find_shelters': '대피소 찾기',
    'dashboard.personalized_guide': '맞춤형 가이드',
    'dashboard.demo.title': '데모 & 테스트',
    'dashboard.demo.description': '기능을 테스트해보세요',
    'dashboard.demo.clearCache': '캐시 정리',
    'dashboard.demo.newUser': '새 사용자',
    'dashboard.demo.interactiveMap': '인터랙티브 지도',
    'registration.title': '개인정보 등록',
    'registration.subtitle': '맞춤형 안전 가이드를 위한 기본 정보',
    'registration.name': '이름',
    'registration.age': '나이',
    'registration.gender': '성별',
    'registration.male': '남성',
    'registration.female': '여성',
    'registration.other': '기타',
    'registration.address': '주소',
    'registration.language': '언어',
    'registration.accessibility': '접근성 지원',
    'registration.mobility': '이동 능력',
    'registration.independent': '독립적 이동 가능',
    'registration.assistance': '도움 필요',
    'registration.wheelchair': '휠체어 사용',
    'registration.submit': '등록하기',
    'registration.update': '수정하기',
    'common.loading': '로딩 중...',
    'common.error': '오류',
    'common.save': '저장',
    'common.cancel': '취소',
    'common.next': '다음',
    'common.back': '뒤로',
    'common.close': '닫기',
    'emergency.earthquake_detected': '지진이 감지되었습니다',
    'emergency.location_question': '현재 어디에 계신가요?',
    'emergency.mobility_question': '지금 이동할 수 있으신가요?',
    'emergency.generate_guide': '맞춤형 가이드 생성',
    'emergency.location.home': '집 (거실/침실)',
    'emergency.location.office': '사무실/학교',
    'emergency.location.outdoor': '길거리/야외',
    'emergency.location.transport': '지하철/버스',
    'emergency.mobility.yes': '네, 이동할 수 있습니다',
    'emergency.mobility.no': '아니요, 이동이 어렵습니다',
    
    // 지도 페이지
    'map.title': '대피소 지도',
    'map.loading_location': '위치 정보를 가져오는 중...',
    'map.location_error': '위치 정보를 가져올 수 없습니다',
    'map.enable_location': '위치 서비스를 활성화해주세요',
    'map.nearby_shelters': '근처 대피소',
    'map.no_shelters': '주변에 등록된 대피소가 없습니다',
    'map.loading_shelters': '대피소 정보 로딩 중...',
    'map.network_error': '대피소 정보를 불러올 수 없습니다. 네트워크 연결을 확인해주세요.',
    'map.current_location': '현재 위치',
    'map.walking_time': '도보',
    'map.distance': '거리',
    'map.capacity': '수용인원',
    'map.type.indoor': '실내',
    'map.type.outdoor': '옥외',
    'map.type.shelter': '구호소',
    'map.minutes': '분',
    'map.km': 'km',
    'map.people': '명',
    'map.subtitle': '실시간 GPS 위치 기반으로 주변 지진 대피소를 검색하고 경로를 확인하세요',
    'map.location_map': '대피소 위치 지도',
    
    // 언어 선택 페이지
    'language.title': '언어를 선택해주세요',
    'language.subtitle': '맞춤형 재난 대응 솔루션',
    'language.select': '언어 선택',
    'language.continue': '계속하기',
    'language.korean': '한국어',
    'language.english': 'English',
    'language.vietnamese': 'Tiếng Việt',
    'language.chinese': '中文',
    'language.coming_soon': '곧 제공 예정',
    'language.show_more': '더 많은 언어 보기',
    'language.preparing': '개 준비 중',
    
    // 프로필 수정 페이지
    'profile.modify.title': '프로필 수정',
    'profile.modify.basic_info': '기본 정보',
    'profile.modify.accessibility_info': '접근성 정보',
    'profile.modify.companion_info': '동행자 정보',
    'profile.modify.companion_name': '동행자 이름',
    'profile.modify.companion_phone': '동행자 연락처',
    'profile.modify.save_success': '프로필이 성공적으로 수정되었습니다',
    'profile.modify.save_error': '프로필 수정 중 오류가 발생했습니다',
    
    // 개인화 가이드 페이지
    'guide.title': '맞춤형 안전 가이드',
    'guide.generating': '맞춤형 가이드 생성 중...',
    'guide.error': '가이드 생성 중 오류가 발생했습니다',
    'guide.retry': '다시 시도',
    'guide.speak': '음성으로 듣기',
    'guide.stop_speaking': '음성 중지',
    'guide.vibrate': '진동 알림',
    
    // 응급상황 페이지
    'emergency.alert.title': '응급 상황',
    'emergency.alert.subtitle': '현재 상황을 알려주세요',
    'emergency.alert.step1': '1단계: 현재 위치',
    'emergency.alert.step2': '2단계: 이동 가능 여부',
    'emergency.alert.generating': '맞춤형 대응 가이드 생성 중...',
    'emergency.alert.please_wait': '잠시만 기다려주세요',
    
    // 푸터
    'footer.tagline': '맞춤형 재난 대응 솔루션'
  },
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.registration': 'Registration',
    'nav.emergency': 'Emergency',
    'nav.shelter': 'Find Shelters',
    'nav.guide': 'Custom Guide',
    'dashboard.title': 'Safe Compass',
    'dashboard.subtitle': 'Personalized Earthquake Response Guide',
    'dashboard.emergency_alert': 'Earthquake Alert Issued',
    'dashboard.earthquake_info': 'Magnitude 6.2, Location: Near Seoul',
    'dashboard.time_ago': '2 minutes ago',
    'dashboard.respond': 'Respond',
    'dashboard.profile_info': 'Profile Information',
    'dashboard.name': 'Name',
    'dashboard.age': 'Age',
    'dashboard.evacuation_ability': 'Self-Evacuation Ability',
    'dashboard.accessibility': 'Accessibility Support',
    'dashboard.address': 'Address',
    'dashboard.companion': 'Companion Partner',
    'dashboard.edit_profile': 'Edit Profile',
    'dashboard.welcome': 'Welcome!',
    'dashboard.welcome_message': 'Please register your personal information first to receive customized safety guides.',
    'dashboard.register_info': 'Register Information',
    'dashboard.safety_status': 'Safety Status',
    'dashboard.no_danger_detected': 'No dangerous situation detected',
    'dashboard.last_check': 'Last Check',
    'dashboard.just_now': 'Just now',
    'dashboard.quick_actions': 'Quick Actions',
    'dashboard.emergency_response': 'Emergency Response',
    'dashboard.find_shelters': 'Find Shelters',
    'dashboard.personalized_guide': 'Personalized Guide',
    'dashboard.demo.title': 'Demo & Test',
    'dashboard.demo.description': 'Test the features',
    'dashboard.demo.clearCache': 'Clear Cache',
    'dashboard.demo.newUser': 'New User',
    'dashboard.demo.interactiveMap': 'Interactive Map',
    'registration.title': 'Personal Information Registration',
    'registration.subtitle': 'Basic information for personalized safety guide',
    'registration.name': 'Name',
    'registration.age': 'Age',
    'registration.gender': 'Gender',
    'registration.male': 'Male',
    'registration.female': 'Female',
    'registration.other': 'Other',
    'registration.address': 'Address',
    'registration.language': 'Language',
    'registration.accessibility': 'Accessibility Support',
    'registration.mobility': 'Mobility',
    'registration.independent': 'Independent movement',
    'registration.assistance': 'Assistance needed',
    'registration.wheelchair': 'Wheelchair user',
    'registration.submit': 'Register',
    'registration.update': 'Update',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.next': 'Next',
    'common.back': 'Back',
    'common.close': 'Close',
    'emergency.earthquake_detected': 'Earthquake detected',
    'emergency.location_question': 'Where are you currently?',
    'emergency.mobility_question': 'Can you move now?',
    'emergency.generate_guide': 'Generate Custom Guide',
    'emergency.location.home': 'Home (living room/bedroom)',
    'emergency.location.office': 'Office/School',
    'emergency.location.outdoor': 'Street/Outdoor',
    'emergency.location.transport': 'Subway/Bus',
    'emergency.mobility.yes': 'Yes, I can move',
    'emergency.mobility.no': 'No, movement is difficult',
    
    // Map page
    'map.title': 'Shelter Map',
    'map.loading_location': 'Getting location information...',
    'map.location_error': 'Unable to get location information',
    'map.enable_location': 'Please enable location services',
    'map.nearby_shelters': 'Nearby Shelters',
    'map.no_shelters': 'No registered shelters nearby',
    'map.loading_shelters': 'Loading shelter information...',
    'map.network_error': 'Unable to load shelter information. Please check your network connection.',
    'map.current_location': 'Current Location',
    'map.walking_time': 'Walk',
    'map.distance': 'Distance',
    'map.capacity': 'Capacity',
    'map.type.indoor': 'Indoor',
    'map.type.outdoor': 'Outdoor',
    'map.type.shelter': 'Shelter',
    'map.minutes': 'min',
    'map.km': 'km',
    'map.people': 'people',
    'map.subtitle': 'Search nearby earthquake shelters based on real-time GPS location and check routes',
    'map.location_map': 'Shelter Location Map',
    
    // Language selection page
    'language.title': 'Please select your language',
    'language.subtitle': 'Personalized Disaster Response Solution',
    'language.select': 'Language Selection',
    'language.continue': 'Continue',
    'language.korean': '한국어',
    'language.english': 'English',
    'language.vietnamese': 'Tiếng Việt',
    'language.chinese': '中文',
    'language.coming_soon': 'Coming Soon',
    'language.show_more': 'Show more languages',
    'language.preparing': ' preparing',
    
    // Profile modify page
    'profile.modify.title': 'Edit Profile',
    'profile.modify.basic_info': 'Basic Information',
    'profile.modify.accessibility_info': 'Accessibility Information',
    'profile.modify.companion_info': 'Companion Information',
    'profile.modify.companion_name': 'Companion Name',
    'profile.modify.companion_phone': 'Companion Phone',
    'profile.modify.save_success': 'Profile updated successfully',
    'profile.modify.save_error': 'Error occurred while updating profile',
    
    // Personalized guide page
    'guide.title': 'Personalized Safety Guide',
    'guide.generating': 'Generating personalized guide...',
    'guide.error': 'Error occurred while generating guide',
    'guide.retry': 'Retry',
    'guide.speak': 'Listen with voice',
    'guide.stop_speaking': 'Stop voice',
    'guide.vibrate': 'Vibration alert',
    
    // Emergency page
    'emergency.alert.title': 'Emergency Situation',
    'emergency.alert.subtitle': 'Please tell us your current situation',
    'emergency.alert.step1': 'Step 1: Current Location',
    'emergency.alert.step2': 'Step 2: Mobility Status',
    'emergency.alert.generating': 'Generating personalized response guide...',
    'emergency.alert.please_wait': 'Please wait',
    
    // Footer
    'footer.tagline': 'Personalized Disaster Response Solution'
  },
  vi: {
    'nav.dashboard': 'Bảng điều khiển',
    'nav.registration': 'Đăng ký',
    'nav.emergency': 'Khẩn cấp',
    'nav.shelter': 'Tìm nơi trú ẩn',
    'nav.guide': 'Hướng dẫn cá nhân',
    'dashboard.title': 'La bàn an toàn',
    'dashboard.subtitle': 'Hướng dẫn ứng phó động đất cá nhân hóa',
    'dashboard.welcome': 'Chào mừng!',
    'dashboard.welcome_message': 'Vui lòng đăng ký thông tin cá nhân trước để nhận hướng dẫn an toàn tùy chỉnh.',
    'dashboard.register_info': 'Đăng ký thông tin',
    'common.loading': 'Đang tải...',
    'common.error': 'Lỗi',
    'common.save': 'Lưu',
    'common.cancel': 'Hủy',
    'emergency.earthquake_detected': 'Phát hiện động đất',
    'emergency.location_question': 'Bạn hiện tại đang ở đâu?',
    'emergency.mobility_question': 'Bạn có thể di chuyển bây giờ không?',
    'emergency.generate_guide': 'Tạo hướng dẫn tùy chỉnh',
    
    // Map page
    'map.title': 'Bản đồ nơi trú ẩn',
    'map.loading_location': 'Đang lấy thông tin vị trí...',
    'map.location_error': 'Không thể lấy thông tin vị trí',
    'map.enable_location': 'Vui lòng bật dịch vụ vị trí',
    'map.nearby_shelters': 'Nơi trú ẩn gần đây',
    'map.no_shelters': 'Không có nơi trú ẩn đăng ký gần đây',
    'map.loading_shelters': 'Đang tải thông tin nơi trú ẩn...',
    'map.network_error': 'Không thể tải thông tin nơi trú ẩn. Vui lòng kiểm tra kết nối mạng.',
    'map.current_location': 'Vị trí hiện tại',
    'map.walking_time': 'Đi bộ',
    'map.distance': 'Khoảng cách',
    'map.capacity': 'Sức chứa',
    'map.type.indoor': 'Trong nhà',
    'map.type.outdoor': 'Ngoài trời',
    'map.type.shelter': 'Nơi trú ẩn',
    'map.minutes': 'phút',
    'map.km': 'km',
    'map.people': 'người',
    'map.subtitle': 'Tìm kiếm nơi trú ẩn động đất gần đây dựa trên vị trí GPS thời gian thực và kiểm tra tuyến đường',
    'map.location_map': 'Bản đồ vị trí nơi trú ẩn',
    
    // Language selection page
    'language.title': 'Vui lòng chọn ngôn ngữ của bạn',
    'language.subtitle': 'Giải pháp ứng phó thảm họa cá nhân hóa',
    'language.select': 'Chọn ngôn ngữ',
    'language.continue': 'Tiếp tục',
    'language.korean': '한국어',
    'language.english': 'English',
    'language.vietnamese': 'Tiếng Việt',
    'language.chinese': '中文',
    'language.coming_soon': 'Sắp có',
    'language.show_more': 'Xem thêm ngôn ngữ',
    'language.preparing': ' đang chuẩn bị',
    
    // Footer
    'footer.tagline': 'Giải pháp ứng phó thảm họa cá nhân hóa'
  },
  zh: {
    'nav.dashboard': '仪表板',
    'nav.registration': '注册',
    'nav.emergency': '紧急情况',
    'nav.shelter': '寻找避难所',
    'nav.guide': '个人指南',
    'dashboard.title': '安全指南针',
    'dashboard.subtitle': '个性化地震应对指南',
    'dashboard.welcome': '欢迎！',
    'dashboard.welcome_message': '请先注册个人信息以获得定制安全指南。',
    'dashboard.register_info': '注册信息',
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.save': '保存',
    'common.cancel': '取消',
    'emergency.earthquake_detected': '检测到地震',
    'emergency.location_question': '您目前在哪里？',
    'emergency.mobility_question': '您现在能够移动吗？',
    'emergency.generate_guide': '生成自定义指南',
    
    // Map page
    'map.title': '避难所地图',
    'map.loading_location': '正在获取位置信息...',
    'map.location_error': '无法获取位置信息',
    'map.enable_location': '请启用位置服务',
    'map.nearby_shelters': '附近避难所',
    'map.no_shelters': '附近没有注册的避难所',
    'map.loading_shelters': '正在加载避难所信息...',
    'map.network_error': '无法加载避难所信息。请检查网络连接。',
    'map.current_location': '当前位置',
    'map.walking_time': '步行',
    'map.distance': '距离',
    'map.capacity': '容量',
    'map.type.indoor': '室内',
    'map.type.outdoor': '室外',
    'map.type.shelter': '避难所',
    'map.minutes': '分钟',
    'map.km': '公里',
    'map.people': '人',
    'map.subtitle': '基于实时GPS位置搜索附近地震避难所并检查路线',
    'map.location_map': '避难所位置地图',
    
    // Language selection page
    'language.title': '请选择您的语言',
    'language.subtitle': '个性化灾难应对解决方案',
    'language.select': '语言选择',
    'language.continue': '继续',
    'language.korean': '한국어',
    'language.english': 'English',
    'language.vietnamese': 'Tiếng Việt',
    'language.chinese': '中文',
    'language.coming_soon': '即将推出',
    'language.show_more': '显示更多语言',
    'language.preparing': '个准备中',
    
    // Footer
    'footer.tagline': '个性化灾难应对解决方案'
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('ko');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') as Language;
    if (savedLanguage && ['ko', 'en', 'vi', 'zh'].includes(savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
    localStorage.setItem('preferred-language', lang);
  };

  const t = (key: string): string => {
    const langTranslations = translations[currentLanguage] as Record<string, string>;
    return langTranslations[key] || key;
  };

  return (
    <LanguageContext.Provider 
      value={{ 
        currentLanguage, 
        language: currentLanguage, 
        setLanguage, 
        t 
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
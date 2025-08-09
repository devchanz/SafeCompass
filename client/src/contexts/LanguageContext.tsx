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
    'emergency.mobility.no': '아니요, 이동이 어렵습니다'
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
    'emergency.mobility.no': 'No, movement is difficult'
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
    'emergency.generate_guide': 'Tạo hướng dẫn tùy chỉnh'
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
    'emergency.generate_guide': '生成自定义指南'
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
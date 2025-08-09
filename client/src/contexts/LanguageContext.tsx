import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'korean' | 'english';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  korean: {
    // Navigation
    'nav.dashboard': '대시보드',
    'nav.registration': '사용자 등록',
    'nav.emergency': '응급상황',
    'nav.shelter': '대피소 찾기',
    'nav.guide': '맞춤 가이드',
    
    // Dashboard
    'dashboard.title': '안전나침반',
    'dashboard.subtitle': '개인화된 지진 대응 가이드',
    'dashboard.emergency_alert': '지진 경보 발령',
    'dashboard.earthquake_info': '규모 6.2, 발생지: 서울 인근',
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
    
    // Registration
    'registration.title': '사용자 정보 등록',
    'registration.subtitle': '맞춤형 지진 대응을 위한 개인정보를 입력해주세요',
    'registration.name': '이름',
    'registration.age': '나이',
    'registration.gender': '성별',
    'registration.address': '주소',
    'registration.language': '언어',
    'registration.accessibility_support': '접근성 지원 및 자력대피 능력',
    'registration.companion': '동행 파트너 (선택사항)',
    'registration.save': '저장하기',
    
    // Emergency
    'emergency.title': '현재 상황을 알려주세요',
    'emergency.earthquake_detected': '지진이 감지되었습니다',
    'emergency.location_question': '현재 어디에 계신가요?',
    'emergency.mobility_question': '지금 움직일 수 있나요?',
    'emergency.generate_guide': '맞춤 가이드 생성',
    
    // Common
    'common.loading': '로딩 중...',
    'common.error': '오류가 발생했습니다',
    'common.save': '저장',
    'common.cancel': '취소',
    'common.next': '다음',
    'common.back': '이전',
    'common.close': '닫기'
  },
  english: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.registration': 'Registration',
    'nav.emergency': 'Emergency',
    'nav.shelter': 'Find Shelter',
    'nav.guide': 'Custom Guide',
    
    // Dashboard
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
    'dashboard.companion': 'Emergency Companion',
    'dashboard.edit_profile': 'Edit Profile',
    
    // Registration
    'registration.title': 'User Registration',
    'registration.subtitle': 'Please enter your personal information for customized earthquake response',
    'registration.name': 'Name',
    'registration.age': 'Age',
    'registration.gender': 'Gender',
    'registration.address': 'Address',
    'registration.language': 'Language',
    'registration.accessibility_support': 'Accessibility Support & Self-Evacuation Capability',
    'registration.companion': 'Emergency Companion (Optional)',
    'registration.save': 'Save',
    
    // Emergency
    'emergency.title': 'Tell Us Your Current Situation',
    'emergency.earthquake_detected': 'Earthquake Detected',
    'emergency.location_question': 'Where are you currently?',
    'emergency.mobility_question': 'Can you move right now?',
    'emergency.generate_guide': 'Generate Custom Guide',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.next': 'Next',
    'common.back': 'Back',
    'common.close': 'Close'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('korean');

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem('preferred-language', language);
  }, [language]);

  useEffect(() => {
    // Load language preference from localStorage
    const saved = localStorage.getItem('preferred-language') as Language;
    if (saved && (saved === 'korean' || saved === 'english')) {
      setLanguage(saved);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
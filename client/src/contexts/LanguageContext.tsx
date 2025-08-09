import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Language = 'ko' | 'en' | 'vi' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ko: {
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
    'registration.edit_title': '정보 수정',
    'registration.subtitle': '맞춤형 안전 가이드를 위해 정보를 입력해주세요',
    'registration.basic_info': '기본 정보',
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
    'common.close': '닫기',
    
    // Location options
    'emergency.location.home': '집 안 (거실/침실)',
    'emergency.location.office': '사무실/학교',
    'emergency.location.outdoor': '길거리/야외',
    'emergency.location.transport': '지하철/버스',
    
    // Mobility options
    'emergency.mobility.yes': '네, 움직일 수 있습니다',
    'emergency.mobility.no': '아니요, 움직이기 어렵습니다'
  },
  en: {
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
    'common.close': 'Close',
    
    // Location options
    'emergency.location.home': 'Home (Living room/Bedroom)',
    'emergency.location.office': 'Office/School',
    'emergency.location.outdoor': 'Street/Outdoor',
    'emergency.location.transport': 'Subway/Bus',
    
    // Mobility options
    'emergency.mobility.yes': 'Yes, I can move',
    'emergency.mobility.no': 'No, it\'s difficult to move'
  },
  vi: {
    // Navigation
    'nav.dashboard': 'Bảng điều khiển',
    'nav.registration': 'Đăng ký',
    'nav.emergency': 'Khẩn cấp',
    'nav.shelter': 'Tìm nơi trú ẩn',
    'nav.guide': 'Hướng dẫn tùy chỉnh',
    
    // Dashboard
    'dashboard.title': 'La bàn an toàn',
    'dashboard.subtitle': 'Hướng dẫn ứng phó động đất cá nhân hóa',
    'dashboard.emergency_alert': 'Cảnh báo động đất đã được phát',
    'dashboard.earthquake_info': 'Cường độ 6.2, Địa điểm: Gần Seoul',
    'dashboard.time_ago': '2 phút trước',
    'dashboard.respond': 'Ứng phó',
    'dashboard.profile_info': 'Thông tin hồ sơ',
    'dashboard.name': 'Tên',
    'dashboard.age': 'Tuổi',
    'dashboard.evacuation_ability': 'Khả năng sơ tán tự lực',
    'dashboard.accessibility': 'Hỗ trợ tiếp cận',
    'dashboard.address': 'Địa chỉ',
    'dashboard.companion': 'Bạn đồng hành khẩn cấp',
    'dashboard.edit_profile': 'Chỉnh sửa hồ sơ',
    
    // Registration
    'registration.title': 'Đăng ký người dùng',
    'registration.subtitle': 'Vui lòng nhập thông tin cá nhân để ứng phó động đất tùy chỉnh',
    'registration.name': 'Tên',
    'registration.age': 'Tuổi',
    'registration.gender': 'Giới tính',
    'registration.address': 'Địa chỉ',
    'registration.language': 'Ngôn ngữ',
    'registration.accessibility_support': 'Hỗ trợ tiếp cận & Khả năng sơ tán tự lực',
    'registration.companion': 'Bạn đồng hành khẩn cấp (Tùy chọn)',
    'registration.save': 'Lưu',
    
    // Emergency
    'emergency.title': 'Cho chúng tôi biết tình huống hiện tại của bạn',
    'emergency.earthquake_detected': 'Phát hiện động đất',
    'emergency.location_question': 'Bạn hiện đang ở đâu?',
    'emergency.mobility_question': 'Bạn có thể di chuyển ngay bây giờ không?',
    'emergency.generate_guide': 'Tạo hướng dẫn tùy chỉnh',
    
    // Common
    'common.loading': 'Đang tải...',
    'common.error': 'Đã xảy ra lỗi',
    'common.save': 'Lưu',
    'common.cancel': 'Hủy',
    'common.next': 'Tiếp theo',
    'common.back': 'Trở lại',
    'common.close': 'Đóng',
    
    // Location options
    'emergency.location.home': 'Nhà (Phòng khách/Phòng ngủ)',
    'emergency.location.office': 'Văn phòng/Trường học',
    'emergency.location.outdoor': 'Đường phố/Ngoài trời',
    'emergency.location.transport': 'Tàu điện ngầm/Xe buýt',
    
    // Mobility options
    'emergency.mobility.yes': 'Có, tôi có thể di chuyển',
    'emergency.mobility.no': 'Không, khó di chuyển'
  },
  zh: {
    // Navigation
    'nav.dashboard': '仪表板',
    'nav.registration': '注册',
    'nav.emergency': '紧急情况',
    'nav.shelter': '寻找避难所',
    'nav.guide': '自定义指南',
    
    // Dashboard
    'dashboard.title': '安全指南针',
    'dashboard.subtitle': '个性化地震应对指南',
    'dashboard.emergency_alert': '地震警报已发布',
    'dashboard.earthquake_info': '震级6.2，地点：首尔附近',
    'dashboard.time_ago': '2分钟前',
    'dashboard.respond': '响应',
    'dashboard.profile_info': '个人资料信息',
    'dashboard.name': '姓名',
    'dashboard.age': '年龄',
    'dashboard.evacuation_ability': '自主疏散能力',
    'dashboard.accessibility': '无障碍支持',
    'dashboard.address': '地址',
    'dashboard.companion': '紧急伙伴',
    'dashboard.edit_profile': '编辑个人资料',
    
    // Registration
    'registration.title': '用户注册',
    'registration.subtitle': '请输入您的个人信息以获得定制的地震应对方案',
    'registration.name': '姓名',
    'registration.age': '年龄',
    'registration.gender': '性别',
    'registration.address': '地址',
    'registration.language': '语言',
    'registration.accessibility_support': '无障碍支持和自主疏散能力',
    'registration.companion': '紧急伙伴（可选）',
    'registration.save': '保存',
    
    // Emergency
    'emergency.title': '请告诉我们您当前的情况',
    'emergency.earthquake_detected': '检测到地震',
    'emergency.location_question': '您目前在哪里？',
    'emergency.mobility_question': '您现在能够移动吗？',
    'emergency.generate_guide': '生成自定义指南',
    
    // Common
    'common.loading': '加载中...',
    'common.error': '发生错误',
    'common.save': '保存',
    'common.cancel': '取消',
    'common.next': '下一步',
    'common.back': '返回',
    'common.close': '关闭',
    
    // Location options
    'emergency.location.home': '家中（客厅/卧室）',
    'emergency.location.office': '办公室/学校',
    'emergency.location.outdoor': '街道/户外',
    'emergency.location.transport': '地铁/公交车',
    
    // Mobility options
    'emergency.mobility.yes': '是的，我可以移动',
    'emergency.mobility.no': '不，移动困难'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    // Check if language was previously selected
    const savedLanguage = localStorage.getItem('selectedLanguage') as Language;
    return savedLanguage || 'ko';
  });

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem('selectedLanguage', language);
  }, [language]);

  useEffect(() => {
    // Load language preference from localStorage
    const saved = localStorage.getItem('selectedLanguage') as Language;
    if (saved && (saved === 'ko' || saved === 'en' || saved === 'vi' || saved === 'zh')) {
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

// Optional: provide a hook that returns null instead of throwing
export function useLanguageOptional() {
  const context = useContext(LanguageContext);
  return context;
}
interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  ko: {
    "app.title": "안전나침반",
    "app.subtitle": "Safe Compass",
    "dashboard.welcome": "환영합니다!",
    "dashboard.register": "정보 등록하기",
    "dashboard.status.safe": "안전 상태",
    "dashboard.status.message": "현재 위험 상황이 감지되지 않았습니다",
    "emergency.alert": "지진 경보",
    "emergency.location": "현재 상황을 알려주세요",
    "emergency.indoor": "실내",
    "emergency.outdoor": "실외",
    "emergency.canMove": "이동 가능",
    "emergency.cannotMove": "이동 어려움",
    "guide.title": "맞춤 안전 가이드",
    "guide.primaryActions": "즉시 행동 사항",
    "guide.safetyTips": "안전 수칙",
    "guide.specialConsiderations": "특별 주의사항",
    "guide.emergencyContacts": "긴급 연락",
    "shelters.title": "주변 대피소",
    "shelters.directions": "길찾기",
    "sos.title": "긴급 SOS",
    "sos.call119": "119 신고",
    "sos.contactPartner": "동행 파트너에게 알리기",
  },
  en: {
    "app.title": "Safe Compass",
    "app.subtitle": "Emergency Response Guide",
    "dashboard.welcome": "Welcome!",
    "dashboard.register": "Register Information",
    "dashboard.status.safe": "Safe Status",
    "dashboard.status.message": "No dangerous situations detected",
    "emergency.alert": "Earthquake Alert",
    "emergency.location": "Please tell us your current situation",
    "emergency.indoor": "Indoor",
    "emergency.outdoor": "Outdoor",
    "emergency.canMove": "Can Move",
    "emergency.cannotMove": "Difficulty Moving",
    "guide.title": "Personalized Safety Guide",
    "guide.primaryActions": "Immediate Actions",
    "guide.safetyTips": "Safety Tips",
    "guide.specialConsiderations": "Special Considerations",
    "guide.emergencyContacts": "Emergency Contacts",
    "shelters.title": "Nearby Shelters",
    "shelters.directions": "Get Directions",
    "sos.title": "Emergency SOS",
    "sos.call119": "Call 119",
    "sos.contactPartner": "Contact Emergency Partner",
  },
  vi: {
    "app.title": "La Bàn An Toàn",
    "app.subtitle": "Hướng Dẫn Ứng Phó Khẩn Cấp",
    "dashboard.welcome": "Chào mừng!",
    "dashboard.register": "Đăng Ký Thông Tin",
    "dashboard.status.safe": "Trạng Thái An Toàn",
    "dashboard.status.message": "Không phát hiện tình huống nguy hiểm",
    "emergency.alert": "Cảnh Báo Động Đất",
    "emergency.location": "Vui lòng cho biết tình huống hiện tại",
    "emergency.indoor": "Trong nhà",
    "emergency.outdoor": "Ngoài trời",
    "emergency.canMove": "Có thể di chuyển",
    "emergency.cannotMove": "Khó di chuyển",
    "guide.title": "Hướng Dẫn An Toàn Cá Nhân",
    "guide.primaryActions": "Hành Động Ngay Lập Tức",
    "guide.safetyTips": "Mẹo An Toàn",
    "guide.specialConsiderations": "Lưu Ý Đặc Biệt",
    "guide.emergencyContacts": "Liên Lạc Khẩn Cấp",
    "shelters.title": "Nơi Trú Ẩn Gần Đây",
    "shelters.directions": "Chỉ Đường",
    "sos.title": "SOS Khẩn Cấp",
    "sos.call119": "Gọi 119",
    "sos.contactPartner": "Liên Lạc Đối Tác Khẩn Cấp",
  }
};

export function useTranslation(language: string = 'ko') {
  const t = (key: string): string => {
    return translations[language]?.[key] || translations['ko'][key] || key;
  };

  return { t };
}

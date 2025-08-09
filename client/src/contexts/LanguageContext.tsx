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
    'registration.save': '정보 저장하기',
    'registration.name_placeholder': '홍길동',
    'registration.age_placeholder': '25',
    'registration.address_placeholder': '서울특별시 강남구',
    'registration.gender_placeholder': '선택해주세요',
    'registration.gender_male': '남성',
    'registration.gender_female': '여성',
    'registration.gender_other': '기타',
    'registration.mobility': '자력대피 능력',
    'registration.accessibility': '접근성 지원',
    'registration.companion_name': '동행자 이름',
    'registration.companion_phone': '동행자 전화번호',
    'registration.accessibility_normal': '일반',
    'registration.accessibility_normal_desc': '특별한 지원 불필요',
    'registration.accessibility_visual': '시각 지원',
    'registration.accessibility_visual_desc': '음성 안내, 큰 글씨',
    'registration.accessibility_hearing': '청각 지원',
    'registration.accessibility_hearing_desc': '진동, 시각적 신호',
    'registration.language_placeholder': '언어 선택',
    'registration.mobility_independent': '혼자 대피 가능',
    'registration.mobility_assisted': '도움 필요',
    'registration.mobility_independent_desc': '혼자서도 신속히 이동',
    'registration.mobility_assisted_desc': '타인의 도움 필요',
    'registration.companion_subtitle': '응급상황 시 연락받을 동행 파트너의 정보를 입력해주세요. 이 정보는 SOS 신호 시 자동으로 전송됩니다.',
    'registration.companion_name_desc': '응급상황 시 연락받을 사람의 이름',
    'registration.companion_phone_desc': 'SMS와 전화로 응급상황을 알릴 번호',
    'registration.companion_relationship': '관계',
    'registration.companion_relationship_placeholder': '동행 파트너와의 관계를 선택해주세요',
    'registration.companion_relationship_desc': '응급상황 시 연락받을 사람과의 관계',
    'registration.companion_name_placeholder': '김철수',
    'registration.companion_phone_placeholder': '010-1234-5678',
    'registration.companion_family': '가족 (배우자, 부모, 자녀)',
    'registration.companion_friend': '친구',
    'registration.companion_neighbor': '이웃',
    'registration.companion_colleague': '직장 동료',
    'registration.companion_caregiver': '돌봄 제공자',
    'registration.companion_role_title': '동행 파트너 역할',
    'registration.companion_role_1': '응급상황 발생 시 SMS로 위치와 상황 정보 자동 전송',
    'registration.companion_role_2': '대피가 어려운 경우 구조 지원 요청',
    'registration.companion_role_3': '의료진에게 개인 정보 제공 (필요시)',
    
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
    'registration.save': 'Save Profile',
    'registration.basic_info': 'Basic Information',
    'registration.edit_title': 'Edit Information',
    'registration.name_placeholder': 'John Doe',
    'registration.age_placeholder': '25',
    'registration.address_placeholder': 'Seoul, South Korea',
    'registration.gender_placeholder': 'Select gender',
    'registration.gender_male': 'Male',
    'registration.gender_female': 'Female',
    'registration.gender_other': 'Other',
    'registration.language_placeholder': 'Select language',
    'registration.accessibility': 'Accessibility Support',
    'registration.accessibility_normal': 'Normal',
    'registration.accessibility_normal_desc': 'No special support needed',
    'registration.accessibility_visual': 'Visual Support',
    'registration.accessibility_visual_desc': 'Voice guidance, large text',
    'registration.accessibility_hearing': 'Hearing Support',
    'registration.accessibility_hearing_desc': 'Vibration, visual signals',
    'registration.mobility': 'Self-Evacuation Capability',
    'registration.mobility_independent': 'Can Evacuate Alone',
    'registration.mobility_assisted': 'Need Assistance',
    'registration.mobility_independent_desc': 'Can move quickly alone',
    'registration.mobility_assisted_desc': 'Need help from others',
    'registration.companion_subtitle': 'Enter information for your emergency companion who will be notified during emergencies. This information will be automatically sent with SOS signals.',
    'registration.companion_name': 'Emergency Companion Name',
    'registration.companion_phone': 'Phone Number',
    'registration.companion_name_desc': 'Name of person to contact in emergency',
    'registration.companion_phone_desc': 'Number for SMS and emergency calls',
    'registration.companion_relationship': 'Relationship',
    'registration.companion_relationship_placeholder': 'Select your relationship with emergency companion',
    'registration.companion_relationship_desc': 'Relationship with emergency contact',
    'registration.companion_name_placeholder': 'John Smith',
    'registration.companion_phone_placeholder': '010-1234-5678',
    'registration.companion_family': 'Family (spouse, parent, child)',
    'registration.companion_friend': 'Friend',
    'registration.companion_neighbor': 'Neighbor',
    'registration.companion_colleague': 'Work Colleague',
    'registration.companion_caregiver': 'Caregiver',
    'registration.companion_role_title': 'Emergency Companion Role',
    'registration.companion_role_1': 'Automatic SMS with location and situation info during emergencies',
    'registration.companion_role_2': 'Request rescue assistance if evacuation is difficult',
    'registration.companion_role_3': 'Provide personal information to medical staff (if needed)',
    
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
    'dashboard.title': 'La Bàn An Toàn',
    'dashboard.subtitle': 'Hướng Dẫn Ứng Phó Động Đất Cá Nhân',
    'dashboard.emergency_alert': 'Cảnh Báo Động Đất',
    'dashboard.earthquake_info': 'Cường độ 6.2, Vị trí: Gần Seoul',
    'dashboard.time_ago': '2 phút trước',
    'dashboard.respond': 'Phản hồi',
    'dashboard.profile_info': 'Thông Tin Hồ Sơ',
    'dashboard.name': 'Tên',
    'dashboard.age': 'Tuổi',
    'dashboard.evacuation_ability': 'Khả Năng Tự Sơ Tán',
    'dashboard.accessibility': 'Hỗ Trợ Tiếp Cận',
    'dashboard.address': 'Địa Chỉ',
    'dashboard.companion': 'Người Đồng Hành Khẩn Cấp',
    'dashboard.edit_profile': 'Chỉnh Sửa Hồ Sơ',
    
    // Registration
    'registration.title': 'Đăng Ký Người Dùng',
    'registration.subtitle': 'Vui lòng nhập thông tin cá nhân để có hướng dẫn ứng phó động đất tùy chỉnh',
    'registration.basic_info': 'Thông Tin Cơ Bản',
    'registration.name': 'Tên',
    'registration.age': 'Tuổi',
    'registration.gender': 'Giới Tính',
    'registration.address': 'Địa Chỉ',
    'registration.language': 'Ngôn Ngữ',
    'registration.accessibility_support': 'Hỗ Trợ Tiếp Cận & Khả Năng Tự Sơ Tán',
    'registration.companion': 'Người Đồng Hành Khẩn Cấp (Tùy Chọn)',
    'registration.save': 'Lưu Hồ Sơ',
    'registration.name_placeholder': 'Nguyễn Văn A',
    'registration.age_placeholder': '25',
    'registration.address_placeholder': 'Seoul, Hàn Quốc',
    'registration.gender_placeholder': 'Chọn giới tính',
    'registration.gender_male': 'Nam',
    'registration.gender_female': 'Nữ',
    'registration.gender_other': 'Khác',
    'registration.language_placeholder': 'Chọn ngôn ngữ',
    'registration.accessibility': 'Hỗ Trợ Tiếp Cận',
    'registration.accessibility_normal': 'Bình Thường',
    'registration.accessibility_normal_desc': 'Không cần hỗ trợ đặc biệt',
    'registration.accessibility_visual': 'Hỗ Trợ Thị Giác',
    'registration.accessibility_visual_desc': 'Hướng dẫn giọng nói, chữ lớn',
    'registration.accessibility_hearing': 'Hỗ Trợ Thính Giác',
    'registration.accessibility_hearing_desc': 'Rung động, tín hiệu hình ảnh',
    'registration.mobility': 'Khả Năng Tự Sơ Tán',
    'registration.mobility_independent': 'Có Thể Sơ Tán Một Mình',
    'registration.mobility_assisted': 'Cần Hỗ Trợ',
    'registration.mobility_independent_desc': 'Có thể di chuyển nhanh một mình',
    'registration.mobility_assisted_desc': 'Cần sự giúp đỡ từ người khác',
    'registration.companion_subtitle': 'Nhập thông tin người đồng hành khẩn cấp sẽ được thông báo trong trường hợp khẩn cấp. Thông tin này sẽ tự động gửi cùng tín hiệu SOS.',
    'registration.companion_name': 'Tên Người Đồng Hành Khẩn Cấp',
    'registration.companion_phone': 'Số Điện Thoại',
    'registration.companion_name_desc': 'Tên người liên lạc trong trường hợp khẩn cấp',
    'registration.companion_phone_desc': 'Số điện thoại cho SMS và cuộc gọi khẩn cấp',
    'registration.companion_relationship': 'Mối Quan Hệ',
    'registration.companion_relationship_placeholder': 'Chọn mối quan hệ với người đồng hành khẩn cấp',
    'registration.companion_relationship_desc': 'Mối quan hệ với người liên lạc khẩn cấp',
    'registration.companion_name_placeholder': 'Nguyễn Văn B',
    'registration.companion_phone_placeholder': '010-1234-5678',
    'registration.companion_family': 'Gia đình (vợ/chồng, bố mẹ, con)',
    'registration.companion_friend': 'Bạn',
    'registration.companion_neighbor': 'Hàng xóm',
    'registration.companion_colleague': 'Đồng nghiệp',
    'registration.companion_caregiver': 'Người chăm sóc',
    'registration.companion_role_title': 'Vai Trò Người Đồng Hành Khẩn Cấp',
    'registration.companion_role_1': 'SMS tự động với thông tin vị trí và tình huống trong trường hợp khẩn cấp',
    'registration.companion_role_2': 'Yêu cầu hỗ trợ cứu hộ nếu sơ tán khó khăn',
    'registration.companion_role_3': 'Cung cấp thông tin cá nhân cho nhân viên y tế (nếu cần)',
    
    // Emergency
    'emergency.title': 'Hãy Cho Chúng Tôi Biết Tình Huống Hiện Tại',
    'emergency.earthquake_detected': 'Phát Hiện Động Đất',
    'emergency.location_question': 'Bạn đang ở đâu hiện tại?',
    'emergency.mobility_question': 'Bạn có thể di chuyển ngay bây giờ không?',
    'emergency.generate_guide': 'Tạo Hướng Dẫn Tùy Chỉnh',
    
    // Common
    'common.loading': 'Đang tải...',
    'common.error': 'Đã xảy ra lỗi',
    'common.save': 'Lưu',
    'common.cancel': 'Hủy',
    'common.next': 'Tiếp theo',
    'common.back': 'Quay lại',
    'common.close': 'Đóng',
    
    // Location options
    'emergency.location.home': 'Nhà (phòng khách/phòng ngủ)',
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
    'dashboard.emergency_alert': '地震警报',
    'dashboard.earthquake_info': '震级6.2，位置：首尔附近',
    'dashboard.time_ago': '2分钟前',
    'dashboard.respond': '响应',
    'dashboard.profile_info': '个人资料信息',
    'dashboard.name': '姓名',
    'dashboard.age': '年龄',
    'dashboard.evacuation_ability': '自主疏散能力',
    'dashboard.accessibility': '无障碍支持',
    'dashboard.address': '地址',
    'dashboard.companion': '紧急联系人',
    'dashboard.edit_profile': '编辑个人资料',
    
    // Registration
    'registration.title': '用户注册',
    'registration.subtitle': '请输入您的个人信息以获得定制的地震应对指南',
    'registration.basic_info': '基本信息',
    'registration.name': '姓名',
    'registration.age': '年龄',
    'registration.gender': '性别',
    'registration.address': '地址',
    'registration.language': '语言',
    'registration.accessibility_support': '无障碍支持与自主疏散能力',
    'registration.companion': '紧急联系人（可选）',
    'registration.save': '保存资料',
    'registration.name_placeholder': '张三',
    'registration.age_placeholder': '25',
    'registration.address_placeholder': '韩国首尔',
    'registration.gender_placeholder': '选择性别',
    'registration.gender_male': '男',
    'registration.gender_female': '女',
    'registration.gender_other': '其他',
    'registration.language_placeholder': '选择语言',
    'registration.accessibility': '无障碍支持',
    'registration.accessibility_normal': '正常',
    'registration.accessibility_normal_desc': '无需特殊支持',
    'registration.accessibility_visual': '视觉支持',
    'registration.accessibility_visual_desc': '语音指导，大字体',
    'registration.accessibility_hearing': '听觉支持',
    'registration.accessibility_hearing_desc': '振动，视觉信号',
    'registration.mobility': '自主疏散能力',
    'registration.mobility_independent': '能够独立疏散',
    'registration.mobility_assisted': '需要协助',
    'registration.mobility_independent_desc': '能够独自快速移动',
    'registration.mobility_assisted_desc': '需要他人帮助',
    'registration.companion_subtitle': '输入紧急情况下将被通知的紧急联系人信息。此信息将随SOS信号自动发送。',
    'registration.companion_name': '紧急联系人姓名',
    'registration.companion_phone': '电话号码',
    'registration.companion_name_desc': '紧急情况下联系的人员姓名',
    'registration.companion_phone_desc': '短信和紧急通话号码',
    'registration.companion_relationship': '关系',
    'registration.companion_relationship_placeholder': '选择与紧急联系人的关系',
    'registration.companion_relationship_desc': '与紧急联系人的关系',
    'registration.companion_name_placeholder': '李四',
    'registration.companion_phone_placeholder': '010-1234-5678',
    'registration.companion_family': '家人（配偶、父母、子女）',
    'registration.companion_friend': '朋友',
    'registration.companion_neighbor': '邻居',
    'registration.companion_colleague': '同事',
    'registration.companion_caregiver': '护理人员',
    'registration.companion_role_title': '紧急联系人职责',
    'registration.companion_role_1': '紧急情况下自动发送位置和情况信息短信',
    'registration.companion_role_2': '疏散困难时请求救援协助',
    'registration.companion_role_3': '向医务人员提供个人信息（如需要）',
    
    // Emergency
    'emergency.title': '请告诉我们您的当前情况',
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
    'emergency.location.transport': '地铁/公交',
    
    // Mobility options
    'emergency.mobility.yes': '是，我能够移动',
    'emergency.mobility.no': '不，移动困难'
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
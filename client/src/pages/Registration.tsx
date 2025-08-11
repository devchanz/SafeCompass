import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useLanguage } from "@/contexts/LanguageContext";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

const registrationSchema = insertUserSchema.extend({
  partner: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relationship: z.string().optional(),
  }).optional(),
});

type RegistrationData = z.infer<typeof registrationSchema>;

export default function Registration() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { language } = useLanguage();

  // 하드코딩된 다국어 텍스트
  const getText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      ko: {
        title: '개인정보 등록',
        subtitle: '맞춤형 안전 가이드를 위한 기본 정보',
        name: '이름',
        name_placeholder: '성명을 입력하세요',
        age: '나이',
        gender: '성별',
        gender_placeholder: '성별을 선택하세요',
        male: '남성',
        female: '여성',
        other: '기타',
        address: '주소',
        address_placeholder: '주소를 입력하세요',
        language: '언어',
        accessibility_support: '접근성 지원',
        accessibility: '접근성',
        accessibility_normal: '일반',
        accessibility_normal_desc: '특별한 지원이 필요하지 않음',
        accessibility_visual: '시각 지원',
        accessibility_visual_desc: '시각 지원이 필요한 분을 위한 음성 안내',
        accessibility_hearing: '청각 지원', 
        accessibility_hearing_desc: '청각 지원이 필요한 분을 위한 진동/시각 알림',
        mobility: '이동성',
        independent: '독립적 이동',
        assistance: '도움 필요',
        wheelchair: '휠체어 사용자',
        companion: '동행자',
        companion_subtitle: '비상 시 연락할 동행자 정보 (선택사항)',
        companion_name: '동행자 이름',
        companion_phone: '동행자 연락처',
        companion_relationship: '관계',
        submit: '등록하기',
        update: '수정하기',
        registration_success: '등록이 완료되었습니다',
        update_success: '프로필이 수정되었습니다'
      },
      en: {
        title: 'Personal Information Registration',
        subtitle: 'Basic information for personalized safety guide',
        name: 'Name',
        name_placeholder: 'Enter your name',
        age: 'Age',
        gender: 'Gender',
        gender_placeholder: 'Select gender',
        male: 'Male',
        female: 'Female',
        other: 'Other',
        address: 'Address',
        address_placeholder: 'Enter your address',
        language: 'Language',
        accessibility_support: 'Accessibility Support',
        accessibility: 'Accessibility',
        accessibility_normal: 'Normal',
        accessibility_normal_desc: 'No special support needed',
        accessibility_visual: 'Visual Support',
        accessibility_visual_desc: 'Voice guidance for those who need visual support',
        accessibility_hearing: 'Hearing Support',
        accessibility_hearing_desc: 'Vibration/visual alerts for those who need hearing support',
        mobility: 'Mobility',
        independent: 'Independent movement',
        assistance: 'Assistance needed',
        wheelchair: 'Wheelchair user',
        companion: 'Companion',
        companion_subtitle: 'Emergency contact information (optional)',
        companion_name: 'Companion Name',
        companion_phone: 'Companion Phone',
        companion_relationship: 'Relationship',
        submit: 'Register',
        update: 'Update',
        registration_success: 'Registration completed successfully',
        update_success: 'Profile updated successfully'
      },
      vi: {
        title: 'Đăng ký thông tin cá nhân',
        subtitle: 'Thông tin cơ bản cho hướng dẫn an toàn cá nhân hóa',
        name: 'Tên',
        name_placeholder: 'Nhập tên của bạn',
        age: 'Tuổi',
        gender: 'Giới tính',
        gender_placeholder: 'Chọn giới tính',
        male: 'Nam',
        female: 'Nữ',
        other: 'Khác',
        address: 'Địa chỉ',
        address_placeholder: 'Nhập địa chỉ của bạn',
        language: 'Ngôn ngữ',
        accessibility_support: 'Hỗ trợ khả năng tiếp cận',
        accessibility: 'Khả năng tiếp cận',
        accessibility_normal: 'Bình thường',
        accessibility_normal_desc: 'Không cần hỗ trợ đặc biệt',
        accessibility_visual: 'Hỗ trợ thị giác',
        accessibility_visual_desc: 'Hướng dẫn giọng nói cho người cần hỗ trợ thị giác',
        accessibility_hearing: 'Hỗ trợ thính giác',
        accessibility_hearing_desc: 'Cảnh báo rung/hình ảnh cho người cần hỗ trợ thính giác',
        mobility: 'Tính di động',
        independent: 'Di chuyển độc lập',
        assistance: 'Cần hỗ trợ',
        wheelchair: 'Người dùng xe lăn',
        companion: 'Người đồng hành',
        companion_subtitle: 'Thông tin liên hệ khẩn cấp (tùy chọn)',
        companion_name: 'Tên người đồng hành',
        companion_phone: 'Điện thoại người đồng hành',
        companion_relationship: 'Mối quan hệ',
        submit: 'Đăng ký',
        update: 'Cập nhật',
        registration_success: 'Đăng ký thành công',
        update_success: 'Cập nhật hồ sơ thành công'
      },
      zh: {
        title: '个人信息注册',
        subtitle: '个性化安全指南的基本信息',
        name: '姓名',
        name_placeholder: '请输入您的姓名',
        age: '年龄',
        gender: '性别',
        gender_placeholder: '请选择性别',
        male: '男',
        female: '女',
        other: '其他',
        address: '地址',
        address_placeholder: '请输入您的地址',
        language: '语言',
        accessibility_support: '无障碍支持',
        accessibility: '无障碍',
        accessibility_normal: '正常',
        accessibility_normal_desc: '不需要特殊支持',
        accessibility_visual: '视觉支持',
        accessibility_visual_desc: '为需要视觉支持的人士提供语音指导',
        accessibility_hearing: '听觉支持',
        accessibility_hearing_desc: '为需要听觉支持的人士提供振动/视觉提醒',
        mobility: '行动能力',
        independent: '独立行动',
        assistance: '需要帮助',
        wheelchair: '轮椅使用者',
        companion: '同伴',
        companion_subtitle: '紧急联系信息（可选）',
        companion_name: '同伴姓名',
        companion_phone: '同伴电话',
        companion_relationship: '关系',
        submit: '注册',
        update: '更新',
        registration_success: '注册成功完成',
        update_success: '个人资料更新成功'
      }
    };
    return texts[language]?.[key] || texts['ko'][key] || key;
  };
  const { data: existingProfile, createProfile, updateProfile, createCompanion } = useUserProfile();
  
  // Check if this is editing mode (existing registered user) vs new registration
  const isEditMode = localStorage.getItem('hasRegistered') === 'true' && existingProfile;
  
  const [selectedAccessibility, setSelectedAccessibility] = useState<string[]>(
    isEditMode ? (existingProfile?.accessibility || []) : []
  );

  const form = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: isEditMode ? (existingProfile?.name || "") : "",
      age: isEditMode ? (existingProfile?.age || 0) : 0,
      gender: isEditMode ? (existingProfile?.gender || "") : "",
      address: isEditMode ? (existingProfile?.address || "") : "",
      language: language, // Always use current language selection
      accessibility: isEditMode ? (existingProfile?.accessibility || []) : [],
      mobility: isEditMode ? (existingProfile?.mobility || "independent") : "independent",
      partner: {
        name: "",
        phone: "",
        relationship: "",
      },
    },
  });

  const onSubmit = async (data: RegistrationData) => {
    try {
      const profileData = {
        name: data.name,
        age: data.age,
        gender: data.gender,
        address: data.address,
        language: language, // Use the selected language from context
        mobility: data.mobility,
        accessibility: selectedAccessibility,
      };

      let userId = existingProfile?.id;

      if (isEditMode && existingProfile) {
        await updateProfile.mutateAsync({
          id: existingProfile.id,
          ...profileData,
        });
        toast({
          title: getText('update_success'),
          description: getText('update_success'),
        });
      } else {
        const newUser = await createProfile.mutateAsync(profileData);
        userId = newUser.id;
        toast({
          title: getText('registration_success'),
          description: getText('registration_success'),
        });
      }

      // Create companion if provided
      if (data.partner?.name && data.partner?.phone && userId) {
        try {
          await createCompanion.mutateAsync({
            userId,
            name: data.partner.name,
            phone: data.partner.phone,
            relationship: data.partner.relationship || 'friend',
          });
        } catch (companionError) {
          console.error("Companion creation failed:", companionError);
          // Don't fail the whole process if companion creation fails
        }
      }

      // Mark user as registered for proper flow control
      if (!isEditMode) {
        localStorage.setItem('hasRegistered', 'true');
        localStorage.setItem('currentUserId', userId || 'new-user');
        // Add a delay to ensure localStorage is properly set
        setTimeout(() => {
          setLocation("/");
        }, 200);
      } else {
        setLocation("/");
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "등록 중 오류가 발생했습니다",
        variant: "destructive",
      });
    }
  };

  const toggleAccessibility = (type: string) => {
    setSelectedAccessibility(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-3 h-3 bg-emergency rounded-full"></div>
          <div className="w-12 h-0.5 bg-gray-300"></div>
          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          <div className="w-12 h-0.5 bg-gray-300"></div>
          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-900">
          {isEditMode ? getText('update') : getText('title')}
        </h2>
        <p className="text-center text-gray-600 mt-2">
          {getText('subtitle')}
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center text-gray-900 dark:text-white">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full flex items-center justify-center mr-3">
                <i className="fas fa-user text-lg" aria-hidden="true"></i>
              </div>
              기본 정보
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">{getText('name')} <span className="text-emergency">*</span></Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder={getText('name_placeholder')}
                  required
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="age">{getText('age')} <span className="text-emergency">*</span></Label>
                <Input
                  id="age"
                  type="number"
                  {...form.register("age", { valueAsNumber: true })}
                  placeholder="0"
                  min="1"
                  max="120"
                  required
                />
                {form.formState.errors.age && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.age.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="gender">{getText('gender')}</Label>
                <Select onValueChange={(value) => form.setValue("gender", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={getText('gender_placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{getText('male')}</SelectItem>
                    <SelectItem value="female">{getText('female')}</SelectItem>
                    <SelectItem value="other">{getText('other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="address">{getText('address')} <span className="text-emergency">*</span></Label>
                <Input
                  id="address"
                  {...form.register("address")}
                  placeholder={getText('address_placeholder')}
                  required
                />
                {form.formState.errors.address && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.address.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility and Mobility Assessment */}
        <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center text-gray-900 dark:text-white">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full flex items-center justify-center mr-3">
                <i className="fas fa-universal-access text-lg" aria-hidden="true"></i>
              </div>
              {getText('accessibility_support')}
            </h3>
            
            {/* Accessibility Support Section */}
            <div className="mb-8">
              <Label className="text-base font-medium mb-4 block">{getText('accessibility')}</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button
                  type="button"
                  variant={selectedAccessibility.length === 0 ? "default" : "outline"}
                  className={`p-4 h-auto flex-col space-y-2 rounded-2xl border-0 transition-all duration-300 transform hover:scale-105 ${
                    selectedAccessibility.length === 0 
                      ? 'bg-gradient-to-r from-gray-100 to-gray-200 shadow-lg' 
                      : 'bg-white hover:bg-gray-50 shadow-md hover:shadow-lg'
                  }`}
                  onClick={() => setSelectedAccessibility([])}
                  aria-label="일반 사용자 - 특별한 접근성 지원이 필요하지 않습니다"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <i className="fas fa-user-check text-2xl text-gray-600" aria-hidden="true"></i>
                  </div>
                  <div className="text-center px-2">
                    <p className={`text-sm font-semibold leading-tight ${selectedAccessibility.length === 0 ? 'text-gray-800' : 'text-gray-700'}`}>
                      {getText('accessibility_normal')}
                    </p>
                    <p className="text-xs text-gray-600 leading-tight mt-1 break-words">
                      {getText('accessibility_normal_desc')}
                    </p>
                  </div>
                </Button>
                
                <Button
                  type="button"
                  variant={selectedAccessibility.includes('visual') ? "default" : "outline"}
                  className={`p-4 h-auto flex-col space-y-2 rounded-2xl border-0 transition-all duration-300 transform hover:scale-105 min-h-[120px] ${
                    selectedAccessibility.includes('visual') 
                      ? 'bg-gradient-to-r from-blue-100 to-blue-200 shadow-lg' 
                      : 'bg-white hover:bg-blue-50 shadow-md hover:shadow-lg'
                  }`}
                  onClick={() => toggleAccessibility('visual')}
                  aria-label="시각 지원 - 음성 안내와 큰 글씨를 제공합니다"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <i className="fas fa-low-vision text-2xl text-blue-600" aria-hidden="true"></i>
                  </div>
                  <div className="text-center px-2">
                    <p className={`text-sm font-semibold leading-tight ${selectedAccessibility.includes('visual') ? 'text-blue-800' : 'text-gray-700'} break-words`}>
                      {getText('accessibility_visual')}
                    </p>
                    <p className="text-xs text-gray-600 leading-tight mt-1 break-words">
                      {getText('accessibility_visual_desc')}
                    </p>
                  </div>
                </Button>
                
                <Button
                  type="button"
                  variant={selectedAccessibility.includes('hearing') ? "default" : "outline"}
                  className={`p-4 h-auto flex-col space-y-2 rounded-2xl border-0 transition-all duration-300 transform hover:scale-105 min-h-[120px] ${
                    selectedAccessibility.includes('hearing') 
                      ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 shadow-lg' 
                      : 'bg-white hover:bg-yellow-50 shadow-md hover:shadow-lg'
                  }`}
                  onClick={() => toggleAccessibility('hearing')}
                  aria-label="청각 지원 - 진동 알림과 시각적 신호를 제공합니다"
                >
                  <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
                    <i className="fas fa-assistive-listening-systems text-2xl text-yellow-600" aria-hidden="true"></i>
                  </div>
                  <div className="text-center px-2">
                    <p className={`text-sm font-semibold leading-tight ${selectedAccessibility.includes('hearing') ? 'text-yellow-800' : 'text-gray-700'} break-words`}>
                      {getText('accessibility_hearing')}
                    </p>
                    <p className="text-xs text-gray-600 leading-tight mt-1 break-words">
                      {getText('accessibility_hearing_desc')}
                    </p>
                  </div>
                </Button>
              </div>
            </div>

            {/* Self-Evacuation Capability Section */}
            <div>
              <Label className="text-base font-medium mb-4 block">{getText('mobility')}</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={form.watch("mobility") === "independent" ? "default" : "outline"}
                  className={`p-6 h-auto flex-col space-y-3 rounded-2xl border-0 transition-all duration-300 transform hover:scale-105 ${
                    form.watch("mobility") === "independent"
                      ? 'bg-gradient-to-r from-green-100 to-green-200 shadow-lg'
                      : 'bg-white hover:bg-green-50 shadow-md hover:shadow-lg'
                  }`}
                  onClick={() => form.setValue("mobility", "independent")}
                  aria-label="자력대피 가능 - 혼자서도 안전한 장소로 신속히 이동할 수 있습니다"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                    <i className="fas fa-running text-2xl text-green-600" aria-hidden="true"></i>
                  </div>
                  <div className="text-center px-2">
                    <p className={`text-sm font-semibold leading-tight ${form.watch("mobility") === "independent" ? 'text-green-800' : 'text-gray-700'} break-words`}>
                      {getText('independent')}
                    </p>
                    <p className="text-xs text-gray-600 leading-tight mt-1 break-words">
                      {language === 'ko' ? '혼자서도 안전하게 이동 가능' : language === 'en' ? 'Can move safely alone' : language === 'vi' ? 'Có thể di chuyển an toàn một mình' : '可以안전地독자행동'}
                    </p>
                  </div>
                </Button>
                
                <Button
                  type="button"
                  variant={form.watch("mobility") === "assisted" ? "default" : "outline"}
                  className={`p-6 h-auto flex-col space-y-3 rounded-2xl border-0 transition-all duration-300 transform hover:scale-105 ${
                    form.watch("mobility") === "assisted"
                      ? 'bg-gradient-to-r from-orange-100 to-orange-200 shadow-lg'
                      : 'bg-white hover:bg-orange-50 shadow-md hover:shadow-lg'
                  }`}
                  onClick={() => form.setValue("mobility", "assisted")}
                  aria-label="도움 필요 - 다른 사람의 도움이 있어야 안전하게 대피할 수 있습니다"
                >
                  <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                    <i className="fas fa-hands-helping text-2xl text-orange-500" aria-hidden="true"></i>
                  </div>
                  <div className="text-center px-2">
                    <p className={`text-sm font-semibold leading-tight ${form.watch("mobility") === "assisted" ? 'text-orange-800' : 'text-gray-700'} break-words`}>
                      {getText('assistance')}
                    </p>
                    <p className="text-xs text-gray-600 leading-tight mt-1 break-words">
                      {language === 'ko' ? '다른 사람의 도움이 필요' : language === 'en' ? 'Need assistance from others' : language === 'vi' ? 'Cần sự hỗ trợ từ người khác' : '需要他人帮助'}
                    </p>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Companion */}
        <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center text-gray-900 dark:text-white">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center mr-3">
                <i className="fas fa-user-friends text-lg" aria-hidden="true"></i>
              </div>
              {getText('companion')}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
{getText('companion_subtitle')}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="partnerName">{getText('companion_name')}</Label>
                <Input
                  id="partnerName"
                  {...form.register("partner.name")}
                  placeholder={language === 'ko' ? '동행자 이름 입력' : language === 'en' ? 'Enter companion name' : language === 'vi' ? 'Nhập tên người đồng hành' : '输入同伴姓名'}
                  aria-describedby="partnerName-desc"
                />
                <p id="partnerName-desc" className="text-xs text-gray-500 mt-1">
                  {language === 'ko' ? '비상시 연락할 사람' : language === 'en' ? 'Person to contact in emergency' : language === 'vi' ? 'Người liên hệ trong trường hợp khẩn cấp' : '紧急情况下的联系人'}
                </p>
              </div>
              
              <div>
                <Label htmlFor="partnerPhone">{getText('companion_phone')}</Label>
                <Input
                  id="partnerPhone"
                  type="tel"
                  {...form.register("partner.phone")}
                  placeholder={language === 'ko' ? '010-0000-0000' : language === 'en' ? 'Phone number' : language === 'vi' ? 'Số điện thoại' : '电话号码'}
                  aria-describedby="partnerPhone-desc"
                />
                <p id="partnerPhone-desc" className="text-xs text-gray-500 mt-1">
                  {language === 'ko' ? '비상시 연락받을 번호' : language === 'en' ? 'Emergency contact number' : language === 'vi' ? 'Số liên hệ khẩn cấp' : '紧急联系电话'}
                </p>
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="partnerRelationship">{getText('companion_relationship')}</Label>
                <Select onValueChange={(value) => form.setValue("partner.relationship", value)}>
                  <SelectTrigger aria-describedby="relationship-desc">
                    <SelectValue placeholder={language === 'ko' ? '관계를 선택하세요' : language === 'en' ? 'Select relationship' : language === 'vi' ? 'Chọn mối quan hệ' : '选择关系'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="family">{language === 'ko' ? '가족' : language === 'en' ? 'Family' : language === 'vi' ? 'Gia đình' : '家人'}</SelectItem>
                    <SelectItem value="friend">{language === 'ko' ? '친구' : language === 'en' ? 'Friend' : language === 'vi' ? 'Bạn bè' : '朋友'}</SelectItem>
                    <SelectItem value="neighbor">{language === 'ko' ? '이웃' : language === 'en' ? 'Neighbor' : language === 'vi' ? 'Hàng xóm' : '邻居'}</SelectItem>
                    <SelectItem value="colleague">{language === 'ko' ? '동료' : language === 'en' ? 'Colleague' : language === 'vi' ? 'Đồng nghiệp' : '同事'}</SelectItem>
                    <SelectItem value="caregiver">{language === 'ko' ? '보호자' : language === 'en' ? 'Caregiver' : language === 'vi' ? 'Người chăm sóc' : '护理员'}</SelectItem>
                  </SelectContent>
                </Select>
                <p id="relationship-desc" className="text-xs text-gray-500 mt-1">
                  {language === 'ko' ? '동행자와의 관계' : language === 'en' ? 'Relationship with companion' : language === 'vi' ? 'Mối quan hệ với người đồng hành' : '与同伴的关系'}
                </p>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <i className="fas fa-info-circle text-blue-600 mt-0.5" aria-hidden="true"></i>
                <div className="text-sm">
                  <p className="font-medium text-blue-800 mb-1">
                    {language === 'ko' ? '동행자의 역할' : language === 'en' ? 'Companion\'s Role' : language === 'vi' ? 'Vai trò của người đồng hành' : '同伴的作用'}
                  </p>
                  <ul className="text-blue-700 space-y-1 text-xs">
                    <li>• {language === 'ko' ? '비상시 안전 확인 및 연락' : language === 'en' ? 'Safety check and contact in emergencies' : language === 'vi' ? 'Kiểm tra an toàn và liên lạc trong trường hợp khẩn cấp' : '紧急情况下的安全检查和联系'}</li>
                    <li>• {language === 'ko' ? '대피 과정에서 도움 제공' : language === 'en' ? 'Assistance during evacuation' : language === 'vi' ? 'Hỗ trợ trong quá trình sơ tán' : '疏散过程中的协助'}</li>
                    <li>• {language === 'ko' ? '가족/친구에게 상황 전달' : language === 'en' ? 'Update family/friends on situation' : language === 'vi' ? 'Thông báo tình hình cho gia đình/bạn bè' : '向家人/朋友通报情况'}</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Language Selection */}
        <Card className="shadow-lg border-0 bg-white dark:bg-gray-800">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center text-gray-900 dark:text-white">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-full flex items-center justify-center mr-3">
                <i className="fas fa-globe text-lg" aria-hidden="true"></i>
              </div>
              {getText('language')}
            </h3>
            <Select onValueChange={(value) => form.setValue("language", value)} defaultValue={form.watch("language")}>
              <SelectTrigger>
                <SelectValue placeholder="언어를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ko">🇰🇷 한국어</SelectItem>
                <SelectItem value="en">🇺🇸 English</SelectItem>
                <SelectItem value="vi">🇻🇳 Tiếng Việt</SelectItem>
                <SelectItem value="zh">🇨🇳 中文</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="pt-6">
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            disabled={form.formState.isSubmitting}
          >
            <div className="flex items-center justify-center space-x-2">
              <i className={`fas ${form.formState.isSubmitting ? 'fa-spinner fa-spin' : 'fa-save'}`} aria-hidden="true"></i>
              <span className="truncate">
                {form.formState.isSubmitting ? 
                  (language === 'ko' ? '저장 중...' : language === 'en' ? 'Saving...' : language === 'vi' ? 'Đang lưu...' : '保存中...') : 
                  (isEditMode ? getText('update') : getText('submit'))
                }
              </span>
            </div>
          </Button>
        </div>
      </form>
    </div>
  );
}

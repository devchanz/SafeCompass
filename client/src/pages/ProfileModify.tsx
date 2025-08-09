import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useLanguage } from "@/contexts/LanguageContext";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

const modifySchema = insertUserSchema.extend({
  partner: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relationship: z.string().optional(),
  }).optional(),
});

type ModifyData = z.infer<typeof modifySchema>;

export default function ProfileModify() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { language } = useLanguage();

  // 하드코딩된 다국어 텍스트
  const getText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      ko: {
        title: '프로필 수정',
        subtitle: '개인 정보 수정',
        save: '수정 완료',
        saving: '저장 중...',
        cancel: '취소',
        profile_updated: '프로필이 수정되었습니다',
        error: '오류',
        profile_not_found: '프로필 정보를 찾을 수 없습니다.',
        update_failed: '프로필 업데이트에 실패했습니다.'
      },
      en: {
        title: 'Edit Profile',
        subtitle: 'Edit Personal Information',
        save: 'Save Changes',
        saving: 'Saving...',
        cancel: 'Cancel',
        profile_updated: 'Profile has been updated',
        error: 'Error',
        profile_not_found: 'Profile information not found.',
        update_failed: 'Failed to update profile.'
      },
      vi: {
        title: 'Chỉnh sửa hồ sơ',
        subtitle: 'Chỉnh sửa thông tin cá nhân',
        save: 'Lưu thay đổi',
        saving: 'Đang lưu...',
        cancel: 'Hủy',
        profile_updated: 'Hồ sơ đã được cập nhật',
        error: 'Lỗi',
        profile_not_found: 'Không tìm thấy thông tin hồ sơ.',
        update_failed: 'Cập nhật hồ sơ thất bại.'
      },
      zh: {
        title: '编辑个人资料',
        subtitle: '编辑个人信息',
        save: '保存更改',
        saving: '保存中...',
        cancel: '取消',
        profile_updated: '个人资料已更新',
        error: '错误',
        profile_not_found: '找不到个人资料信息。',
        update_failed: '更新个人资料失败。'
      }
    };
    return texts[language]?.[key] || texts['ko'][key] || key;
  };
  const { data: existingProfile, updateProfile, createCompanion } = useUserProfile();
  
  const [selectedAccessibility, setSelectedAccessibility] = useState<string[]>(
    existingProfile?.accessibility || []
  );

  const form = useForm<ModifyData>({
    resolver: zodResolver(modifySchema),
    defaultValues: {
      name: existingProfile?.name || "",
      age: existingProfile?.age || 0,
      gender: existingProfile?.gender || "",
      address: existingProfile?.address || "",
      language: language,
      accessibility: existingProfile?.accessibility || [],
      mobility: existingProfile?.mobility || "independent",
      partner: {
        name: "",
        phone: "",
        relationship: "",
      },
    },
  });

  const onSubmit = async (data: ModifyData) => {
    if (!existingProfile) {
      toast({
        title: getText('error'),
        description: getText('profile_not_found'),
        variant: "destructive",
      });
      return;
    }

    try {
      const profileData = {
        name: data.name,
        age: data.age,
        gender: data.gender,
        address: data.address,
        language: language,
        mobility: data.mobility,
        accessibility: selectedAccessibility,
      };

      // 프로필 업데이트
      await updateProfile.mutateAsync({
        id: existingProfile.id,
        ...profileData,
      });

      // 동행 파트너 정보가 있으면 추가/업데이트
      if (data.partner?.name && data.partner?.phone) {
        await createCompanion.mutateAsync({
          userId: existingProfile.id,
          name: data.partner.name,
          phone: data.partner.phone,
          relationship: data.partner.relationship || "지인",
        });
      }

      toast({
        title: "프로필 수정 완료",
        description: "프로필이 성공적으로 수정되었습니다.",
      });

      // 대시보드로 이동
      setLocation("/");
    } catch (error) {
      console.error("Profile update failed:", error);
      toast({
        title: "수정 실패",
        description: "프로필 수정 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleAccessibilityChange = (value: string) => {
    setSelectedAccessibility(prev => 
      prev.includes(value)
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  };

  if (!existingProfile) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="emergency-card">
          <CardContent className="text-center py-8">
            <i className="fas fa-exclamation-triangle text-4xl text-warning mb-4" aria-hidden="true"></i>
            <h2 className="text-2xl font-bold mb-4">프로필을 찾을 수 없습니다</h2>
            <p className="text-gray-600 mb-6">
              먼저 개인정보를 등록해주세요.
            </p>
            <Button 
              className="bg-emergency hover:bg-emergency-dark"
              onClick={() => setLocation('/registration')}
            >
              <i className="fas fa-user-plus mr-2" aria-hidden="true"></i>
              정보 등록하기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-full shadow-xl">
            <div className="absolute inset-1 bg-gradient-to-br from-red-400 to-red-600 rounded-full">
              <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center">
                <i className="fas fa-user-edit text-red-600 text-3xl" aria-hidden="true"></i>
              </div>
            </div>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-emergency">
          {t('registration.edit_title')}
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          {t('registration.subtitle')}
        </p>
      </div>

      {/* Main Form Card */}
      <Card className="bg-white rounded-2xl shadow-xl border-2 border-gray-100">
        <CardContent className="p-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* 기본 정보 섹션 */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                <div className="w-10 h-10 bg-emergency/10 rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-emergency text-lg" aria-hidden="true"></i>
                </div>
                <h3 className="text-xl font-bold text-emergency">
                  {t('registration.basic_info')}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                    {t('registration.name')}
                  </Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    className="h-12 text-base border-2 border-gray-200 focus:border-emergency"
                    placeholder={t('registration.name')}
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age" className="text-sm font-semibold text-gray-700">
                    {t('registration.age')}
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    {...form.register("age", { valueAsNumber: true })}
                    className="h-12 text-base border-2 border-gray-200 focus:border-emergency"
                    placeholder={t('registration.age')}
                  />
                  {form.formState.errors.age && (
                    <p className="text-red-500 text-sm">{form.formState.errors.age.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-semibold text-gray-700">
                    {t('registration.gender')}
                  </Label>
                  <Select onValueChange={(value) => form.setValue("gender", value)} defaultValue={form.getValues("gender") || undefined}>
                    <SelectTrigger className="h-12 text-base border-2 border-gray-200 focus:border-emergency">
                      <SelectValue placeholder={t('registration.gender')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t('registration.gender_male')}</SelectItem>
                      <SelectItem value="female">{t('registration.gender_female')}</SelectItem>
                      <SelectItem value="other">{t('registration.gender_other')}</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.gender && (
                    <p className="text-red-500 text-sm">{form.formState.errors.gender.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-semibold text-gray-700">
                    {t('registration.address')}
                  </Label>
                  <Input
                    id="address"
                    {...form.register("address")}
                    className="h-12 text-base border-2 border-gray-200 focus:border-emergency"
                    placeholder={t('registration.address')}
                  />
                  {form.formState.errors.address && (
                    <p className="text-red-500 text-sm">{form.formState.errors.address.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 접근성 및 자력대피 능력 섹션 */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                <div className="w-10 h-10 bg-safety/10 rounded-full flex items-center justify-center">
                  <i className="fas fa-universal-access text-safety text-lg" aria-hidden="true"></i>
                </div>
                <h3 className="text-xl font-bold text-emergency">
                  {t('registration.accessibility_support')}
                </h3>
              </div>
              
              {/* 접근성 지원 선택 */}
              <div className="space-y-4">
                <Label className="text-base font-semibold text-gray-700">
                  {t('registration.accessibility')}
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Button
                    type="button"
                    variant={selectedAccessibility.length === 0 ? "default" : "outline"}
                    className={`p-6 h-auto flex-col space-y-3 border-2 transition-all duration-200 ${
                      selectedAccessibility.length === 0 
                        ? 'bg-gray-100 border-gray-300 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedAccessibility([])}
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <i className="fas fa-user-check text-2xl text-gray-600" aria-hidden="true"></i>
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-semibold ${selectedAccessibility.length === 0 ? 'text-gray-800' : 'text-gray-700'}`}>
                        {t('registration.accessibility_normal')}
                      </p>
                      <p className="text-xs text-gray-600">{t('registration.accessibility_normal_desc')}</p>
                    </div>
                  </Button>
                  
                  <Button
                    type="button"
                    variant={selectedAccessibility.includes('visual') ? "default" : "outline"}
                    className={`p-6 h-auto flex-col space-y-3 border-2 transition-all duration-200 ${
                      selectedAccessibility.includes('visual') 
                        ? 'bg-blue-50 border-blue-300 shadow-md' 
                        : 'border-gray-200 hover:border-blue-200'
                    }`}
                    onClick={() => handleAccessibilityChange('visual')}
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <i className="fas fa-low-vision text-2xl text-blue-600" aria-hidden="true"></i>
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-semibold ${selectedAccessibility.includes('visual') ? 'text-blue-800' : 'text-gray-700'}`}>
                        {t('registration.accessibility_visual')}
                      </p>
                      <p className="text-xs text-gray-600">{t('registration.accessibility_visual_desc')}</p>
                    </div>
                  </Button>
                  
                  <Button
                    type="button"
                    variant={selectedAccessibility.includes('hearing') ? "default" : "outline"}
                    className={`p-6 h-auto flex-col space-y-3 border-2 transition-all duration-200 ${
                      selectedAccessibility.includes('hearing') 
                        ? 'bg-yellow-50 border-yellow-300 shadow-md' 
                        : 'border-gray-200 hover:border-yellow-200'
                    }`}
                    onClick={() => handleAccessibilityChange('hearing')}
                  >
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <i className="fas fa-assistive-listening-systems text-2xl text-yellow-600" aria-hidden="true"></i>
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-semibold ${selectedAccessibility.includes('hearing') ? 'text-yellow-800' : 'text-gray-700'}`}>
                        {t('registration.accessibility_hearing')}
                      </p>
                      <p className="text-xs text-gray-600">{t('registration.accessibility_hearing_desc')}</p>
                    </div>
                  </Button>
                </div>
              </div>

              {/* 자력대피 능력 선택 */}
              <div className="space-y-4">
                <Label className="text-base font-semibold text-gray-700">
                  {t('registration.mobility')}
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant={form.watch("mobility") === "independent" ? "default" : "outline"}
                    className={`p-6 h-auto flex-col space-y-3 border-2 transition-all duration-200 ${
                      form.watch("mobility") === "independent"
                        ? 'bg-green-50 border-green-300 shadow-md'
                        : 'border-gray-200 hover:border-green-200'
                    }`}
                    onClick={() => form.setValue("mobility", "independent")}
                  >
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <i className="fas fa-running text-2xl text-green-600" aria-hidden="true"></i>
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-semibold ${form.watch("mobility") === "independent" ? 'text-green-800' : 'text-gray-700'}`}>
                        {t('registration.mobility_independent')}
                      </p>
                      <p className="text-xs text-gray-600">{t('registration.mobility_independent_desc')}</p>
                    </div>
                  </Button>
                  
                  <Button
                    type="button"
                    variant={form.watch("mobility") === "unable" ? "default" : "outline"}
                    className={`p-6 h-auto flex-col space-y-3 border-2 transition-all duration-200 ${
                      form.watch("mobility") === "unable"
                        ? 'bg-red-50 border-red-300 shadow-md'
                        : 'border-gray-200 hover:border-red-200'
                    }`}
                    onClick={() => form.setValue("mobility", "unable")}
                  >
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <i className="fas fa-wheelchair text-2xl text-red-600" aria-hidden="true"></i>
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-semibold ${form.watch("mobility") === "unable" ? 'text-red-800' : 'text-gray-700'}`}>
                        {t('registration.mobility_assisted')}
                      </p>
                      <p className="text-xs text-gray-600">{t('registration.mobility_assisted_desc')}</p>
                    </div>
                  </Button>
                </div>
              </div>
            </div>

            {/* 동행 파트너 섹션 */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
                  <i className="fas fa-user-friends text-warning text-lg" aria-hidden="true"></i>
                </div>
                <h3 className="text-xl font-bold text-emergency">
                  {t('registration.companion')}
                </h3>
              </div>
              
              <p className="text-gray-600 bg-gray-50 p-4 rounded-lg border-l-4 border-warning">
                <i className="fas fa-info-circle text-warning mr-2" aria-hidden="true"></i>
                {t('registration.companion_subtitle')}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="partner-name" className="text-sm font-semibold text-gray-700">
                    {t('registration.companion_name')}
                  </Label>
                  <Input
                    id="partner-name"
                    {...form.register("partner.name")}
                    className="h-12 text-base border-2 border-gray-200 focus:border-emergency"
                    placeholder={t('registration.companion_name_placeholder')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partner-phone" className="text-sm font-semibold text-gray-700">
                    {t('registration.companion_phone')}
                  </Label>
                  <Input
                    id="partner-phone"
                    {...form.register("partner.phone")}
                    className="h-12 text-base border-2 border-gray-200 focus:border-emergency"
                    placeholder="010-1234-5678"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partner-relationship" className="text-sm font-semibold text-gray-700">
                    관계
                  </Label>
                  <Input
                    id="partner-relationship"
                    {...form.register("partner.relationship")}
                    className="h-12 text-base border-2 border-gray-200 focus:border-emergency"
                    placeholder="가족, 친구, 동료 등"
                  />
                </div>
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className="pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="flex-1 h-14 text-base border-2"
                  onClick={() => setLocation("/")}
                >
                  <i className="fas fa-arrow-left mr-3" aria-hidden="true"></i>
                  취소
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="flex-1 h-14 text-base bg-emergency hover:bg-emergency-dark shadow-lg"
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? (
                    <>
                      <div className="w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      수정 중...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-3" aria-hidden="true"></i>
                      {t('registration.save')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
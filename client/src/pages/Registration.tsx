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
  const { language, t } = useLanguage();
  const { data: existingProfile, createProfile, updateProfile, createCompanion } = useUserProfile();
  const [selectedAccessibility, setSelectedAccessibility] = useState<string[]>(
    existingProfile?.accessibility || []
  );

  const form = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: existingProfile?.name || "",
      age: existingProfile?.age || 0,
      gender: existingProfile?.gender || "",
      address: existingProfile?.address || "",
      language: existingProfile?.language || language,
      accessibility: existingProfile?.accessibility || [],
      mobility: existingProfile?.mobility || "independent",
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

      if (existingProfile) {
        await updateProfile.mutateAsync({
          id: existingProfile.id,
          ...profileData,
        });
        toast({
          title: "정보가 수정되었습니다",
          description: "사용자 정보가 성공적으로 업데이트되었습니다.",
        });
      } else {
        const newUser = await createProfile.mutateAsync(profileData);
        userId = newUser.id;
        toast({
          title: "등록이 완료되었습니다",
          description: "맞춤형 안전 가이드를 이용하실 수 있습니다.",
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

      setLocation("/");
    } catch (error) {
      toast({
        title: "오류가 발생했습니다",
        description: "정보 저장 중 문제가 발생했습니다. 다시 시도해주세요.",
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
          {existingProfile ? t('registration.edit_title') : t('registration.title')}
        </h2>
        <p className="text-center text-gray-600 mt-2">
          {t('registration.subtitle')}
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card className="emergency-card">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <i className="fas fa-user text-emergency mr-2" aria-hidden="true"></i>
              {t('registration.basic_info')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">{t('registration.name')} <span className="text-emergency">*</span></Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder={t('registration.name_placeholder')}
                  required
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="age">{t('registration.age')} <span className="text-emergency">*</span></Label>
                <Input
                  id="age"
                  type="number"
                  {...form.register("age", { valueAsNumber: true })}
                  placeholder={t('registration.age_placeholder')}
                  min="1"
                  max="120"
                  required
                />
                {form.formState.errors.age && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.age.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="gender">{t('registration.gender')}</Label>
                <Select onValueChange={(value) => form.setValue("gender", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('registration.gender_placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t('registration.gender_male')}</SelectItem>
                    <SelectItem value="female">{t('registration.gender_female')}</SelectItem>
                    <SelectItem value="other">{t('registration.gender_other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="address">{t('registration.address')} <span className="text-emergency">*</span></Label>
                <Input
                  id="address"
                  {...form.register("address")}
                  placeholder={t('registration.address_placeholder')}
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
        <Card className="emergency-card">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <i className="fas fa-universal-access text-safety mr-2" aria-hidden="true"></i>
              {t('registration.accessibility_support')}
            </h3>
            
            {/* Accessibility Support Section */}
            <div className="mb-8">
              <Label className="text-base font-medium mb-4 block">{t('registration.accessibility')}</Label>
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
                  aria-label="일반 사용자 - 특별한 접근성 지원이 필요하지 않습니다"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-user-check text-2xl text-gray-600" aria-hidden="true"></i>
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-semibold ${selectedAccessibility.length === 0 ? 'text-gray-800' : 'text-gray-700'}`}>{t('registration.accessibility_normal')}</p>
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
                  onClick={() => toggleAccessibility('visual')}
                  aria-label="시각 지원 필요 - 음성 안내와 큰 글씨를 제공합니다"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-low-vision text-2xl text-blue-600" aria-hidden="true"></i>
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-semibold ${selectedAccessibility.includes('visual') ? 'text-blue-800' : 'text-gray-700'}`}>시각 지원</p>
                    <p className="text-xs text-gray-600">음성 안내, 큰 글씨</p>
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
                  onClick={() => toggleAccessibility('hearing')}
                  aria-label="청각 지원 필요 - 진동 알림과 시각적 신호를 제공합니다"
                >
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-assistive-listening-systems text-2xl text-yellow-600" aria-hidden="true"></i>
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-semibold ${selectedAccessibility.includes('hearing') ? 'text-yellow-800' : 'text-gray-700'}`}>청각 지원</p>
                    <p className="text-xs text-gray-600">진동, 시각적 신호</p>
                  </div>
                </Button>
              </div>
            </div>

            {/* Self-Evacuation Capability Section */}
            <div>
              <Label className="text-base font-medium mb-4 block">자력대피 가능 여부</Label>
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
                  aria-label="자력대피 가능 - 혼자서도 안전한 장소로 신속히 이동할 수 있습니다"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-running text-2xl text-green-600" aria-hidden="true"></i>
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-semibold ${form.watch("mobility") === "independent" ? 'text-green-800' : 'text-gray-700'}`}>자력대피 가능</p>
                    <p className="text-xs text-gray-600">혼자서도 신속히 이동</p>
                  </div>
                </Button>
                
                <Button
                  type="button"
                  variant={form.watch("mobility") === "assisted" ? "default" : "outline"}
                  className={`p-6 h-auto flex-col space-y-3 border-2 transition-all duration-200 ${
                    form.watch("mobility") === "assisted"
                      ? 'bg-orange-50 border-orange-300 shadow-md'
                      : 'border-gray-200 hover:border-orange-200'
                  }`}
                  onClick={() => form.setValue("mobility", "assisted")}
                  aria-label="도움 필요 - 다른 사람의 도움이 있어야 안전하게 대피할 수 있습니다"
                >
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-hands-helping text-2xl text-orange-500" aria-hidden="true"></i>
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-semibold ${form.watch("mobility") === "assisted" ? 'text-orange-800' : 'text-gray-700'}`}>도움 필요</p>
                    <p className="text-xs text-gray-600">타인의 도움 필요</p>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Companion */}
        <Card className="emergency-card">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <i className="fas fa-user-friends text-emergency mr-2" aria-hidden="true"></i>
              동행 파트너 (선택사항)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              응급상황 시 연락받을 동행 파트너의 정보를 입력해주세요. 
              이 정보는 SOS 신호 시 자동으로 전송됩니다.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="partnerName">동행 파트너 이름</Label>
                <Input
                  id="partnerName"
                  {...form.register("partner.name")}
                  placeholder="김철수"
                  aria-describedby="partnerName-desc"
                />
                <p id="partnerName-desc" className="text-xs text-gray-500 mt-1">
                  응급상황 시 연락받을 사람의 이름
                </p>
              </div>
              
              <div>
                <Label htmlFor="partnerPhone">연락처</Label>
                <Input
                  id="partnerPhone"
                  type="tel"
                  {...form.register("partner.phone")}
                  placeholder="010-1234-5678"
                  aria-describedby="partnerPhone-desc"
                />
                <p id="partnerPhone-desc" className="text-xs text-gray-500 mt-1">
                  SMS와 전화로 응급상황을 알릴 번호
                </p>
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="partnerRelationship">관계</Label>
                <Select onValueChange={(value) => form.setValue("partner.relationship", value)}>
                  <SelectTrigger aria-describedby="relationship-desc">
                    <SelectValue placeholder="동행 파트너와의 관계를 선택해주세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="family">가족 (배우자, 부모, 자녀)</SelectItem>
                    <SelectItem value="friend">친구</SelectItem>
                    <SelectItem value="neighbor">이웃</SelectItem>
                    <SelectItem value="colleague">직장 동료</SelectItem>
                    <SelectItem value="caregiver">돌봄 제공자</SelectItem>
                  </SelectContent>
                </Select>
                <p id="relationship-desc" className="text-xs text-gray-500 mt-1">
                  응급상황 시 연락받을 사람과의 관계
                </p>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <i className="fas fa-info-circle text-blue-600 mt-0.5" aria-hidden="true"></i>
                <div className="text-sm">
                  <p className="font-medium text-blue-800 mb-1">동행 파트너 역할</p>
                  <ul className="text-blue-700 space-y-1 text-xs">
                    <li>• 응급상황 발생 시 SMS로 위치와 상황 정보 자동 전송</li>
                    <li>• 대피가 어려운 경우 구조 지원 요청</li>
                    <li>• 의료진에게 개인 정보 제공 (필요시)</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Language Selection */}
        <Card className="emergency-card">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <i className="fas fa-globe text-emergency mr-2" aria-hidden="true"></i>
              {t('registration.language')}
            </h3>
            <Select onValueChange={(value) => form.setValue("language", value)} defaultValue={form.watch("language")}>
              <SelectTrigger>
                <SelectValue placeholder={t('registration.language_placeholder')} />
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
            className="w-full bg-emergency hover:bg-emergency-dark py-3 text-lg"
            disabled={form.formState.isSubmitting}
          >
            <i className="fas fa-save mr-2" aria-hidden="true"></i>
            {form.formState.isSubmitting ? t('common.loading') + "..." : t('registration.save')}
          </Button>
        </div>
      </form>
    </div>
  );
}

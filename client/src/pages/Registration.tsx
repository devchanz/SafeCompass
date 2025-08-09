import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  
  const isEditMode = localStorage.getItem('hasRegistered') === 'true' && existingProfile;
  console.log('Registration page - isEditMode:', isEditMode, 'existingProfile:', existingProfile);
  
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
      language: language,
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
        language: language,
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
          title: t('registration.success'),
          description: "프로필이 성공적으로 업데이트되었습니다.",
        });
      } else {
        const newUser = await createProfile.mutateAsync(profileData);
        userId = newUser.id;
        toast({
          title: t('registration.success'),
          description: "등록이 완료되었습니다!",
        });
      }

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
        }
      }

      localStorage.setItem('hasRegistered', 'true');
      localStorage.setItem('selectedLanguage', language);
      
      setLocation('/dashboard');
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: t('registration.error'),
        description: "등록 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const accessibilityOptions = [
    { id: 'visual', label: t('registration.visual_impairment') },
    { id: 'hearing', label: t('registration.hearing_impairment') },
    { id: 'mobility', label: t('registration.mobility_impairment') },
    { id: 'cognitive', label: t('registration.cognitive_impairment') },
    { id: 'none', label: t('registration.none') }
  ];

  const handleAccessibilityChange = (optionId: string, checked: boolean) => {
    setSelectedAccessibility(prev => {
      if (optionId === 'none') {
        return checked ? ['none'] : [];
      } else {
        const filtered = prev.filter(id => id !== 'none');
        return checked 
          ? [...filtered, optionId]
          : filtered.filter(id => id !== optionId);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {isEditMode ? t('registration.update') : t('registration.title')}
              </h1>
              <p className="text-gray-600">
                {isEditMode ? t('registration.edit_subtitle') : t('registration.subtitle')}
              </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* 이름 */}
              <div className="space-y-2">
                <Label htmlFor="name">{t('registration.name')}</Label>
                <Input
                  id="name"
                  placeholder={t('registration.name_placeholder')}
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                )}
              </div>

              {/* 나이 */}
              <div className="space-y-2">
                <Label htmlFor="age">{t('registration.age')}</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder={t('registration.age_placeholder')}
                  {...form.register("age", { valueAsNumber: true })}
                />
                {form.formState.errors.age && (
                  <p className="text-sm text-red-600">{form.formState.errors.age.message}</p>
                )}
              </div>

              {/* 성별 */}
              <div className="space-y-2">
                <Label>{t('registration.gender')}</Label>
                <Select onValueChange={(value) => form.setValue("gender", value)} defaultValue={form.getValues("gender")}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('registration.gender_placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t('registration.male')}</SelectItem>
                    <SelectItem value="female">{t('registration.female')}</SelectItem>
                    <SelectItem value="other">{t('registration.other')}</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.gender && (
                  <p className="text-sm text-red-600">{form.formState.errors.gender.message}</p>
                )}
              </div>

              {/* 주소 */}
              <div className="space-y-2">
                <Label htmlFor="address">{t('registration.address')}</Label>
                <Input
                  id="address"
                  placeholder={t('registration.address_placeholder')}
                  {...form.register("address")}
                />
                {form.formState.errors.address && (
                  <p className="text-sm text-red-600">{form.formState.errors.address.message}</p>
                )}
              </div>

              {/* 언어 */}
              <div className="space-y-2">
                <Label>{t('registration.language')}</Label>
                <Select onValueChange={(value) => form.setValue("language", value)} defaultValue={language}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('registration.language_placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ko">한국어</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="vi">Tiếng Việt</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 접근성 지원 */}
              <div className="space-y-3">
                <Label>{t('registration.accessibility')}</Label>
                <p className="text-sm text-gray-600">{t('registration.accessibility_help')}</p>
                <div className="grid grid-cols-2 gap-3">
                  {accessibilityOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.id}
                        checked={selectedAccessibility.includes(option.id)}
                        onCheckedChange={(checked) => handleAccessibilityChange(option.id, checked as boolean)}
                      />
                      <Label htmlFor={option.id} className="text-sm font-normal">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* 이동 능력 */}
              <div className="space-y-3">
                <Label>{t('registration.mobility')}</Label>
                <p className="text-sm text-gray-600">{t('registration.mobility_help')}</p>
                <RadioGroup
                  defaultValue={form.getValues("mobility")}
                  onValueChange={(value) => form.setValue("mobility", value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="independent" id="independent" />
                    <Label htmlFor="independent">{t('registration.independent')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="assistance" id="assistance" />
                    <Label htmlFor="assistance">{t('registration.assistance')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="wheelchair" id="wheelchair" />
                    <Label htmlFor="wheelchair">{t('registration.wheelchair')}</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* 동행 파트너 (선택사항) */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-800">{t('registration.companion')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="partner-name">{t('registration.companion_name')}</Label>
                    <Input
                      id="partner-name"
                      placeholder={t('registration.companion_name')}
                      {...form.register("partner.name")}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="partner-phone">{t('registration.companion_phone')}</Label>
                    <Input
                      id="partner-phone"
                      placeholder={t('registration.companion_phone')}
                      {...form.register("partner.phone")}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="partner-relationship">{t('registration.companion_relationship')}</Label>
                  <Input
                    id="partner-relationship"
                    placeholder={t('registration.companion_relationship')}
                    {...form.register("partner.relationship")}
                  />
                </div>
              </div>

              {/* 제출 버튼 */}
              <div className="flex justify-center pt-6">
                <Button 
                  type="submit" 
                  className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting 
                    ? t('common.loading')
                    : isEditMode 
                      ? t('registration.update') 
                      : t('registration.submit')
                  }
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
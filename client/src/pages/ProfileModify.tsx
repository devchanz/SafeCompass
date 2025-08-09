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
  const { language, t } = useLanguage();
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
        title: "오류",
        description: "프로필 정보를 찾을 수 없습니다.",
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-emergency flex items-center justify-center">
          <i className="fas fa-user-edit mr-3" aria-hidden="true"></i>
          프로필 수정
        </h1>
        <p className="text-gray-600 mt-2">개인정보를 수정하여 맞춤형 가이드를 업데이트하세요</p>
      </div>

      <Card className="emergency-card">
        <CardContent className="pt-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* 기본 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-emergency flex items-center">
                <i className="fas fa-user mr-2" aria-hidden="true"></i>
                기본 정보
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    className="mt-1"
                    placeholder="이름을 입력하세요"
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="age">나이</Label>
                  <Input
                    id="age"
                    type="number"
                    {...form.register("age", { valueAsNumber: true })}
                    className="mt-1"
                    placeholder="나이를 입력하세요"
                  />
                  {form.formState.errors.age && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.age.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gender">성별</Label>
                  <Select onValueChange={(value) => form.setValue("gender", value)} defaultValue={form.getValues("gender")}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="성별을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">남성</SelectItem>
                      <SelectItem value="female">여성</SelectItem>
                      <SelectItem value="other">기타</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.gender && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.gender.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="address">주소</Label>
                  <Input
                    id="address"
                    {...form.register("address")}
                    className="mt-1"
                    placeholder="주소를 입력하세요"
                  />
                  {form.formState.errors.address && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.address.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 접근성 및 자력대피 능력 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-emergency flex items-center">
                <i className="fas fa-wheelchair mr-2" aria-hidden="true"></i>
                접근성 지원 및 자력대피 능력
              </h3>
              
              <div>
                <Label>자력대피 능력</Label>
                <RadioGroup 
                  defaultValue={form.getValues("mobility")}
                  onValueChange={(value) => form.setValue("mobility", value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="independent" id="independent" />
                    <Label htmlFor="independent">자력대피 가능</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="assisted" id="assisted" />
                    <Label htmlFor="assisted">부분 도움 필요</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="unable" id="unable" />
                    <Label htmlFor="unable">자력대피 불가능</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>접근성 지원 (다중 선택 가능)</Label>
                <div className="mt-2 space-y-2">
                  {["visual", "hearing", "basic"].map((accessType) => (
                    <label key={accessType} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAccessibility.includes(accessType)}
                        onChange={() => handleAccessibilityChange(accessType)}
                        className="rounded"
                      />
                      <span>
                        {accessType === "visual" && "시각적 지원 (큰 글씨, 음성 안내)"}
                        {accessType === "hearing" && "청각적 지원 (진동 알림, 시각 신호)"}
                        {accessType === "basic" && "기본적 지원"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* 동행 파트너 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-emergency flex items-center">
                <i className="fas fa-user-friends mr-2" aria-hidden="true"></i>
                동행 파트너 (선택사항)
              </h3>
              <p className="text-sm text-gray-600">
                긴급 상황 시 연락할 동행 파트너 정보를 입력하세요.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="partner-name">이름</Label>
                  <Input
                    id="partner-name"
                    {...form.register("partner.name")}
                    className="mt-1"
                    placeholder="파트너 이름"
                  />
                </div>

                <div>
                  <Label htmlFor="partner-phone">전화번호</Label>
                  <Input
                    id="partner-phone"
                    {...form.register("partner.phone")}
                    className="mt-1"
                    placeholder="010-1234-5678"
                  />
                </div>

                <div>
                  <Label htmlFor="partner-relationship">관계</Label>
                  <Input
                    id="partner-relationship"
                    {...form.register("partner.relationship")}
                    className="mt-1"
                    placeholder="가족, 친구, 동료 등"
                    defaultValue=""
                  />
                </div>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setLocation("/")}
              >
                <i className="fas fa-arrow-left mr-2" aria-hidden="true"></i>
                취소
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-emergency hover:bg-emergency-dark"
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i>
                    수정 중...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2" aria-hidden="true"></i>
                    프로필 수정
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
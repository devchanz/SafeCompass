import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEmergency } from "@/hooks/useEmergency";

export default function EmergencyAlert() {
  const [, setLocation] = useLocation();
  const [locationContext, setLocationContext] = useState<string>("");
  const [canMove, setCanMove] = useState<boolean>(true);
  const { generateGuide } = useEmergency();

  const handleGenerateGuide = async () => {
    if (!locationContext) {
      alert("현재 위치를 선택해주세요");
      return;
    }

    try {
      await generateGuide.mutateAsync({
        locationContext,
        canMove,
      });
      setLocation("/guide");
    } catch (error) {
      console.error("Guide generation failed:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Emergency Alert Header */}
      <Card className="emergency-card bg-emergency text-white mb-6 emergency-pulse">
        <CardContent className="pt-6 text-center">
          <i className="fas fa-exclamation-triangle text-6xl mb-4" aria-hidden="true"></i>
          <h1 className="text-3xl font-bold mb-2">지진 경보</h1>
          <p className="text-lg">규모 5.2 지진이 감지되었습니다</p>
          <p className="text-sm mt-2">
            발생시간: <span>2024년 1월 15일 14:30</span>
          </p>
        </CardContent>
      </Card>

      {/* Current Status Input */}
      <Card className="emergency-card mb-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <i className="fas fa-location-dot text-emergency mr-2" aria-hidden="true"></i>
            현재 상황을 알려주세요
          </h2>
          
          <div className="space-y-4">
            {/* Location Status */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">현재 위치:</p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={locationContext === "indoor" ? "default" : "outline"}
                  className="p-4 h-auto flex-col space-y-2"
                  onClick={() => setLocationContext("indoor")}
                >
                  <i className="fas fa-home text-2xl" aria-hidden="true"></i>
                  <p className="text-sm font-medium">실내</p>
                </Button>
                <Button
                  variant={locationContext === "outdoor" ? "default" : "outline"}
                  className="p-4 h-auto flex-col space-y-2"
                  onClick={() => setLocationContext("outdoor")}
                >
                  <i className="fas fa-tree text-2xl" aria-hidden="true"></i>
                  <p className="text-sm font-medium">실외</p>
                </Button>
              </div>
            </div>
            
            {/* Movement Ability */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">이동 가능 여부:</p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={canMove ? "default" : "outline"}
                  className="p-4 h-auto flex-col space-y-2"
                  onClick={() => setCanMove(true)}
                >
                  <i className="fas fa-walking text-2xl" aria-hidden="true"></i>
                  <p className="text-sm font-medium">이동 가능</p>
                </Button>
                <Button
                  variant={!canMove ? "default" : "outline"}
                  className="p-4 h-auto flex-col space-y-2"
                  onClick={() => setCanMove(false)}
                >
                  <i className="fas fa-wheelchair text-2xl" aria-hidden="true"></i>
                  <p className="text-sm font-medium">이동 어려움</p>
                </Button>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleGenerateGuide}
            disabled={!locationContext || generateGuide.isPending}
            className="w-full mt-6 bg-emergency hover:bg-emergency-dark py-3 text-lg"
          >
            <i className="fas fa-magic mr-2" aria-hidden="true"></i>
            {generateGuide.isPending ? "생성 중..." : "맞춤 안전 가이드 생성"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

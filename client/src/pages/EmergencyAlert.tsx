import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEmergency } from "@/hooks/useEmergency";
import { useEmergencyNotification } from "@/hooks/useEmergencyNotification";
import { useLanguage } from "@/contexts/LanguageContext";

export default function EmergencyAlert() {
  const [, setLocation] = useLocation();
  const [locationContext, setLocationContext] = useState<string>("");
  const [canMove, setCanMove] = useState<boolean>(true);
  const { generateGuide } = useEmergency();
  const { currentAlert, markAlertAsRead } = useEmergencyNotification();
  const { t } = useLanguage();

  useEffect(() => {
    // Mark alert as read when user enters the emergency page
    markAlertAsRead();
  }, [markAlertAsRead]);

  const handleGenerateGuide = async () => {
    if (!locationContext) {
      alert(t('emergency.location_question'));
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
          <h1 className="text-3xl font-bold mb-2">{t('emergency.earthquake_detected')}</h1>
          {currentAlert && (
            <>
              <p className="text-lg">
                {currentAlert.type === 'earthquake' ? 
                  `${currentAlert.magnitude ? `규모 ${currentAlert.magnitude}` : ''} 지진` : 
                  currentAlert.type} - {currentAlert.location}
              </p>
              <p className="text-sm mt-2">
                발생시간: <span>{new Date(currentAlert.timestamp).toLocaleString()}</span>
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Current Status Input */}
      <Card className="emergency-card mb-6">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-emergency">
            {t('emergency.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-lg font-semibold mb-3 block">
              {t('emergency.location_question')}
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={locationContext === "집 안 (거실/침실)" ? "default" : "outline"}
                className="h-16 flex flex-col items-center justify-center text-sm"
                onClick={() => setLocationContext("집 안 (거실/침실)")}
              >
                <i className="fas fa-home text-xl mb-1" aria-hidden="true"></i>
                {t('emergency.location.home')}
              </Button>
              <Button
                variant={locationContext === "사무실/학교" ? "default" : "outline"}
                className="h-16 flex flex-col items-center justify-center text-sm"
                onClick={() => setLocationContext("사무실/학교")}
              >
                <i className="fas fa-building text-xl mb-1" aria-hidden="true"></i>
                {t('emergency.location.office')}
              </Button>
              <Button
                variant={locationContext === "길거리/야외" ? "default" : "outline"}
                className="h-16 flex flex-col items-center justify-center text-sm"
                onClick={() => setLocationContext("길거리/야외")}
              >
                <i className="fas fa-road text-xl mb-1" aria-hidden="true"></i>
                {t('emergency.location.outdoor')}
              </Button>
              <Button
                variant={locationContext === "지하철/버스" ? "default" : "outline"}
                className="h-16 flex flex-col items-center justify-center text-sm"
                onClick={() => setLocationContext("지하철/버스")}
              >
                <i className="fas fa-subway text-xl mb-1" aria-hidden="true"></i>
                {t('emergency.location.transport')}
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-lg font-semibold mb-3 block">
              {t('emergency.mobility_question')}
            </Label>
            <div className="grid grid-cols-1 gap-3">
              <Button
                variant={canMove ? "default" : "outline"}
                className="h-16 flex items-center justify-center text-base"
                onClick={() => setCanMove(true)}
              >
                <i className="fas fa-walking text-xl mr-3 text-green-600" aria-hidden="true"></i>
                {t('emergency.mobility.yes')}
              </Button>
              <Button
                variant={!canMove ? "default" : "outline"}
                className="h-16 flex items-center justify-center text-base"
                onClick={() => setCanMove(false)}
              >
                <i className="fas fa-wheelchair text-xl mr-3 text-red-600" aria-hidden="true"></i>
                {t('emergency.mobility.no')}
              </Button>
            </div>
          </div>

          <Button 
            onClick={handleGenerateGuide}
            className="w-full bg-emergency hover:bg-emergency/90 text-white text-lg py-3"
            disabled={generateGuide.isPending}
          >
            {generateGuide.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i>
                {t('common.loading')}
              </>
            ) : (
              <>
                <i className="fas fa-compass mr-2" aria-hidden="true"></i>
                {t('emergency.generate_guide')}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
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
            <RadioGroup value={locationContext} onValueChange={setLocationContext}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="집 안 (거실/침실)" id="home-indoor" />
                <Label htmlFor="home-indoor">집 안 (거실/침실)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="사무실/학교" id="office" />
                <Label htmlFor="office">사무실/학교</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="길거리/야외" id="outdoor" />
                <Label htmlFor="outdoor">길거리/야외</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="지하철/버스" id="transport" />
                <Label htmlFor="transport">지하철/버스</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-lg font-semibold mb-3 block">
              {t('emergency.mobility_question')}
            </Label>
            <RadioGroup value={canMove.toString()} onValueChange={(value) => setCanMove(value === 'true')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="can-move" />
                <Label htmlFor="can-move">네, 움직일 수 있습니다</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="cannot-move" />
                <Label htmlFor="cannot-move">아니요, 움직이기 어렵습니다</Label>
              </div>
            </RadioGroup>
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
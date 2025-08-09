import { useAccessibility } from "@/components/AccessibilityProvider";

export function useHapticService() {
  const { hasHearingSupport } = useAccessibility();

  const vibrate = (pattern: number | number[]) => {
    if (!hasHearingSupport || !navigator.vibrate) {
      return;
    }

    navigator.vibrate(pattern);
  };

  const vibrateEmergency = () => {
    vibrate([500, 200, 500, 200, 500]);
  };

  const vibrateNotification = () => {
    vibrate([100, 50, 100]);
  };

  const vibrateSuccess = () => {
    vibrate([200]);
  };

  return {
    vibrate,
    vibrateEmergency,
    vibrateNotification,
    vibrateSuccess,
  };
}

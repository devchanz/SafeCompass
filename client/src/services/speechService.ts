import { useAccessibility } from "@/components/AccessibilityProvider";

export function useSpeechService() {
  const { hasVisualSupport } = useAccessibility();

  const speak = (text: string, lang: string = 'ko-KR') => {
    if (!hasVisualSupport || !('speechSynthesis' in window)) {
      return;
    }

    // Stop any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.8; // Slightly slower for better comprehension
    utterance.volume = 1.0;

    speechSynthesis.speak(utterance);
  };

  const stop = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  };

  return {
    speak,
    stop,
  };
}

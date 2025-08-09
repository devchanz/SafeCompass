import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage, Language } from "@/contexts/LanguageContext";

const languages = [
  { code: 'ko' as Language, name: '한국어', flag: '🇰🇷' },
  { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
  { code: 'vi' as Language, name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'zh' as Language, name: '中文', flag: '🇨🇳' },
];

export default function LanguageSelection() {
  const [, setLocation] = useLocation();
  const { setLanguage, t } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);

  const handleLanguageSelect = (langCode: Language) => {
    setSelectedLanguage(langCode);
    setLanguage(langCode);
    
    // Store in localStorage to remember user's choice
    localStorage.setItem('selectedLanguage', langCode);
    
    // Navigate to registration after language selection
    setTimeout(() => {
      setLocation('/registration');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card className="emergency-card">
          <CardContent className="pt-8 pb-8">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emergency text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-compass text-2xl" aria-hidden="true"></i>
              </div>
              <h1 className="text-2xl font-bold text-emergency mb-2">안전나침반</h1>
              <p className="text-gray-600">Safe Compass</p>
            </div>

            {/* Language Selection */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-center mb-6">
                언어를 선택해주세요 / Please select your language
              </h2>
              
              <div className="grid gap-3">
                {languages.map((lang) => (
                  <Button
                    key={lang.code}
                    variant={selectedLanguage === lang.code ? "default" : "outline"}
                    className={`p-4 h-auto text-left justify-start border-2 transition-all duration-200 ${
                      selectedLanguage === lang.code
                        ? 'bg-emergency/10 border-emergency shadow-md'
                        : 'border-gray-200 hover:border-emergency/50'
                    }`}
                    onClick={() => handleLanguageSelect(lang.code)}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <span className="text-2xl">{lang.flag}</span>
                      <div className="flex-1">
                        <p className="font-semibold">{lang.name}</p>
                      </div>
                      {selectedLanguage === lang.code && (
                        <i className="fas fa-check text-emergency" aria-hidden="true"></i>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500">
                지진 재난 대응 AI 가이던스 플랫폼<br />
                Earthquake Disaster Response AI Guidance Platform
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
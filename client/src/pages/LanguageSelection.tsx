import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { FlagIcon } from "@/components/FlagIcon";

const languages = [
  { code: 'ko' as Language, name: '한국어', flag: '🇰🇷', displayCode: 'KR', flagIcon: 'KR' },
  { code: 'en' as Language, name: 'English', flag: '🇺🇸', displayCode: 'EN', flagIcon: 'US' },
  { code: 'vi' as Language, name: 'Tiếng Việt', flag: '🇻🇳', displayCode: 'VI', flagIcon: 'VN' },
  { code: 'zh' as Language, name: '中文', flag: '🇨🇳', displayCode: 'ZH', flagIcon: 'CN' },
];

// Extended languages for future implementation
const futureLanguages = [
  { code: 'ja' as const, name: '日本語', flag: '🇯🇵', displayCode: 'JA', flagIcon: 'JP' },
  { code: 'th' as const, name: 'ไทย', flag: '🇹🇭', displayCode: 'TH', flagIcon: 'TH' },
  { code: 'ru' as const, name: 'Русский', flag: '🇷🇺', displayCode: 'RU', flagIcon: 'RU' },
  { code: 'es' as const, name: 'Español', flag: '🇪🇸', displayCode: 'ES', flagIcon: 'ES' },
  { code: 'fr' as const, name: 'Français', flag: '🇫🇷', displayCode: 'FR', flagIcon: 'FR' },
  { code: 'de' as const, name: 'Deutsch', flag: '🇩🇪', displayCode: 'DE', flagIcon: 'DE' },
];

export default function LanguageSelection() {
  const [, setLocation] = useLocation();
  const { setLanguage, t } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [showAllLanguages, setShowAllLanguages] = useState(false);

  const handleLanguageSelect = (langCode: Language) => {
    console.log('Language selected:', langCode);
    setSelectedLanguage(langCode);
    setLanguage(langCode);
    
    // Clear all localStorage first, then set the selected language
    localStorage.clear();
    localStorage.setItem('selectedLanguage', langCode);
    
    // Navigate to registration after language selection (removed window.location.href)
    setTimeout(() => {
      console.log('Navigating to registration...');
      setLocation('/registration');
    }, 800);
  };

  const displayLanguages = showAllLanguages ? [...languages, ...futureLanguages] : languages;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-lg w-full">
        <Card className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
          <CardContent className="pt-8 pb-8">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <div className="relative w-24 h-24 mx-auto mb-6">
                {/* Outer ring with gradient shadow */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-full shadow-xl">
                  <div className="absolute inset-1 bg-gradient-to-br from-red-400 to-red-600 rounded-full">
                    <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center">
                      {/* Compass icon with better styling */}
                      <i className="fas fa-compass text-red-600 text-4xl transform hover:rotate-45 transition-transform duration-500" aria-hidden="true"></i>
                    </div>
                  </div>
                </div>
                {/* Subtle pulse animation */}
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
              </div>
              <h1 className="text-3xl font-bold text-emergency mb-2">안전나침반</h1>
              <p className="text-gray-600 font-medium">Safe Compass</p>
            </div>

            {/* Language Selection */}
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-lg font-semibold mb-2">
                  언어를 선택해주세요
                </h2>
                <p className="text-sm text-gray-500">
                  Please select your language
                </p>
              </div>
              
              <div className="grid gap-3 max-h-80 overflow-y-auto">
                {displayLanguages.map((lang, index) => {
                  const isActive = languages.some(l => l.code === lang.code);
                  const isFuture = !isActive;
                  
                  return (
                    <Button
                      key={lang.code}
                      variant="outline"
                      disabled={isFuture}
                      className={`p-4 h-auto text-left justify-start border-2 transition-all duration-300 ${
                        selectedLanguage === lang.code
                          ? 'bg-emergency/10 border-emergency shadow-md transform scale-105'
                          : isFuture 
                            ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed' 
                            : 'border-gray-200 hover:border-emergency/50 hover:shadow-md'
                      }`}
                      onClick={() => !isFuture && handleLanguageSelect(lang.code as Language)}
                    >
                      <div className="flex items-center space-x-4 w-full">
                        <div className="relative flex items-center justify-center w-14 h-14 bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
                          {/* Flag background circle for active languages */}
                          {!isFuture && (
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-gray-50 opacity-60"></div>
                          )}
                          <div 
                            className="relative z-10 transform transition-all duration-200 hover:scale-110" 
                            style={{ 
                              filter: isFuture ? 'grayscale(1) brightness(0.7)' : 'none',
                            }}
                          >
                            <span className="text-3xl" style={{ fontSize: '32px', lineHeight: 1 }}>
                              {lang.flag}
                            </span>
                          </div>
                          {/* Shine effect for active languages */}
                          {!isFuture && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-20 transform -skew-x-12 -translate-x-full hover:translate-x-full transition-all duration-700"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{lang.name}</p>
                          {isFuture && (
                            <p className="text-xs text-gray-400 mt-1">준비 중</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {selectedLanguage === lang.code ? (
                            <div className="flex items-center space-x-2">
                              {/* Selected state with flag */}
                              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                                <span className="text-lg" style={{ fontSize: '18px' }}>
                                  {lang.flag}
                                </span>
                              </div>
                              <div className="w-6 h-6 bg-emergency text-white rounded-full flex items-center justify-center animate-pulse">
                                <i className="fas fa-check text-xs" aria-hidden="true"></i>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm font-bold text-gray-600">
                              {lang.displayCode}
                            </span>
                          )}
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>

              {/* Show More Button */}
              {!showAllLanguages && (
                <Button
                  variant="ghost"
                  className="w-full text-gray-500 hover:text-gray-700 border border-dashed border-gray-300 py-3"
                  onClick={() => setShowAllLanguages(true)}
                >
                  <i className="fas fa-plus mr-2" aria-hidden="true"></i>
                  더 많은 언어 보기 ({futureLanguages.length}개 준비 중)
                </Button>
              )}
            </div>

            {/* Footer */}
            <div className="mt-8 text-center border-t border-gray-100 pt-6">
              <p className="text-sm font-medium text-emergency mb-1">
                맞춤형 재난 대응 솔루션
              </p>
              <p className="text-xs text-gray-500">
                Personalized Disaster Response Solution
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
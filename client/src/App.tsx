import { Switch, Route, useLocation, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Registration from "@/pages/Registration";
import ProfileModify from "@/pages/ProfileModify";
import EmergencyAlert from "@/pages/EmergencyAlert";
import EnhancedPersonalizedGuide from "@/pages/EnhancedPersonalizedGuide";
import EmergencyDemo from "@/pages/EmergencyDemo";
import PersonalizedGuideGeneration from "@/pages/PersonalizedGuideGeneration";
import SimplePersonalizedGuide from "@/pages/SimplePersonalizedGuide";
import ShelterMapFixed from "@/pages/ShelterMapFixed";
import LanguageSelection from "@/pages/LanguageSelection";
import EmergencyManuals from "@/pages/EmergencyManuals";
import SOSButton from "@/components/SOSButton";
import { AccessibilityProvider } from "@/components/AccessibilityProvider";
import { LanguageProvider, useLanguage, Language } from "@/contexts/LanguageContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useEmergencySystem } from "@/hooks/useEmergencySystem";
import PushNotification from "@/components/PushNotification";
import AccessibilityTest from "@/components/AccessibilityTest";

function AppContent() {
  const { language, setLanguage } = useLanguage();
  const { data: userProfile } = useUserProfile();
  const [location, setLocation] = useLocation();
  const { currentAlert, isEmergencyActive } = useEmergencySystem();
  const [showNavigation, setShowNavigation] = useState(false);

  // For demo: Always start with language selection
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(false);

  // Initialize app and check language selection
  useEffect(() => {
    const storedLanguage = localStorage.getItem('selectedLanguage');
    
    // Priority 1: No language selected = must go to language selection
    if (!storedLanguage) {
      if (location !== '/language') {
        setHasSelectedLanguage(false);
        setLocation('/language');
      } else {
        setHasSelectedLanguage(false);
      }
      return;
    } 
    
    // Priority 2: Language selected = set up language and continue
    setHasSelectedLanguage(true);
    setLanguage(storedLanguage as Language);
  }, [location, setLocation, setLanguage]);

  // Listen for language selection changes
  useEffect(() => {
    const handleStorageChange = () => {
      const hasLanguage = localStorage.getItem('selectedLanguage') !== null;
      setHasSelectedLanguage(hasLanguage);
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check on every render in case localStorage was updated in the same window
    const hasLanguage = localStorage.getItem('selectedLanguage') !== null;
    if (hasLanguage !== hasSelectedLanguage) {
      setHasSelectedLanguage(hasLanguage);
    }
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [hasSelectedLanguage]);

  // Auto-redirect to emergency page if emergency is active
  useEffect(() => {
    if (isEmergencyActive && currentAlert?.isActive && location !== '/emergency') {
      setLocation('/emergency');
    }
  }, [isEmergencyActive, currentAlert, location, setLocation]);

  // Smart user flow based on user state - only runs after language is selected
  useEffect(() => {
    // Only proceed with user flow if language is selected and we're not on language page
    if (hasSelectedLanguage && location !== '/language') {
      // Check for first-time user vs returning user
      const hasUserData = localStorage.getItem('hasRegistered') === 'true';
      const currentUserId = localStorage.getItem('currentUserId');
      
      
      if (!hasUserData && location !== '/registration') {
        // New user: go to registration 
        setLocation('/registration');
      } else if (hasUserData && currentUserId && location === '/registration') {
        // Registered user shouldn't be on registration page
        setLocation('/');
      } else if (!hasUserData && !currentUserId && location === '/') {
        // If on dashboard but no user data, go to registration
        setLocation('/registration');
      }
    }
  }, [hasSelectedLanguage, location, setLocation, userProfile]);





  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Hide on language selection page */}
      {location !== '/language' && (
        <header className="bg-white shadow-sm border-b-2 border-emergency">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emergency text-white rounded-full flex items-center justify-center">
                <i className="fas fa-compass text-lg" aria-hidden="true"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-emergency">
                  {language === 'ko' ? '안전나침반' : 
                   language === 'en' ? 'Safe Compass' : 
                   language === 'vi' ? 'La Bàn An Toàn' : 
                   '安全指南针'}
                </h1>
                <p className="text-sm text-gray-600">
                  {language === 'ko' ? '맞춤형 재난 대응 솔루션' : 
                   language === 'en' ? 'Personalized Disaster Response Solution' : 
                   language === 'vi' ? 'Giải pháp ứng phó thiên tai cá nhân hóa' : 
                   '个性化灾难应对解决方案'}
                </p>
              </div>
              {isEmergencyActive && currentAlert?.isActive && (
                <div className="ml-4 pulse-animation">
                  <div className="w-3 h-3 bg-emergency rounded-full animate-ping"></div>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Home Icon */}
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <i className="fas fa-home text-lg" aria-hidden="true"></i>
                </Button>
              </Link>
              

              
              {/* Navigation Toggle */}
              {userProfile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNavigation(!showNavigation)}
                  className="lg:hidden"
                >
                  <i className="fas fa-bars" aria-hidden="true"></i>
                </Button>
              )}
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full">
                  <span className="sr-only">사용자 프로필</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          {userProfile && (showNavigation || window.innerWidth >= 1024) && (
            <nav className="border-t py-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={location === '/' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setLocation('/');
                    setShowNavigation(false);
                  }}
                >
                  <i className="fas fa-tachometer-alt mr-2" aria-hidden="true"></i>
                  {getText('nav.dashboard')}
                </Button>
                
                <Button
                  variant={location === '/shelters' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setLocation('/shelters');
                    setShowNavigation(false);
                  }}
                >
                  <i className="fas fa-map-marker-alt mr-2" aria-hidden="true"></i>
                  {language === 'ko' ? '대피소 지도' : 
                     language === 'en' ? 'Shelter Map' : 
                     language === 'vi' ? 'Bản đồ nơi trú ẩn' : 
                     '避难所地图'}
                </Button>
                
                {isEmergencyActive && (
                  <Button
                    variant={location === '/emergency' ? 'default' : 'outline'}
                    size="sm"
                    className="bg-emergency text-white hover:bg-emergency/90 pulse-animation"
                    onClick={() => {
                      setLocation('/emergency');
                      setShowNavigation(false);
                    }}
                  >
                    <i className="fas fa-exclamation-triangle mr-2" aria-hidden="true"></i>
                    {language === 'ko' ? '긴급 상황' : 
                       language === 'en' ? 'Emergency' : 
                       language === 'vi' ? 'Khẩn cấp' : 
                       '紧急情况'}
                    {currentAlert?.isActive && (
                      <span className="ml-1 w-2 h-2 bg-white rounded-full animate-ping"></span>
                    )}
                  </Button>
                )}
              </div>
            </nav>
          )}
        </div>
        </header>
      )}

      {/* Main Content */}
      <main className={location === '/language' ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'}>
        <Switch>
          <Route path="/language" component={LanguageSelection} />
          <Route path="/" component={Dashboard} />
          <Route path="/registration" component={Registration} />
          <Route path="/modify" component={ProfileModify} />
          <Route path="/emergency" component={EmergencyAlert} />
          <Route path="/guide" component={EnhancedPersonalizedGuide} />
          <Route path="/personalized-guide" component={PersonalizedGuideGeneration} />
          <Route path="/simple-guide" component={SimplePersonalizedGuide} />
          <Route path="/shelters" component={ShelterMapFixed} />
          <Route path="/shelter-map" component={ShelterMapFixed} />
          <Route path="/shelter-map-fixed" component={ShelterMapFixed} />
          <Route path="/test" component={AccessibilityTest} />
          <Route path="/accessibility-test" component={AccessibilityTest} />
          <Route path="/emergency-demo" component={EmergencyDemo} />
          <Route path="/emergency-manuals" component={EmergencyManuals} />
          <Route component={NotFound} />
        </Switch>
      </main>

      {/* SOS Floating Button */}
      <SOSButton />
      
      {/* 전역 PUSH 알림 - 단 하나만 렌더링 */}
      {currentAlert && currentAlert.isActive && (
        <PushNotification
          alert={currentAlert}
          onDismiss={() => console.log('전역 알림 무시됨')}
          onOpen={() => setLocation('/emergency')}
        />
      )}
      
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AccessibilityProvider>
          <TooltipProvider>
            <AppContent />
          </TooltipProvider>
        </AccessibilityProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;

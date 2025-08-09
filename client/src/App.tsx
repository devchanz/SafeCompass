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
import EmergencyAlert from "@/pages/EmergencyAlert";
import PersonalizedGuide from "@/pages/PersonalizedGuide";
import ShelterMap from "@/pages/ShelterMap";
import SOSButton from "@/components/SOSButton";
import { AccessibilityProvider } from "@/components/AccessibilityProvider";
import { LanguageProvider, useLanguage, Language } from "@/contexts/LanguageContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useEmergencyNotification } from "@/hooks/useEmergencyNotification";

function AppContent() {
  const { language, setLanguage, t } = useLanguage();
  const { data: userProfile } = useUserProfile();
  const [location, setLocation] = useLocation();
  const { isEmergencyActive, hasUnreadAlert, markAlertAsRead } = useEmergencyNotification();
  const [showNavigation, setShowNavigation] = useState(false);

  // Auto-redirect to emergency page if emergency is active and unread
  useEffect(() => {
    if (isEmergencyActive && hasUnreadAlert && location !== '/emergency') {
      setLocation('/emergency');
    }
  }, [isEmergencyActive, hasUnreadAlert, location, setLocation]);

  // Redirect to registration if no user profile exists and not already on registration page
  useEffect(() => {
    if (!userProfile && location !== '/registration') {
      setLocation('/registration');
    }
  }, [userProfile, location, setLocation]);



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-emergency">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emergency text-white rounded-full flex items-center justify-center">
                <i className="fas fa-compass text-lg" aria-hidden="true"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-emergency">{t('dashboard.title')}</h1>
                <p className="text-sm text-gray-600">{t('dashboard.subtitle')}</p>
              </div>
              {isEmergencyActive && hasUnreadAlert && (
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
              
              {/* Language Selector */}
              <select 
                className="text-sm border border-gray-300 rounded-md px-2 py-1"
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
              >
                <option value="korean">한국어</option>
                <option value="english">English</option>
                <option value="vietnamese">Tiếng Việt</option>
                <option value="chinese">中文</option>
              </select>
              
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
                  {t('nav.dashboard')}
                </Button>
                
                <Button
                  variant={location === '/registration' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setLocation('/registration');
                    setShowNavigation(false);
                  }}
                >
                  <i className="fas fa-user-edit mr-2" aria-hidden="true"></i>
                  {t('nav.registration')}
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
                  {t('nav.shelter')}
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
                    {t('nav.emergency')}
                    {hasUnreadAlert && (
                      <span className="ml-1 w-2 h-2 bg-white rounded-full animate-ping"></span>
                    )}
                  </Button>
                )}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/registration" component={Registration} />
          <Route path="/emergency" component={EmergencyAlert} />
          <Route path="/guide" component={PersonalizedGuide} />
          <Route path="/shelters" component={ShelterMap} />
          <Route component={NotFound} />
        </Switch>
      </main>

      {/* SOS Floating Button */}
      <SOSButton />
      
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

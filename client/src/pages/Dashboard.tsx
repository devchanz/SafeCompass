import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useEmergency } from "@/hooks/useEmergency";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Dashboard() {
  const { data: userProfile } = useUserProfile();
  const { simulateEarthquake } = useEmergency();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  if (!userProfile) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="emergency-card">
          <CardContent className="text-center py-8">
            <i className="fas fa-user-plus text-4xl text-emergency mb-4" aria-hidden="true"></i>
            <h2 className="text-2xl font-bold mb-4">{t('dashboard.welcome')}</h2>
            <p className="text-gray-600 mb-6">
              {t('dashboard.welcome_message')}
            </p>
            <Link href="/registration">
              <Button className="bg-emergency hover:bg-emergency-dark">
                <i className="fas fa-arrow-right mr-2" aria-hidden="true"></i>
                {t('dashboard.register_info')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Emergency Status Card */}
      <Card className="emergency-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-safety text-white rounded-full flex items-center justify-center">
                <i className="fas fa-shield-alt text-xl" aria-hidden="true"></i>
              </div>
              <div>
                <h2 className="text-xl font-bold text-safety">{t('dashboard.safety_status')}</h2>
                <p className="text-gray-600">{t('dashboard.no_danger_detected')}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">{t('dashboard.last_check')}</p>
              <p className="text-sm font-medium">{t('dashboard.just_now')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">{t('dashboard.quick_actions')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/guide">
            <Card className="emergency-card hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="text-center pt-6">
                <i className="fas fa-book text-2xl text-emergency mb-2" aria-hidden="true"></i>
                <p className="text-sm font-medium">{t('dashboard.emergency_manual')}</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/shelters">
            <Card className="emergency-card hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="text-center pt-6">
                <i className="fas fa-map-marker-alt text-2xl text-safety mb-2" aria-hidden="true"></i>
                <p className="text-sm font-medium">{t('dashboard.find_shelter')}</p>
              </CardContent>
            </Card>
          </Link>
          
          <Card 
            className="emergency-card hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => {
              if (navigator.vibrate) {
                navigator.vibrate([200, 100, 200]);
              }
              alert(t('dashboard.alert_test_executed'));
            }}
          >
            <CardContent className="text-center pt-6">
              <i className="fas fa-bell text-2xl text-warning mb-2" aria-hidden="true"></i>
              <p className="text-sm font-medium">{t('dashboard.alert_test')}</p>
            </CardContent>
          </Card>
          
          <Link href="/registration">
            <Card className="emergency-card hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="text-center pt-6">
                <i className="fas fa-cog text-2xl text-gray-600 mb-2" aria-hidden="true"></i>
                <p className="text-sm font-medium">{t('dashboard.settings')}</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* User Profile Summary */}
      <Card className="emergency-card">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <i className="fas fa-user-circle text-emergency mr-2" aria-hidden="true"></i>
            {t('dashboard.my_profile')}
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{t('dashboard.name')}:</span>
              <span className="font-medium">{userProfile.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{t('dashboard.age')}:</span>
              <span className="font-medium">{userProfile.age}{t('dashboard.age_suffix')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{t('dashboard.evacuation_ability')}:</span>
              <span className={`font-medium ${
                userProfile.mobility === 'independent' ? 'text-safety' :
                userProfile.mobility === 'assisted' ? 'text-warning' : 'text-emergency'
              }`}>
                {userProfile.mobility === 'independent' ? t('dashboard.mobility_independent') :
                 userProfile.mobility === 'assisted' ? t('dashboard.mobility_assisted') : t('dashboard.mobility_unable')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{t('dashboard.accessibility')}:</span>
              <div className="flex space-x-2">
                {userProfile.accessibility?.includes('visual') && (
                  <span className="px-2 py-1 bg-safety text-white text-xs rounded">{t('dashboard.visual_support')}</span>
                )}
                {userProfile.accessibility?.includes('hearing') && (
                  <span className="px-2 py-1 bg-warning text-white text-xs rounded">{t('dashboard.hearing_support')}</span>
                )}
                {(!userProfile.accessibility || userProfile.accessibility.length === 0) && (
                  <span className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded">{t('dashboard.basic_support')}</span>
                )}
              </div>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            className="mt-4 w-full text-emergency hover:text-emergency-dark"
            onClick={() => setLocation('/registration')}
          >
            <i className="fas fa-edit mr-1" aria-hidden="true"></i>
            {t('dashboard.edit_profile')}
          </Button>
        </CardContent>
      </Card>

      {/* Demo Emergency Trigger */}
      <Card className="bg-yellow-50 border border-yellow-200">
        <CardContent className="pt-6">
          <p className="text-sm text-yellow-800 mb-3">
            <i className="fas fa-flask mr-2" aria-hidden="true"></i>
            <strong>{t('dashboard.demo_mode')}:</strong> {t('dashboard.demo_description')}
          </p>
          <div className="grid gap-2">
            <Button 
              onClick={simulateEarthquake}
              className="bg-warning hover:bg-orange-600"
            >
              <i className="fas fa-exclamation-triangle mr-2" aria-hidden="true"></i>
              {t('dashboard.earthquake_simulation')}
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => window.open('/clear-cache.html', '_blank')}
                variant="outline"
                size="sm"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <i className="fas fa-broom mr-1" aria-hidden="true"></i>
                캐시 정리
              </Button>
              <Button 
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.href = '/language';
                }}
                variant="outline" 
                size="sm"
                className="border-green-300 text-green-700 hover:bg-green-50"
              >
                <i className="fas fa-user-plus mr-1" aria-hidden="true"></i>
                새 사용자
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

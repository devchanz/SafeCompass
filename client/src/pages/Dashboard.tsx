import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useEmergency } from "@/hooks/useEmergency";

export default function Dashboard() {
  const { data: userProfile } = useUserProfile();
  const { simulateEarthquake } = useEmergency();

  if (!userProfile) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="emergency-card">
          <CardContent className="text-center py-8">
            <i className="fas fa-user-plus text-4xl text-emergency mb-4" aria-hidden="true"></i>
            <h2 className="text-2xl font-bold mb-4">환영합니다!</h2>
            <p className="text-gray-600 mb-6">
              맞춤형 안전 가이드를 받기 위해 먼저 개인정보를 등록해주세요.
            </p>
            <Link href="/registration">
              <Button className="bg-emergency hover:bg-emergency-dark">
                <i className="fas fa-arrow-right mr-2" aria-hidden="true"></i>
                정보 등록하기
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
                <h2 className="text-xl font-bold text-safety">안전 상태</h2>
                <p className="text-gray-600">현재 위험 상황이 감지되지 않았습니다</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">마지막 확인</p>
              <p className="text-sm font-medium">방금 전</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">빠른 실행</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/guide">
            <Card className="emergency-card hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="text-center pt-6">
                <i className="fas fa-book text-2xl text-emergency mb-2" aria-hidden="true"></i>
                <p className="text-sm font-medium">응급매뉴얼</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/shelters">
            <Card className="emergency-card hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="text-center pt-6">
                <i className="fas fa-map-marker-alt text-2xl text-safety mb-2" aria-hidden="true"></i>
                <p className="text-sm font-medium">대피소 찾기</p>
              </CardContent>
            </Card>
          </Link>
          
          <Card 
            className="emergency-card hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => {
              if (navigator.vibrate) {
                navigator.vibrate([200, 100, 200]);
              }
              alert('알림 테스트가 실행되었습니다');
            }}
          >
            <CardContent className="text-center pt-6">
              <i className="fas fa-bell text-2xl text-warning mb-2" aria-hidden="true"></i>
              <p className="text-sm font-medium">알림 테스트</p>
            </CardContent>
          </Card>
          
          <Link href="/registration">
            <Card className="emergency-card hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="text-center pt-6">
                <i className="fas fa-cog text-2xl text-gray-600 mb-2" aria-hidden="true"></i>
                <p className="text-sm font-medium">설정</p>
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
            내 프로필
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">이름:</span>
              <span className="font-medium">{userProfile.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">나이:</span>
              <span className="font-medium">{userProfile.age}세</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">자력대피 능력:</span>
              <span className={`font-medium ${
                userProfile.mobility === 'independent' ? 'text-safety' :
                userProfile.mobility === 'assisted' ? 'text-warning' : 'text-emergency'
              }`}>
                {userProfile.mobility === 'independent' ? '자력대피 가능' :
                 userProfile.mobility === 'assisted' ? '부분 도움 필요' : '자력대피 불가능'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">접근성 지원:</span>
              <div className="flex space-x-2">
                {userProfile.accessibility?.includes('visual') && (
                  <span className="px-2 py-1 bg-safety text-white text-xs rounded">시각</span>
                )}
                {userProfile.accessibility?.includes('hearing') && (
                  <span className="px-2 py-1 bg-warning text-white text-xs rounded">청각</span>
                )}
                {(!userProfile.accessibility || userProfile.accessibility.length === 0) && (
                  <span className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded">기본</span>
                )}
              </div>
            </div>
          </div>
          
          <Link href="/registration">
            <Button variant="ghost" className="mt-4 w-full text-emergency hover:text-emergency-dark">
              <i className="fas fa-edit mr-1" aria-hidden="true"></i>
              정보 수정
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Demo Emergency Trigger */}
      <Card className="bg-yellow-50 border border-yellow-200">
        <CardContent className="pt-6">
          <p className="text-sm text-yellow-800 mb-3">
            <i className="fas fa-flask mr-2" aria-hidden="true"></i>
            <strong>데모 모드:</strong> 아래 버튼을 클릭하여 지진 경보를 시뮬레이션할 수 있습니다.
          </p>
          <Button 
            onClick={simulateEarthquake}
            className="bg-warning hover:bg-orange-600"
          >
            <i className="fas fa-exclamation-triangle mr-2" aria-hidden="true"></i>
            지진 경보 시뮬레이션
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SOSButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: userProfile } = useUserProfile();
  const { language } = useLanguage();
  const { toast } = useToast();

  // 다국어 텍스트
  const getText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      ko: {
        emergency_sos: '긴급 SOS',
        need_help: '도움이 필요한 상황을 알려주세요',
        call_119: '119 신고',
        notify_partner: '동행 파트너에게 알리기',
        cancel: '취소',
        emergency_message: '긴급상황! 현재 위치에서 도움이 필요합니다.',
        location_sent: '위치 정보와 함께 긴급 알림을 전송했습니다',
        no_partner: '등록된 동행 파트너가 없습니다. 프로필에서 추가하세요.',
        gps_getting: 'GPS 위치 확인 중...'
      },
      en: {
        emergency_sos: 'Emergency SOS',
        need_help: 'Report emergency situation',
        call_119: 'Call 119',
        notify_partner: 'Notify Emergency Partner',
        cancel: 'Cancel',
        emergency_message: 'EMERGENCY! Need help at my current location.',
        location_sent: 'Emergency alert sent with location information',
        no_partner: 'No emergency partner registered. Add one in your profile.',
        gps_getting: 'Getting GPS location...'
      },
      vi: {
        emergency_sos: 'SOS khẩn cấp',
        need_help: 'Báo cáo tình huống khẩn cấp',
        call_119: 'Gọi 119',
        notify_partner: 'Thông báo đối tác khẩn cấp',
        cancel: 'Hủy',
        emergency_message: 'KHẨN CẤP! Cần trợ giúp tại vị trí hiện tại.',
        location_sent: 'Cảnh báo khẩn cấp đã được gửi cùng thông tin vị trí',
        no_partner: 'Chưa đăng ký đối tác khẩn cấp. Thêm trong hồ sơ của bạn.',
        gps_getting: 'Đang lấy vị trí GPS...'
      },
      zh: {
        emergency_sos: '紧急SOS',
        need_help: '报告紧急情况',
        call_119: '拨打119',
        notify_partner: '通知紧急联系人',
        cancel: '取消',
        emergency_message: '紧急情况！当前位置需要帮助。',
        location_sent: '已发送紧急警报和位置信息',
        no_partner: '未注册紧急联系人。请在个人资料中添加。',
        gps_getting: '正在获取GPS位置...'
      }
    };
    return texts[language]?.[key] || texts['ko'][key] || key;
  };

  const handleCall119 = () => {
    // 진동과 함께 119 연결
    if (navigator.vibrate) {
      navigator.vibrate([300, 100, 300, 100, 300]);
    }
    window.location.href = 'tel:119';
    setIsOpen(false);
  };

  const handleContactPartner = async () => {
    // 사용자 프로필에서 파트너 정보 확인
    if (!userProfile?.partner?.phone) {
      toast({
        title: "⚠️ " + getText('no_partner'),
        variant: "destructive",
        duration: 4000,
      });
      return;
    }

    try {
      // GPS 위치 가져오기
      toast({
        title: "📍 " + getText('gps_getting'),
      });

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // 위치 정보 포함한 긴급 메시지
          const emergencyMessage = `${getText('emergency_message')} 
위치: https://maps.google.com/maps?q=${lat},${lng}
좌표: ${lat.toFixed(6)}, ${lng.toFixed(6)}
시간: ${new Date().toLocaleString()}`;

          const encodedMessage = encodeURIComponent(emergencyMessage);
          
          // SMS 전송
          window.location.href = `sms:${userProfile.partner.phone}?body=${encodedMessage}`;
          
          // 성공 토스트
          toast({
            title: "✅ " + getText('location_sent'),
            description: `${userProfile.partner.name} (${userProfile.partner.phone})`,
            duration: 5000,
          });

          // 진동 피드백
          if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          }
        },
        (error) => {
          console.error('위치 정보 오류:', error);
          // 위치 없이도 전송
          const basicMessage = getText('emergency_message');
          const encodedMessage = encodeURIComponent(basicMessage + ` 시간: ${new Date().toLocaleString()}`);
          window.location.href = `sms:${userProfile.partner.phone}?body=${encodedMessage}`;
          
          toast({
            title: "📱 긴급 알림 전송됨",
            description: "위치 정보 없이 전송되었습니다",
            duration: 3000,
          });
        }
      );
    } catch (error) {
      console.error('파트너 연락 오류:', error);
      toast({
        title: "❌ 전송 실패",
        description: "다시 시도해주세요",
        variant: "destructive",
        duration: 3000,
      });
    }
    
    setIsOpen(false);
  };

  const handleOpenSOS = () => {
    setIsOpen(true);
    
    // Trigger strong vibration for attention
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
  };

  return (
    <>
      <Button
        onClick={handleOpenSOS}
        className="sos-float bg-emergency hover:bg-emergency-dark text-white p-4 rounded-full emergency-pulse shadow-lg"
        aria-label={getText('emergency_sos')}
      >
        <i className="fas fa-exclamation-triangle text-2xl" aria-hidden="true"></i>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md w-full mx-4">
          <DialogHeader>
            <div className="text-center">
              <div className="w-16 h-16 bg-emergency text-white rounded-full flex items-center justify-center mx-auto mb-4 emergency-pulse">
                <i className="fas fa-exclamation-triangle text-2xl" aria-hidden="true"></i>
              </div>
              <DialogTitle className="text-2xl font-bold text-emergency mb-2">{getText('emergency_sos')}</DialogTitle>
              <p className="text-gray-600 mb-6">{getText('need_help')}</p>
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* 파트너 정보 표시 */}
            {userProfile?.partner?.name && (
              <Alert className="bg-blue-50 border-blue-200">
                <i className="fas fa-user-friends text-blue-600" aria-hidden="true"></i>
                <AlertDescription>
                  <strong>{language === 'ko' ? '등록된 파트너' : language === 'en' ? 'Registered Partner' : language === 'vi' ? 'Đối tác đã đăng ký' : '已注册伙伴'}:</strong><br />
                  {userProfile.partner.name} ({userProfile.partner.phone})
                </AlertDescription>
              </Alert>
            )}
            
            <Button 
              onClick={handleCall119}
              className="w-full bg-emergency hover:bg-emergency-dark py-3 px-4 font-semibold"
            >
              <i className="fas fa-phone mr-2" aria-hidden="true"></i>
              {getText('call_119')}
            </Button>
            
            <Button 
              onClick={handleContactPartner}
              className="w-full bg-safety hover:bg-green-600 py-3 px-4 font-semibold"
              disabled={!userProfile?.partner?.phone}
            >
              <i className="fas fa-sms mr-2" aria-hidden="true"></i>
              {getText('notify_partner')}
            </Button>
            
            <Button 
              onClick={() => setIsOpen(false)}
              variant="outline"
              className="w-full py-3 px-4 font-semibold"
            >
              {getText('cancel')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

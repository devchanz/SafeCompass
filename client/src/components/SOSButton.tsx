import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function SOSButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleCall119 = () => {
    window.location.href = 'tel:119';
    setIsOpen(false);
  };

  const handleContactPartner = () => {
    const message = encodeURIComponent(`긴급상황! 현재 위치에서 도움이 필요합니다.`);
    window.location.href = `sms:010-1234-5678?body=${message}`;
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
        aria-label="긴급 SOS 요청"
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
              <DialogTitle className="text-2xl font-bold text-emergency mb-2">긴급 SOS</DialogTitle>
              <p className="text-gray-600 mb-6">도움이 필요한 상황을 알려주세요</p>
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            <Button 
              onClick={handleCall119}
              className="w-full bg-emergency hover:bg-emergency-dark py-3 px-4 font-semibold"
            >
              <i className="fas fa-phone mr-2" aria-hidden="true"></i>
              119 신고
            </Button>
            
            <Button 
              onClick={handleContactPartner}
              className="w-full bg-safety hover:bg-green-600 py-3 px-4 font-semibold"
            >
              <i className="fas fa-sms mr-2" aria-hidden="true"></i>
              동행 파트너에게 알리기
            </Button>
            
            <Button 
              onClick={() => setIsOpen(false)}
              variant="outline"
              className="w-full py-3 px-4 font-semibold"
            >
              취소
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

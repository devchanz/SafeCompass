/**
 * 캐시 및 쿠키 관리 유틸리티
 */

export const clearBrowserCache = () => {
  try {
    // LocalStorage 완전 정리
    localStorage.clear();
    
    // SessionStorage 정리
    sessionStorage.clear();
    
    // Service Worker 캐시 정리 (가능한 경우)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister();
        });
      });
    }
    
    // 브라우저 캐시 API 사용 (가능한 경우)
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    console.log('✅ 브라우저 캐시가 정리되었습니다');
    return true;
  } catch (error) {
    console.error('❌ 캐시 정리 중 오류:', error);
    return false;
  }
};

export const forcePageReload = () => {
  // 캐시 무시하고 강제 새로고침
  window.location.reload();
};

export const resetUserSession = () => {
  // 사용자 세션 관련 데이터만 정리
  const keysToRemove = [
    'currentUserId',
    'hasRegistered', 
    'userProfile',
    'emergencyStatus',
    'lastEmergencyCheck'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log('✅ 사용자 세션이 초기화되었습니다');
};

export const debugStorageState = () => {
  console.log('🔍 현재 Storage 상태:');
  console.log('localStorage:', Object.keys(localStorage));
  console.log('sessionStorage:', Object.keys(sessionStorage));
  console.log('현재 언어:', localStorage.getItem('selectedLanguage'));
  console.log('등록 상태:', localStorage.getItem('hasRegistered'));
  console.log('사용자 ID:', localStorage.getItem('currentUserId'));
};
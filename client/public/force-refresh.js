// 완전한 캐시 및 저장소 정리 스크립트
(function() {
  console.log('🧹 캐시 정리 시작...');
  
  // 1. Service Worker 캐시 삭제
  if ('caches' in window) {
    caches.keys().then(function(cacheNames) {
      console.log('📦 캐시 삭제:', cacheNames);
      return Promise.all(
        cacheNames.map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('✅ Service Worker 캐시 삭제 완료');
    });
  }
  
  // 2. LocalStorage 완전 삭제
  try {
    const localStorageKeys = Object.keys(localStorage);
    console.log('🗃️ LocalStorage 키들:', localStorageKeys);
    localStorage.clear();
    console.log('✅ LocalStorage 삭제 완료');
  } catch (e) {
    console.log('⚠️ LocalStorage 삭제 실패:', e);
  }
  
  // 3. SessionStorage 완전 삭제
  try {
    const sessionStorageKeys = Object.keys(sessionStorage);
    console.log('📋 SessionStorage 키들:', sessionStorageKeys);
    sessionStorage.clear();
    console.log('✅ SessionStorage 삭제 완료');
  } catch (e) {
    console.log('⚠️ SessionStorage 삭제 실패:', e);
  }
  
  // 4. IndexedDB 삭제 (있다면)
  if ('indexedDB' in window) {
    try {
      indexedDB.databases().then(databases => {
        databases.forEach(db => {
          console.log('🗄️ IndexedDB 삭제:', db.name);
          indexedDB.deleteDatabase(db.name);
        });
      });
    } catch (e) {
      console.log('⚠️ IndexedDB 접근 실패:', e);
    }
  }
  
  // 5. 쿠키 삭제 (현재 도메인)
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
  });
  console.log('🍪 쿠키 삭제 완료');
  
  // 6. 메모리 정리
  if ('gc' in window && typeof window.gc === 'function') {
    window.gc();
    console.log('🧠 가비지 컬렉션 실행');
  }
  
  // 7. 강제 새로고침 (캐시 무시)
  console.log('🔄 강제 새로고침 실행...');
  setTimeout(() => {
    // location.reload(true)는 deprecated이므로 더 강력한 방법 사용
    window.location.href = window.location.href + '?bust=' + Date.now();
  }, 500);
  
})();
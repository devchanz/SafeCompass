// Force refresh to clear all cached translations
(function() {
  // Clear all caches
  if ('caches' in window) {
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    });
  }
  
  // Clear localStorage and sessionStorage
  localStorage.clear();
  sessionStorage.clear();
  
  // Force hard refresh after clearing caches
  setTimeout(() => {
    window.location.reload(true);
  }, 100);
})();
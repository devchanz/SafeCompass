// Clear all storage and unregister service workers
function clearAllStorage() {
  // Clear localStorage
  localStorage.clear();
  console.log('localStorage cleared');
  
  // Clear sessionStorage
  sessionStorage.clear();
  console.log('sessionStorage cleared');
  
  // Clear all caches
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
        console.log('Cache deleted:', name);
      });
    });
  }
  
  // Unregister all service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.unregister();
        console.log('Service Worker unregistered:', registration);
      });
    });
  }
  
  // Reload the page
  window.location.reload();
}

// Auto-execute when loaded
clearAllStorage();

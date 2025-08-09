// Development and Testing Utilities
// This file provides utilities for testing and development workflows

export const TestUtils = {
  // Clear all user data for fresh start testing
  clearAllUserData: () => {
    localStorage.removeItem('selectedLanguage');
    localStorage.removeItem('hasRegistered');
    localStorage.removeItem('currentUserId');
    sessionStorage.clear();
    console.log('🧪 All user data cleared for fresh testing');
  },

  // Enable demo mode for quick testing
  enableDemoMode: () => {
    localStorage.setItem('hasRegistered', 'true');
    localStorage.setItem('currentUserId', 'demo-user-1');
    console.log('🎭 Demo mode enabled - user will see dashboard');
  },

  // Get current user state for debugging
  getUserState: () => {
    const state = {
      selectedLanguage: localStorage.getItem('selectedLanguage'),
      hasRegistered: localStorage.getItem('hasRegistered'),
      currentUserId: localStorage.getItem('currentUserId'),
    };
    console.log('👤 Current user state:', state);
    return state;
  },

  // Reset to new user state
  resetToNewUser: () => {
    TestUtils.clearAllUserData();
    // Keep language selection if it exists
    const language = localStorage.getItem('selectedLanguage');
    if (language) {
      localStorage.setItem('selectedLanguage', language);
    }
    console.log('🆕 Reset to new user state');
  }
};

// Make available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).TestUtils = TestUtils;
}
import { createContext, useContext, useEffect, ReactNode } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";

interface AccessibilityContextType {
  isLargeText: boolean;
  hasVisualSupport: boolean;
  hasHearingSupport: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType>({
  isLargeText: false,
  hasVisualSupport: false,
  hasHearingSupport: false,
});

export const useAccessibility = () => {
  return useContext(AccessibilityContext);
};

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const { data: userProfile } = useUserProfile();

  const isLargeText = (userProfile?.age || 0) >= 65;
  const hasVisualSupport = userProfile?.accessibility?.includes('visual') || false;
  const hasHearingSupport = userProfile?.accessibility?.includes('hearing') || false;

  useEffect(() => {
    const body = document.body;
    
    // Apply accessibility classes
    if (isLargeText) {
      body.classList.add('large-text');
    } else {
      body.classList.remove('large-text');
    }
    
    if (hasVisualSupport) {
      body.classList.add('accessibility-visual');
    } else {
      body.classList.remove('accessibility-visual');
    }
    
    if (hasHearingSupport) {
      body.classList.add('accessibility-hearing');
    } else {
      body.classList.remove('accessibility-hearing');
    }

    return () => {
      body.classList.remove('large-text', 'accessibility-visual', 'accessibility-hearing');
    };
  }, [isLargeText, hasVisualSupport, hasHearingSupport]);

  return (
    <AccessibilityContext.Provider value={{
      isLargeText,
      hasVisualSupport,
      hasHearingSupport,
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

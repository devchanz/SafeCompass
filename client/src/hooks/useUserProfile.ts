import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/services/api";
import { type User, type InsertUser, type InsertCompanion, type Companion } from "@shared/schema";

export function useUserProfile() {
  const queryClient = useQueryClient();

  // Get current user ID from localStorage or use demo ID
  const getCurrentUserId = () => {
    const hasRegistered = localStorage.getItem('hasRegistered') === 'true';
    const currentUserId = localStorage.getItem('currentUserId');
    
    // If not registered or no user ID, don't load any profile
    if (!hasRegistered || !currentUserId) {
      return null;
    }
    
    return currentUserId;
  };

  const userId = getCurrentUserId();

  const query = useQuery({
    queryKey: ["/api/users", userId],
    queryFn: async () => {
      // Check if language has been selected first
      const hasSelectedLanguage = localStorage.getItem('selectedLanguage') !== null;
      if (!hasSelectedLanguage || !userId) {
        return null; // Don't load user profile until language is selected and user exists
      }
      
      try {
        const response = await apiRequest("GET", `/api/users/${userId}`);
        return response.json() as Promise<User>;
      } catch (error) {
        // If user doesn't exist, return null
        if ((error as Error).message.includes("404")) {
          return null;
        }
        throw error;
      }
    },
    enabled: localStorage.getItem('selectedLanguage') !== null && userId !== null, // Only enable when language is selected and user exists
  });

  const createProfile = useMutation({
    mutationFn: async (userData: InsertUser) => {
      const response = await apiRequest("POST", "/api/users", userData);
      return response.json() as Promise<User>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });

  const updateProfile = useMutation({
    mutationFn: async ({ id, ...userData }: { id: string } & Partial<InsertUser>) => {
      const response = await apiRequest("PUT", `/api/users/${id}`, userData);
      return response.json() as Promise<User>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });

  const createCompanion = useMutation({
    mutationFn: async (companionData: InsertCompanion) => {
      const response = await apiRequest("POST", "/api/companions", companionData);
      return response.json() as Promise<Companion>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companions"] });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    createProfile,
    updateProfile,
    createCompanion,
  };
}

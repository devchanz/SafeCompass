import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/services/api";
import { type User, type InsertUser, type InsertCompanion, type Companion } from "@shared/schema";

export function useUserProfile() {
  const queryClient = useQueryClient();

  // For demo purposes, we'll use a single user ID
  const userId = "demo-user-1";

  const query = useQuery({
    queryKey: ["/api/users", userId],
    queryFn: async () => {
      // Check if language has been selected first
      const hasSelectedLanguage = localStorage.getItem('selectedLanguage') !== null;
      if (!hasSelectedLanguage) {
        return null; // Don't load user profile until language is selected
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
    enabled: localStorage.getItem('selectedLanguage') !== null, // Only enable when language is selected
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

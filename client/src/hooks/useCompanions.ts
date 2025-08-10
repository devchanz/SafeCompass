import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/services/api";
import { type Companion } from "@shared/schema";

export function useCompanions(userId?: string) {
  return useQuery({
    queryKey: ["/api/companions", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      try {
        const response = await apiRequest("GET", `/api/users/${userId}/companions`);
        return response.json() as Promise<Companion[]>;
      } catch (error) {
        // If user doesn't exist or no companions, return empty array
        if ((error as Error).message.includes("404") || (error as Error).message.includes("500")) {
          return [];
        }
        throw error;
      }
    },
    enabled: !!userId, // Only enable when userId is available
  });
}
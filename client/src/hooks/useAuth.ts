import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    // In development, use returnNull behavior to handle errors gracefully
    queryFn: async ({ queryKey }) => {
      const url = queryKey.join("/") as string;
      const headers: Record<string, string> = {};
      
      // Development mode: Add API key for auth endpoint
      if (import.meta.env.DEV) {
        headers["x-admin-api-key"] = "dev-admin-key-12345";
      }
      
      try {
        // Add timeout for fetch (5 seconds max)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const res = await fetch(url, {
          credentials: "include",
          headers,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (res.status === 401) {
          return null;
        }

        if (!res.ok) {
          const text = (await res.text()) || res.statusText;
          throw new Error(`${res.status}: ${text}`);
        }

        return await res.json();
      } catch (error: any) {
        // In development, return mock user if fetch fails or times out
        if (import.meta.env.DEV) {
          if (error.name === 'AbortError') {
            console.warn("Auth query timed out (dev mode), returning mock user");
          } else {
            console.warn("Auth query failed (dev mode):", error);
          }
          // Return mock user immediately instead of null
          return {
            id: "dev-admin-user",
            email: "admin@artinyxus.com",
            firstName: "Admin",
            lastName: "User",
            isAdmin: true,
            profileImageUrl: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as User;
        }
        throw error;
      }
    },
  });

  return {
    user: user ?? undefined,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin ?? false,
    error,
  };
}

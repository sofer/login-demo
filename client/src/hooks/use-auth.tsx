import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { type User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  logoutMutation: any;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/auth/me");
        if (!res.ok) {
          if (res.status === 401) {
            return null;
          }
          throw new Error("Authentication failed");
        }
        const data = await res.json();
        return {
          id: data.id || 0,
          email: data.email,
          isVerified: true
        };
      } catch (error) {
        console.error("Auth error:", error);
        return null;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        logoutMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
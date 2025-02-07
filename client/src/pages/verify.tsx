import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Verify() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  // Enhanced token extraction with detailed logging
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get("token");

  const query = useQuery({
    queryKey: ["/api/auth/verify", token],
    queryFn: async () => {
      if (!token) {
        throw new Error("No verification token provided");
      }
      try {
        const response = await apiRequest("GET", `/api/auth/verify?token=${token}`);
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Verification error:", error);
        throw error;
      }
    },
    enabled: !!token,
    retry: false,
  });

  useEffect(() => {
    if (query.isSuccess) {
      // Invalidate the auth query to force a refresh of the user state
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      // Short delay to allow the auth state to update
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    }
  }, [query.isSuccess, navigate, queryClient]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-red-500">
              No verification token found in URL. Please check your email link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-red-500">
              {query.error instanceof Error ? query.error.message : "Verification failed"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            {query.isSuccess ? (
              <>
                <p className="text-center text-green-600">Email verified successfully!</p>
                <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
              </>
            ) : (
              <>
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-center">Verifying your email...</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
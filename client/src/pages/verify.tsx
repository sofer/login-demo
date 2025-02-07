import { useEffect } from "react";
import { useLocation, useLocation as useNavigate } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Verify() {
  const [, navigate] = useLocation();
  const [location] = useLocation();

  // Enhanced token extraction with detailed logging
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get("token");
  console.log("Full URL:", window.location.href);
  console.log("Location from wouter:", location);
  console.log("Search params:", window.location.search);
  console.log("Extracted token:", token);

  const query = useQuery({
    queryKey: ["/api/auth/verify", token],
    queryFn: async () => {
      if (!token) {
        throw new Error("No verification token provided");
      }
      try {
        const response = await apiRequest("GET", `/api/auth/verify?token=${token}`);
        const data = await response.json();
        console.log("Verification response:", data);
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
      navigate("/dashboard");
    }
  }, [query.isSuccess, navigate]);

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
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-center">Verifying your email...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { useEffect } from "react";
import { useLocation, useLocation as useNavigate } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function Verify() {
  const [, navigate] = useLocation();
  const [location] = useLocation();
  const token = new URLSearchParams(location.split("?")[1]).get("token");

  const query = useQuery({
    queryKey: ["/api/auth/verify", token],
    enabled: !!token,
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
            <p className="text-center text-red-500">Invalid verification link</p>
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

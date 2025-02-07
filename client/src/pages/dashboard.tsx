import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { DeploymentStatus } from "@/components/ui/deployment-status";

interface AuthResponse {
  email: string;
}

export default function Dashboard() {
  const [, navigate] = useLocation();

  const query = useQuery<AuthResponse>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      navigate("/");
    },
  });

  if (query.isError) {
    navigate("/");
    return null;
  }

  if (query.isLoading || !query.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Welcome!</CardTitle>
            <DeploymentStatus />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-500">
            You're signed in as: <span className="font-medium">{query.data.email}</span>
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {mutation.isPending ? "Signing out..." : "Sign out"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
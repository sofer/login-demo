import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { DeploymentStatus } from "@/components/ui/deployment-status";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();

  // Redirect to login if not authenticated
  if (!user) {
    navigate("/");
    return null;
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
            You're signed in as: <span className="font-medium">{user.email}</span>
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {logoutMutation.isPending ? "Signing out..." : "Sign out"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
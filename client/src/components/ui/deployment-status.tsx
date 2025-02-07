import { useQuery } from "@tanstack/react-query";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function DeploymentStatus() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["/api/health"],
    refetchInterval: 30000, // Check every 30 seconds
  });

  return (
    <div className="flex items-center gap-2">
      <div className="text-sm text-muted-foreground">Deployment Status:</div>
      {isLoading ? (
        <div className="flex items-center gap-1">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Checking...</span>
        </div>
      ) : isError ? (
        <div className="flex items-center gap-1">
          <XCircle className="h-4 w-4 text-destructive" />
          <span className="text-sm text-destructive">Offline</span>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-sm text-green-500">Online</span>
        </div>
      )}
    </div>
  );
}

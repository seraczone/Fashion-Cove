import { Navigate } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { useAdminSession, useCurrentAdmin } from "@/lib/admin/admin-hooks";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const sessionQuery = useAdminSession();
  const adminQuery = useCurrentAdmin(Boolean(sessionQuery.data));

  if (sessionQuery.isLoading || adminQuery.isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/30">
        <div className="text-sm text-muted-foreground">Loading admin workspace...</div>
      </div>
    );
  }

  if (!sessionQuery.data) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!adminQuery.data) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/30 px-4">
        <div className="max-w-md border bg-background p-6 text-center shadow-sm">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-destructive/10 text-destructive">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <h1 className="mt-4 font-display text-2xl">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This account is signed in, but it has not been added to Fashion Cove admin users.
          </p>
        </div>
      </div>
    );
  }

  return children;
}

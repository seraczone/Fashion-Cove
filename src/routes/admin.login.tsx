import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LockKeyhole } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { adminKeys, signInAdmin } from "@/lib/admin/admin-api";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Login - The Fashion Cove" },
      { name: "description", content: "Fashion Cove admin sign in." },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useMutation({
    mutationFn: () => signInAdmin(email, password),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminKeys.session });
      await queryClient.invalidateQueries({ queryKey: adminKeys.profile });
      await navigate({ to: "/admin" });
    },
  });

  return (
    <div className="grid min-h-screen bg-muted/30 px-4 py-10 md:grid-cols-[1fr_1.1fr]">
      <section className="hidden border bg-primary p-10 text-primary-foreground md:flex md:flex-col md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] opacity-80">Fashion Cove</p>
          <h1 className="mt-5 max-w-lg font-display text-5xl leading-tight">
            Commerce operations for products, orders and inventory.
          </h1>
        </div>
        <p className="max-w-md text-sm leading-6 opacity-80">
          Manage the catalog, category structure and customer orders from one secure workspace.
        </p>
      </section>

      <section className="flex items-center justify-center">
        <form
          className="w-full max-w-md border bg-background p-6 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault();
            login.mutate();
          }}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <h2 className="mt-5 font-display text-3xl">Admin sign in</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Use the email and password configured in Supabase Auth for your admin account.
          </p>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Email
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 h-11 w-full border bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Password
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 h-11 w-full border bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </label>
          </div>

          {login.error ? (
            <p className="mt-4 border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {login.error.message}
            </p>
          ) : null}

          <Button type="submit" className="mt-6 w-full" disabled={login.isPending}>
            {login.isPending ? "Signing in..." : "Sign in"}
          </Button>

          <Button asChild variant="link" className="mt-3 w-full">
            <Link to="/">Back to storefront</Link>
          </Button>
        </form>
      </section>
    </div>
  );
}

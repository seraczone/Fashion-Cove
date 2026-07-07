import { Link } from "@tanstack/react-router";
import { BarChart3, Boxes, FileText, LayoutDashboard, LogOut, ReceiptText, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSignOutAdmin } from "@/lib/admin/admin-hooks";
import { adminModules } from "@/lib/admin/admin-modules";
import { cn } from "@/lib/utils";

const coreNav = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", icon: Boxes },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/orders", label: "Orders", icon: ReceiptText },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/reports", label: "Reports", icon: FileText },
] as const;

const moduleNav = adminModules.map((module) => ({
  slug: module.slug,
  label: module.title,
}));

export function AdminShell({ children }: { children: React.ReactNode }) {
  const signOut = useSignOutAdmin();

  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-background lg:flex lg:flex-col">
        <div className="border-b px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-xl leading-none">Fashion Cove</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">Admin</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {coreNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              preload="intent"
              activeOptions={{ exact: item.to === "/admin" }}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              activeProps={{
                className: cn("bg-primary/10 text-primary"),
              }}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          <div className="pt-4">
            <p className="px-3 pb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Modules
            </p>
            {moduleNav.map((item) => (
              <Link
                key={item.slug}
                to="/admin/$module"
                params={{ module: item.slug }}
                preload="intent"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                activeProps={{
                  className: cn("bg-primary/10 text-primary"),
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
        <div className="border-t p-3">
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-start"
            disabled={signOut.isPending}
            onClick={() => signOut.mutate()}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 md:px-8">
            <nav className="flex gap-1 overflow-x-auto lg:hidden">
              {coreNav.map((item) => (
                <Button key={item.to} asChild variant="ghost" size="sm">
                  <Link to={item.to} preload="intent" activeOptions={{ exact: item.to === "/admin" }}>
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              ))}
              {moduleNav.slice(0, 6).map((item) => (
                <Button key={item.slug} asChild variant="ghost" size="sm">
                  <Link to="/admin/$module" params={{ module: item.slug }} preload="intent">
                    {item.label}
                  </Link>
                </Button>
              ))}
            </nav>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="ml-auto"
              disabled={signOut.isPending}
              onClick={() => signOut.mutate()}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </header>
        <main className="px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}

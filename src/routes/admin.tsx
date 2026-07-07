import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { Boxes, CircleDollarSign, ClipboardList, Clock, Tags } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatAdminDate } from "@/lib/admin/admin-api";
import { useOrders, useOverview } from "@/lib/admin/admin-hooks";
import { formatNGN } from "@/lib/shop-data";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Overview - The Fashion Cove" },
      { name: "description", content: "Fashion Cove ecommerce admin overview." },
    ],
  }),
  component: AdminOverview,
});

function AdminOverview() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  if (pathname !== "/admin") {
    return <Outlet />;
  }

  return (
    <AdminGuard>
      <AdminShell>
        <OverviewContent />
      </AdminShell>
    </AdminGuard>
  );
}

function OverviewContent() {
  const overview = useOverview();
  const orders = useOrders();
  const recentOrders = (orders.data ?? []).slice(0, 6);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Command center"
        title="Admin Overview"
        description="Monitor catalog health, order volume, pending fulfillment and paid revenue."
      />

      {overview.isLoading ? (
        <div className="border bg-background p-6 text-sm text-muted-foreground">Loading overview...</div>
      ) : overview.error ? (
        <div className="border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {overview.error.message}
        </div>
      ) : overview.data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard icon={CircleDollarSign} label="Paid revenue" value={formatNGN(overview.data.revenue)} />
          <MetricCard icon={ClipboardList} label="Orders" value={String(overview.data.orderCount)} />
          <MetricCard icon={Clock} label="Pending" value={String(overview.data.pendingOrderCount)} />
          <MetricCard icon={Boxes} label="Active products" value={`${overview.data.activeProductCount}/${overview.data.productCount}`} />
          <MetricCard icon={Tags} label="Categories" value={String(overview.data.categoryCount)} />
        </div>
      ) : null}

      <section className="mt-6 border bg-background">
        <div className="border-b px-5 py-4">
          <h2 className="font-display text-xl">Recent orders</h2>
          <p className="mt-1 text-sm text-muted-foreground">Newest customer activity from Supabase.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-[0.16em] text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-5 py-4 font-medium">{order.order_number}</td>
                  <td className="px-5 py-4">{order.customer_name}</td>
                  <td className="px-5 py-4 capitalize">{order.status}</td>
                  <td className="px-5 py-4">{formatNGN(order.total)}</td>
                  <td className="px-5 py-4 text-muted-foreground">{formatAdminDate(order.created_at)}</td>
                </tr>
              ))}
              {!orders.isLoading && recentOrders.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-center text-muted-foreground" colSpan={5}>
                    No orders have been created yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="border bg-background p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-4 text-2xl font-semibold">{value}</p>
    </div>
  );
}

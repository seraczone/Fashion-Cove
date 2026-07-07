import { createFileRoute } from "@tanstack/react-router";
import { Activity, Boxes, CreditCard, Users } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { asResourceRows, useCustomers, useInventory, useOrders, useProducts } from "@/lib/admin/admin-hooks";
import { formatNGN } from "@/lib/shop-data";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics - Fashion Cove Admin" },
      { name: "description", content: "Fashion Cove analytics dashboard." },
    ],
  }),
  component: AnalyticsRoute,
});

function AnalyticsRoute() {
  return (
    <AdminGuard>
      <AdminShell>
        <AnalyticsPage />
      </AdminShell>
    </AdminGuard>
  );
}

function AnalyticsPage() {
  const orders = useOrders();
  const products = useProducts();
  const customers = useCustomers();
  const inventory = useInventory();

  const orderRows = orders.data ?? [];
  const productRows = products.data ?? [];
  const customerRows = asResourceRows(customers.data);
  const inventoryRows = asResourceRows(inventory.data);
  const paidRevenue = orderRows
    .filter((order) => order.payment_status === "paid" && order.status !== "cancelled")
    .reduce((sum, order) => sum + order.total, 0);
  const averageOrderValue = orderRows.length > 0 ? paidRevenue / orderRows.length : 0;
  const lowStock = inventoryRows.filter((item) => item.status === "low_stock" || item.status === "out_of_stock").length;

  return (
    <div>
      <AdminPageHeader
        eyebrow="Insights"
        title="Analytics"
        description="Live operational metrics calculated from Supabase orders, products, customers and inventory."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon={CreditCard} label="Paid revenue" value={formatNGN(paidRevenue)} />
        <Metric icon={Activity} label="Average order value" value={formatNGN(Math.round(averageOrderValue))} />
        <Metric icon={Boxes} label="Products" value={String(productRows.length)} />
        <Metric icon={Users} label="Customers" value={String(customerRows.length)} />
      </div>
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="border bg-background p-5">
          <h2 className="font-display text-xl">Order status</h2>
          <div className="mt-4 space-y-3 text-sm">
            {["pending", "confirmed", "fulfilled", "cancelled"].map((status) => (
              <StatusRow
                key={status}
                label={status}
                value={orderRows.filter((order) => order.status === status).length}
              />
            ))}
          </div>
        </div>
        <div className="border bg-background p-5">
          <h2 className="font-display text-xl">Inventory risk</h2>
          <p className="mt-4 text-4xl font-semibold">{lowStock}</p>
          <p className="mt-2 text-sm text-muted-foreground">SKUs marked low stock or out of stock.</p>
        </div>
      </section>
    </div>
  );
}

function Metric({
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
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-4 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border-b pb-2 last:border-0">
      <span className="capitalize text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

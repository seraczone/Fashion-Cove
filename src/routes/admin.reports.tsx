import { createFileRoute } from "@tanstack/react-router";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { asResourceRows, useOrders, usePayments, useProducts, useRefunds } from "@/lib/admin/admin-hooks";
import { formatNGN } from "@/lib/shop-data";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [
      { title: "Reports - Fashion Cove Admin" },
      { name: "description", content: "Fashion Cove operational reports." },
    ],
  }),
  component: ReportsRoute,
});

function ReportsRoute() {
  return (
    <AdminGuard>
      <AdminShell>
        <ReportsPage />
      </AdminShell>
    </AdminGuard>
  );
}

function ReportsPage() {
  const orders = useOrders();
  const products = useProducts();
  const payments = usePayments();
  const refunds = useRefunds();

  const orderRows = orders.data ?? [];
  const productRows = products.data ?? [];
  const paymentRows = asResourceRows(payments.data);
  const refundRows = asResourceRows(refunds.data);
  const grossSales = orderRows.reduce((sum, order) => sum + order.total, 0);
  const paidPayments = paymentRows.reduce((sum, payment) => {
    const amount = typeof payment.amount === "number" ? payment.amount : 0;
    return payment.status === "paid" ? sum + amount : sum;
  }, 0);
  const refundTotal = refundRows.reduce((sum, refund) => {
    const amount = typeof refund.amount === "number" ? refund.amount : 0;
    return refund.status === "paid" ? sum + amount : sum;
  }, 0);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Exports"
        title="Reports"
        description="Operational summaries generated from live Supabase records."
      />
      <section className="grid gap-4 lg:grid-cols-3">
        <ReportCard title="Sales Summary" rows={[
          ["Gross order value", formatNGN(grossSales)],
          ["Paid payments", formatNGN(paidPayments)],
          ["Refunded", formatNGN(refundTotal)],
          ["Net", formatNGN(paidPayments - refundTotal)],
        ]} />
        <ReportCard title="Catalog Summary" rows={[
          ["Total products", String(productRows.length)],
          ["Active products", String(productRows.filter((product) => product.status === "active").length)],
          ["Draft products", String(productRows.filter((product) => product.status === "draft").length)],
          ["Archived products", String(productRows.filter((product) => product.status === "archived").length)],
        ]} />
        <ReportCard title="Fulfillment Summary" rows={[
          ["Pending", String(orderRows.filter((order) => order.status === "pending").length)],
          ["Confirmed", String(orderRows.filter((order) => order.status === "confirmed").length)],
          ["Fulfilled", String(orderRows.filter((order) => order.status === "fulfilled").length)],
          ["Cancelled", String(orderRows.filter((order) => order.status === "cancelled").length)],
        ]} />
      </section>
    </div>
  );
}

function ReportCard({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  return (
    <div className="border bg-background p-5">
      <h2 className="font-display text-xl">{title}</h2>
      <div className="mt-4 space-y-3 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 border-b pb-2 last:border-0">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

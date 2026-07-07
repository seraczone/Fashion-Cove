import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Eye, Pencil, Plus, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import {
  adminKeys,
  createOrder,
  deleteOrder,
  formatAdminDate,
  updateOrder,
  type OrderInput,
} from "@/lib/admin/admin-api";
import { useOrderItems, useOrders } from "@/lib/admin/admin-hooks";
import type { OrderRow } from "@/lib/supabase/database.types";
import { formatNGN } from "@/lib/shop-data";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({
    meta: [
      { title: "Orders - Fashion Cove Admin" },
      { name: "description", content: "Manage Fashion Cove customer orders." },
    ],
  }),
  component: OrdersRoute,
});

const emptyOrder: OrderInput = {
  customer_name: "",
  customer_email: null,
  customer_phone: "",
  delivery_address: "",
  status: "pending",
  payment_status: "unpaid",
  subtotal: 0,
  delivery_fee: 0,
  total: 0,
  notes: null,
};

function OrdersRoute() {
  return (
    <AdminGuard>
      <AdminShell>
        <OrdersPage />
      </AdminShell>
    </AdminGuard>
  );
}

function OrdersPage() {
  const queryClient = useQueryClient();
  const orders = useOrders();
  const [editing, setEditing] = useState<OrderRow | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [viewing, setViewing] = useState<OrderRow | null>(null);

  const createMutation = useMutation({
    mutationFn: createOrder,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: adminKeys.orders });
      const previous = queryClient.getQueryData<OrderRow[]>(adminKeys.orders);
      const optimistic: OrderRow = {
        id: `optimistic-${Date.now()}`,
        order_number: "Saving...",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...input,
      };
      queryClient.setQueryData<OrderRow[]>(adminKeys.orders, (current = []) => [optimistic, ...current]);
      return { previous };
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(adminKeys.orders, context?.previous);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: adminKeys.orders });
      await queryClient.invalidateQueries({ queryKey: adminKeys.overview });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: OrderInput }) => updateOrder(id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: adminKeys.orders });
      const previous = queryClient.getQueryData<OrderRow[]>(adminKeys.orders);
      queryClient.setQueryData<OrderRow[]>(adminKeys.orders, (current = []) =>
        current.map((order) =>
          order.id === id ? { ...order, ...input, updated_at: new Date().toISOString() } : order,
        ),
      );
      return { previous };
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(adminKeys.orders, context?.previous);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: adminKeys.orders });
      await queryClient.invalidateQueries({ queryKey: adminKeys.overview });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: adminKeys.orders });
      const previous = queryClient.getQueryData<OrderRow[]>(adminKeys.orders);
      queryClient.setQueryData<OrderRow[]>(adminKeys.orders, (current = []) =>
        current.filter((order) => order.id !== id),
      );
      return { previous };
    },
    onError: (_error, _id, context) => {
      queryClient.setQueryData(adminKeys.orders, context?.previous);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: adminKeys.orders });
      await queryClient.invalidateQueries({ queryKey: adminKeys.overview });
    },
  });

  const error = orders.error ?? createMutation.error ?? updateMutation.error ?? deleteMutation.error;

  return (
    <div>
      <AdminPageHeader
        eyebrow="Operations"
        title="Orders"
        description="Track customer orders, payment state, fulfillment progress and delivery details."
        actions={
          <Button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            New order
          </Button>
        }
      />

      {error ? (
        <div className="mb-4 border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error.message}
        </div>
      ) : null}

      {formOpen ? (
        <OrderForm
          order={editing}
          isSaving={createMutation.isPending || updateMutation.isPending}
          onCancel={() => {
            setEditing(null);
            setFormOpen(false);
          }}
          onSubmit={(input) => {
            if (editing) updateMutation.mutate({ id: editing.id, input });
            else createMutation.mutate(input);
            setEditing(null);
            setFormOpen(false);
          }}
        />
      ) : null}

      {viewing ? <OrderDetails order={viewing} onClose={() => setViewing(null)} /> : null}

      <section className="border bg-background">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-[0.16em] text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Payment</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Created</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(orders.data ?? []).map((order) => (
                <tr key={order.id}>
                  <td className="px-5 py-4 font-medium">{order.order_number}</td>
                  <td className="px-5 py-4">
                    <p>{order.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                  </td>
                  <td className="px-5 py-4 capitalize">{order.status}</td>
                  <td className="px-5 py-4 capitalize">{order.payment_status}</td>
                  <td className="px-5 py-4">{formatNGN(order.total)}</td>
                  <td className="px-5 py-4 text-muted-foreground">{formatAdminDate(order.created_at)}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setViewing(order)}>
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditing(order);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`Delete ${order.order_number}?`)) deleteMutation.mutate(order.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!orders.isLoading && (orders.data ?? []).length === 0 ? (
                <tr>
                  <td className="px-5 py-12 text-center text-muted-foreground" colSpan={7}>
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

function OrderDetails({ order, onClose }: { order: OrderRow; onClose: () => void }) {
  const items = useOrderItems(order.id);

  return (
    <section className="mb-6 border bg-background p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl">{order.order_number}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {order.customer_name} - {order.customer_phone}
          </p>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <InfoBlock label="Delivery address" value={order.delivery_address} />
        <InfoBlock label="Status" value={order.status} />
        <InfoBlock label="Payment" value={order.payment_status} />
      </div>
      <div className="mt-5 border">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium">Qty</th>
              <th className="px-4 py-3 font-medium">Unit</th>
              <th className="px-4 py-3 font-medium">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(items.data ?? []).map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">{item.product_name}</td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3">{formatNGN(item.unit_price)}</td>
                <td className="px-4 py-3">{formatNGN(item.subtotal)}</td>
              </tr>
            ))}
            {!items.isLoading && (items.data ?? []).length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-muted-foreground" colSpan={4}>
                  No item rows are attached to this order.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function OrderForm({
  order,
  isSaving,
  onCancel,
  onSubmit,
}: {
  order: OrderRow | null;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (input: OrderInput) => void;
}) {
  const initial = useMemo<OrderInput>(() => {
    if (!order) return emptyOrder;
    return {
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      delivery_address: order.delivery_address,
      status: order.status,
      payment_status: order.payment_status,
      subtotal: order.subtotal,
      delivery_fee: order.delivery_fee,
      total: order.total,
      notes: order.notes,
    };
  }, [order]);
  const [form, setForm] = useState<OrderInput>(initial);

  return (
    <form
      className="mb-6 border bg-background p-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          ...form,
          customer_name: form.customer_name.trim(),
          customer_email: form.customer_email?.trim() ? form.customer_email.trim() : null,
          customer_phone: form.customer_phone.trim(),
          delivery_address: form.delivery_address.trim(),
          notes: form.notes?.trim() ? form.notes.trim() : null,
          total: form.subtotal + form.delivery_fee,
        });
      }}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl">{order ? "Edit order" : "New order"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Order records are saved directly to Supabase.</p>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <TextField label="Customer name" value={form.customer_name} required onChange={(value) => setForm({ ...form, customer_name: value })} />
        <TextField label="Phone" value={form.customer_phone} required onChange={(value) => setForm({ ...form, customer_phone: value })} />
        <TextField label="Email" value={form.customer_email ?? ""} onChange={(value) => setForm({ ...form, customer_email: value })} />
        <SelectField
          label="Order status"
          value={form.status}
          options={["pending", "confirmed", "fulfilled", "cancelled"]}
          onChange={(value) => setForm({ ...form, status: value as OrderRow["status"] })}
        />
        <SelectField
          label="Payment status"
          value={form.payment_status}
          options={["unpaid", "paid", "refunded"]}
          onChange={(value) => setForm({ ...form, payment_status: value as OrderRow["payment_status"] })}
        />
        <NumberField label="Subtotal" value={form.subtotal} onChange={(value) => setForm({ ...form, subtotal: value, total: value + form.delivery_fee })} />
        <NumberField label="Delivery fee" value={form.delivery_fee} onChange={(value) => setForm({ ...form, delivery_fee: value, total: form.subtotal + value })} />
        <NumberField label="Total" value={form.total} onChange={(value) => setForm({ ...form, total: value })} />
        <label className="md:col-span-2 xl:col-span-3">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Delivery address</span>
          <textarea
            required
            value={form.delivery_address}
            onChange={(event) => setForm({ ...form, delivery_address: event.target.value })}
            className="mt-2 min-h-24 w-full border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="md:col-span-2 xl:col-span-3">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Notes</span>
          <textarea
            value={form.notes ?? ""}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
            className="mt-2 min-h-20 w-full border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save order"}</Button>
      </div>
    </form>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="border bg-muted/30 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm capitalize">{value}</p>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label>
      <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <input
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full border bg-background px-3 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label>
      <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 h-10 w-full border bg-background px-3 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full border bg-background px-3 text-sm capitalize outline-none focus:border-primary"
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle, Check } from "lucide-react";
import { useCart, useCartDetails } from "@/lib/cart-store";
import { formatNGN, whatsappLink } from "@/lib/shop-data";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — The Fashion Cove" },
      { name: "description", content: "Complete your order via WhatsApp." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, total } = useCartDetails();
  const clear = useCart((s) => s.clear);
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  if (items.length === 0 && !submitted) {
    return (
      <div className="container-luxe py-24 text-center">
        <h1 className="font-display text-3xl">Your cart is empty</h1>
        <Link to="/shop" className="mt-6 inline-block text-primary underline">Continue shopping</Link>
      </div>
    );
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const lines = items.map((i) => `• ${i.product.name} × ${i.qty} — ${formatNGN(i.subtotal)}`).join("\n");
    const msg = `Hello The Fashion Cove! I'd like to place an order:\n\n${lines}\n\nTotal: ${formatNGN(total)}\n\nName: ${f.get("name")}\nPhone: ${f.get("phone")}\nEmail: ${f.get("email")}\nAddress: ${f.get("address")}\n\nPlease confirm availability and delivery cost.`;
    window.open(whatsappLink(msg), "_blank", "noopener");
    clear();
    setSubmitted(true);
    setTimeout(() => navigate({ to: "/" }), 2500);
  };

  if (submitted) {
    return (
      <div className="container-luxe py-24 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
          <Check className="h-7 w-7" />
        </div>
        <h1 className="font-display text-3xl mt-6">Order sent</h1>
        <p className="mt-3 text-muted-foreground">We've opened WhatsApp with your order details. Our team will confirm shortly.</p>
        <Link to="/" className="mt-8 inline-block text-primary underline">Back to home</Link>
      </div>
    );
  }

  return (
    <div className="container-luxe py-12 md:py-16">
      <h1 className="font-display text-3xl md:text-4xl">Checkout</h1>
      <div className="gold-underline mt-3" />
      <p className="mt-4 text-muted-foreground max-w-xl">
        Fill in your details and we'll confirm your order, delivery and payment via WhatsApp.
      </p>

      <div className="mt-10 grid lg:grid-cols-[1.4fr_1fr] gap-10">
        <form onSubmit={onSubmit} className="space-y-5">
          <Field label="Full name" name="name" required />
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Phone" name="phone" type="tel" required />
            <Field label="Email" name="email" type="email" required />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-2">Delivery address</label>
            <textarea
              name="address"
              required
              rows={3}
              className="w-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 text-sm uppercase tracking-[0.18em] hover:bg-primary/90">
            <MessageCircle className="h-4 w-4" /> Place order via WhatsApp
          </button>
          <p className="text-xs text-muted-foreground">
            By placing your order you agree to be contacted on WhatsApp to confirm payment and delivery.
          </p>
        </form>

        <aside className="bg-secondary p-6 h-fit">
          <h2 className="font-display text-xl">Order summary</h2>
          <div className="gold-underline mt-3" />
          <ul className="mt-5 space-y-3 text-sm">
            {items.map(({ product, qty, subtotal }) => (
              <li key={product.id} className="flex justify-between gap-3">
                <span className="text-foreground/80">{product.name} <span className="text-muted-foreground">× {qty}</span></span>
                <span className="shrink-0">{formatNGN(subtotal)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 pt-5 border-t border-border flex justify-between items-baseline">
            <span className="text-sm uppercase tracking-[0.18em]">Total</span>
            <span className="font-display text-2xl">{formatNGN(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, name, type = "text", required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-2">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary"
      />
    </div>
  );
}

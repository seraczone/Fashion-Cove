import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart, useCartDetails } from "@/lib/cart-store";
import { formatNGN } from "@/lib/shop-data";
import { getStorefrontCatalog, storefrontKeys } from "@/lib/storefront-api";

export const Route = createFileRoute("/cart")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData({
      queryKey: storefrontKeys.catalog,
      queryFn: getStorefrontCatalog,
    }),
  head: () => ({
    meta: [
      { title: "Your Cart — The Fashion Cove" },
      { name: "description", content: "Review your selected items and check out." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { products } = Route.useLoaderData();
  const { items, total } = useCartDetails(products);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  if (items.length === 0) {
    return (
      <div className="container-luxe py-24 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
          <ShoppingBag className="h-7 w-7 text-primary" />
        </div>
        <h1 className="font-display text-3xl mt-6">Your cart is empty</h1>
        <p className="mt-3 text-muted-foreground">Discover something beautiful to begin.</p>
        <Link to="/shop" className="mt-8 inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 text-sm uppercase tracking-[0.18em] hover:bg-primary/90">
          Shop now <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-luxe py-12 md:py-16">
      <h1 className="font-display text-3xl md:text-4xl">Your cart</h1>
      <div className="gold-underline mt-3" />

      <div className="mt-10 grid lg:grid-cols-[1.6fr_1fr] gap-10">
        <ul className="divide-y divide-border border-y border-border">
          {items.map(({ product, qty, subtotal }) => (
            <li key={product.id} className="py-6 flex gap-5">
              <Link to="/product/$id" params={{ id: product.id }} className="shrink-0 w-24 sm:w-28 aspect-[4/5] bg-secondary overflow-hidden">
                <img src={product.image} alt={product.name} loading="lazy" decoding="async" className="size-full object-cover" />
              </Link>
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between gap-4">
                  <div>
                    <Link to="/product/$id" params={{ id: product.id }} className="font-display text-lg hover:text-primary">
                      {product.name}
                    </Link>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mt-1">{product.category.replace("-", " ")}</p>
                  </div>
                  <p className="text-sm text-foreground">{formatNGN(subtotal)}</p>
                </div>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <div className="inline-flex items-center border border-border">
                    <button onClick={() => setQty(product.id, qty - 1)} className="px-3 py-2 hover:bg-secondary">−</button>
                    <span className="px-4 min-w-8 text-center text-sm">{qty}</span>
                    <button onClick={() => setQty(product.id, qty + 1)} className="px-3 py-2 hover:bg-secondary">+</button>
                  </div>
                  <button onClick={() => remove(product.id)} className="text-muted-foreground hover:text-destructive inline-flex items-center gap-1 text-sm">
                    <Trash2 className="h-4 w-4" /> Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="bg-secondary p-6 h-fit">
          <h2 className="font-display text-xl">Order summary</h2>
          <div className="gold-underline mt-3" />
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatNGN(total)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Delivery</dt><dd>Calculated at checkout</dd></div>
          </dl>
          <div className="mt-5 pt-5 border-t border-border flex justify-between items-baseline">
            <span className="text-sm uppercase tracking-[0.18em]">Total</span>
            <span className="font-display text-2xl">{formatNGN(total)}</span>
          </div>
          <Link to="/checkout" className="mt-6 w-full inline-flex justify-center items-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 text-sm uppercase tracking-[0.18em] hover:bg-primary/90">
            Checkout <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/shop" className="mt-3 w-full inline-flex justify-center text-sm text-foreground/70 hover:text-primary">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}

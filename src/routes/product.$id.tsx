import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ShoppingBag, MessageCircle, Check, ArrowLeft } from "lucide-react";
import { findProduct, formatNGN, categoryName, products, whatsappLink } from "@/lib/shop-data";
import { useCart } from "@/lib/cart-store";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const p = findProduct(params.id);
    if (!p) throw notFound();
    return { product: p };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    return {
      meta: [
        { title: p ? `${p.name} — The Fashion Cove` : "Product — The Fashion Cove" },
        { name: "description", content: p?.description ?? "" },
        { property: "og:title", content: p?.name ?? "" },
        { property: "og:description", content: p?.description ?? "" },
        { property: "og:image", content: p?.image ?? "" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="container-luxe py-32 text-center">
      <h1 className="font-display text-4xl">Product not found</h1>
      <Link to="/shop" className="mt-6 inline-block text-primary underline">Back to shop</Link>
    </div>
  ),
  errorComponent: () => (
    <div className="container-luxe py-32 text-center">
      <h1 className="font-display text-4xl">Something went wrong</h1>
      <Link to="/shop" className="mt-6 inline-block text-primary underline">Back to shop</Link>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleAdd = () => {
    add(product.id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const waMessage = `Hello The Fashion Cove! I'd like to order:\n\n• ${product.name}\n• Qty: ${qty}\n• Price: ${formatNGN(product.price * qty)}\n\nIs this available?`;

  return (
    <div className="container-luxe py-10 md:py-14">
      <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to shop
      </Link>

      <div className="mt-8 grid md:grid-cols-2 gap-10 lg:gap-16">
        <div className="space-y-3">
          <div className="aspect-[4/5] bg-secondary overflow-hidden">
            <img src={product.image} alt={product.name} width={800} height={1000} className="size-full object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="aspect-square bg-secondary overflow-hidden">
                <img src={product.image} alt="" loading="lazy" className="size-full object-cover opacity-90 hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-primary">{categoryName(product.category)}</p>
          <h1 className="font-display text-3xl md:text-4xl mt-3">{product.name}</h1>
          <div className="gold-underline mt-4" />
          <p className="mt-5 text-2xl">{formatNGN(product.price)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {product.inStock ? <span className="text-primary">● In stock</span> : <span>Out of stock</span>}
          </p>

          <p className="mt-6 leading-relaxed text-foreground/80">{product.description}</p>

          <div className="mt-8 flex items-center gap-4">
            <div className="inline-flex items-center border border-border">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 py-3 hover:bg-secondary">−</button>
              <span className="px-5 min-w-10 text-center">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="px-4 py-3 hover:bg-secondary">+</button>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAdd}
              disabled={!product.inStock}
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 text-sm uppercase tracking-[0.18em] hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {added ? <><Check className="h-4 w-4" /> Added</> : <><ShoppingBag className="h-4 w-4" /> Add to cart</>}
            </button>
            <a
              href={whatsappLink(waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-foreground/20 px-7 py-3.5 text-sm uppercase tracking-[0.18em] hover:border-primary hover:text-primary transition-colors"
            >
              <MessageCircle className="h-4 w-4" /> Order on WhatsApp
            </a>
          </div>

          <div className="mt-10 pt-6 border-t border-border text-sm text-muted-foreground space-y-2">
            <p>• Hand-checked before dispatch.</p>
            <p>• Delivery available nationwide.</p>
            <p>• Questions? WhatsApp us — we reply fast.</p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="font-display text-2xl md:text-3xl">You may also like</h2>
          <div className="gold-underline mt-3" />
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}

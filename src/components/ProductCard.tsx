import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { type Product, formatNGN, categoryName } from "@/lib/shop-data";
import { useCart } from "@/lib/cart-store";

export function ProductCard({
  product,
  index = 0,
  showAddToCart = false,
}: {
  product: Product;
  index?: number;
  showAddToCart?: boolean;
}) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);
  const entryAngles = [
    { x: -28, y: 20, rotate: -1.8 },
    { x: 26, y: 18, rotate: 1.6 },
    { x: -18, y: -18, rotate: 1.2 },
    { x: 18, y: -20, rotate: -1.4 },
    { x: 0, y: 28, rotate: 0.8 },
    { x: 0, y: -24, rotate: -0.8 },
  ];
  const entry = entryAngles[index % entryAngles.length];

  const handleAdd = () => {
    add(product.id, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: entry.x, y: entry.y, rotate: entry.rotate }}
      whileInView={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.58, delay: (index % 6) * 0.05, ease: "easeOut" }}
    >
      <div className="group">
        <Link to="/product/$id" params={{ id: product.id }} className="block">
          <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              width={800}
              height={1000}
              className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {product.newArrival && (
              <span className="absolute top-3 left-3 bg-background/95 text-foreground text-[10px] uppercase tracking-[0.18em] px-2.5 py-1">
                New
              </span>
            )}
            {!product.inStock && (
              <span className="absolute top-3 right-3 bg-foreground text-background text-[10px] uppercase tracking-[0.18em] px-2.5 py-1">
                Sold out
              </span>
            )}
          </div>
        </Link>
        <div className="pt-4 space-y-1">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {categoryName(product.category)}
          </p>
          <Link to="/product/$id" params={{ id: product.id }} className="block">
            <h3 className="font-display text-lg leading-tight group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-sm text-foreground/80">{formatNGN(product.price)}</p>
        </div>
        {showAddToCart && (
          <button
            type="button"
            onClick={handleAdd}
            disabled={!product.inStock}
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 bg-primary px-4 text-xs uppercase tracking-[0.16em] text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
            {added ? "Added" : "Add to cart"}
          </button>
        )}
      </div>
    </motion.div>
  );
}

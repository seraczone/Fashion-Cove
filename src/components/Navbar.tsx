import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, ShoppingBag } from "lucide-react";
import brandLogo from "@/assets/brand-logo.png";
import { BRAND } from "@/lib/shop-data";
import { useCartDetails } from "@/lib/cart-store";

const nav = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/categories", label: "Categories" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { count } = useCartDetails();

  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-md border-b border-border">
      <div className="container-luxe flex items-center justify-between h-20 md:h-24">
        <Link to="/" className="flex items-center" onClick={() => setOpen(false)}>
          <img
            src={brandLogo}
            alt={BRAND}
            className="h-16 w-auto md:h-20"
            width={1024}
            height={1024}
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="text-sm tracking-wide text-foreground/80 hover:text-primary transition-colors"
              activeProps={{ className: "text-primary" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            aria-label="View cart"
            className="relative inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-accent transition-colors"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-[11px] font-medium flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          <button
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-accent"
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container-luxe py-4 flex flex-col gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: n.to === "/" }}
                className="py-3 text-base text-foreground/80"
                activeProps={{ className: "text-primary" }}
              >
                {n.label}
              </Link>
            ))}
            <span className="sr-only">{BRAND}</span>
          </nav>
        </div>
      )}
    </header>
  );
}

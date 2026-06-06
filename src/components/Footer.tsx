import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Mail, MapPin, Phone } from "lucide-react";
import { BRAND, CONTACT_EMAIL, PHONE_DISPLAY, STORE_ADDRESS } from "@/lib/shop-data";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/60">
      <div className="container-luxe py-16 grid gap-12 md:grid-cols-4">
        <div>
          <h3 className="font-display text-2xl">The Fashion Cove</h3>
          <div className="gold-underline mt-3" />
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            A curated atelier of premium fabrics, intimates, accessories and signature scents — for the woman who chooses well.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-medium uppercase tracking-[0.18em] text-foreground/80">Shop</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/shop" className="hover:text-primary">All Products</Link></li>
            <li><Link to="/categories" className="hover:text-primary">Categories</Link></li>
            <li><Link to="/shop" search={{ filter: "new" } as never} className="hover:text-primary">New Arrivals</Link></li>
            <li><Link to="/shop" search={{ filter: "best" } as never} className="hover:text-primary">Best Sellers</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-medium uppercase tracking-[0.18em] text-foreground/80">Company</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-primary">About</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-medium uppercase tracking-[0.18em] text-foreground/80">Reach Us</h4>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" />{PHONE_DISPLAY}</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" />{CONTACT_EMAIL}</li>
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{STORE_ADDRESS}</li>
          </ul>
          <div className="mt-5 flex gap-3">
            <a href="https://instagram.com" aria-label="Instagram" className="h-9 w-9 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"><Instagram className="h-4 w-4" /></a>
            <a href="https://facebook.com" aria-label="Facebook" className="h-9 w-9 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"><Facebook className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-luxe py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} {BRAND}. All rights reserved.</span>
          <span>Crafted with care.</span>
        </div>
      </div>
    </footer>
  );
}

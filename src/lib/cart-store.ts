import { create } from "zustand";
import { persist } from "zustand/middleware";
import { findProduct, products, type Product } from "./shop-data";

export interface CartItem {
  productId: string;
  qty: number;
}

interface CartState {
  items: CartItem[];
  add: (productId: string, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (productId, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.productId === productId);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.productId === productId ? { ...i, qty: i.qty + qty } : i,
              ),
            };
          }
          return { items: [...s.items, { productId, qty }] };
        }),
      remove: (productId) =>
        set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
      setQty: (productId, qty) =>
        set((s) => ({
          items: s.items
            .map((i) => (i.productId === productId ? { ...i, qty } : i))
            .filter((i) => i.qty > 0),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "tfc-cart" },
  ),
);

export function useCartDetails(source: Product[] = products) {
  const items = useCart((s) => s.items);
  const detailed = items
    .map((i) => {
      const p = findProduct(i.productId, source);
      return p ? { product: p, qty: i.qty, subtotal: p.price * i.qty } : null;
    })
    .filter((x): x is { product: NonNullable<ReturnType<typeof findProduct>>; qty: number; subtotal: number } => x !== null);
  const total = detailed.reduce((sum, x) => sum + x.subtotal, 0);
  const count = detailed.reduce((sum, x) => sum + x.qty, 0);
  return { items: detailed, total, count };
}

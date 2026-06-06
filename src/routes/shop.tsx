import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { categories, products, type CategorySlug } from "@/lib/shop-data";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";

type SortKey = "latest" | "asc" | "desc";
type FilterKey = "all" | "new" | "best";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — The Fashion Cove" },
      { name: "description", content: "Browse fabrics, intimates, bags, shoes, veils and perfumes." },
      { property: "og:title", content: "Shop — The Fashion Cove" },
      { property: "og:description", content: "Browse our curated collection." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<CategorySlug | "all">("all");
  const [sort, setSort] = useState<SortKey>("latest");
  const [filter, setFilter] = useState<FilterKey>("all");

  const list = useMemo(() => {
    let res = products.slice();
    if (cat !== "all") res = res.filter((p) => p.category === cat);
    if (filter === "new") res = res.filter((p) => p.newArrival);
    if (filter === "best") res = res.filter((p) => p.bestseller);
    if (q.trim()) {
      const term = q.toLowerCase();
      res = res.filter((p) => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term));
    }
    if (sort === "asc") res.sort((a, b) => a.price - b.price);
    else if (sort === "desc") res.sort((a, b) => b.price - a.price);
    return res;
  }, [q, cat, sort, filter]);

  return (
    <div className="container-luxe py-12 md:py-16">
      <SectionHeading eyebrow="Our edit" title="The Shop" subtitle="Use the filters to narrow your search, or browse the full collection." />

      <div className="mt-10 grid lg:grid-cols-[260px_1fr] gap-10">
        {/* Sidebar */}
        <aside className="space-y-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              className="w-full pl-10 pr-3 py-2.5 border border-border bg-background text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <h4 className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Category</h4>
            <ul className="mt-3 space-y-1.5">
              {(["all", ...categories.map((c) => c.slug)] as Array<CategorySlug | "all">).map((c) => (
                <li key={c}>
                  <button
                    onClick={() => setCat(c)}
                    className={`text-sm py-1 ${cat === c ? "text-primary font-medium" : "text-foreground/80 hover:text-primary"}`}
                  >
                    {c === "all" ? "All Products" : categories.find((x) => x.slug === c)?.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Highlight</h4>
            <ul className="mt-3 space-y-1.5">
              {([
                ["all", "All"],
                ["new", "New Arrivals"],
                ["best", "Best Sellers"],
              ] as const).map(([k, l]) => (
                <li key={k}>
                  <button
                    onClick={() => setFilter(k)}
                    className={`text-sm py-1 ${filter === k ? "text-primary font-medium" : "text-foreground/80 hover:text-primary"}`}
                  >
                    {l}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Grid */}
        <div>
          <div className="flex items-center justify-between mb-6 text-sm text-muted-foreground">
            <span>{list.length} {list.length === 1 ? "item" : "items"}</span>
            <label className="flex items-center gap-2">
              Sort
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="border border-border bg-background py-1.5 px-2 focus:outline-none focus:border-primary"
              >
                <option value="latest">Latest</option>
                <option value="asc">Price: Low to High</option>
                <option value="desc">Price: High to Low</option>
              </select>
            </label>
          </div>

          {list.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              No products match your filters.{" "}
              <Link to="/shop" onClick={() => { setQ(""); setCat("all"); setFilter("all"); }} className="text-primary underline">
                Reset
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {list.map((p, i) => <ProductCard key={p.id} product={p} index={i} showAddToCart />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

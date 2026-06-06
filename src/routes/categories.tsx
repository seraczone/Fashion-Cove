import { createFileRoute, Link } from "@tanstack/react-router";
import { categories } from "@/lib/shop-data";
import { SectionHeading } from "@/components/SectionHeading";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Collections — The Fashion Cove" },
      { name: "description", content: "Explore atamfa, lace, intimates, bags, shoes, veils and perfumes." },
      { property: "og:title", content: "Collections — The Fashion Cove" },
      { property: "og:description", content: "Browse all collections." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  return (
    <div className="container-luxe py-12 md:py-16">
      <SectionHeading eyebrow="Collections" title="Browse by category" subtitle="Seven worlds, one atelier. Step into yours." />
      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {categories.map((c) => (
          <Link key={c.slug} to="/category/$slug" params={{ slug: c.slug }} className="group block">
            <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
              <img src={c.image} alt={c.name} loading="lazy" width={800} height={1000} className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-background">
                <p className="font-display text-2xl">{c.name}</p>
                <p className="text-sm mt-1 opacity-90">{c.blurb}</p>
                <span className="mt-3 inline-block text-xs uppercase tracking-[0.22em] border-b border-[color:var(--gold)] pb-0.5">
                  Shop {c.name}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

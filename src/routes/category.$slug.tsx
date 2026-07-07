import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ProductCard } from "@/components/ProductCard";
import { ArrowLeft } from "lucide-react";
import { getStorefrontCategory } from "@/lib/storefront-api";

export const Route = createFileRoute("/category/$slug")({
  loader: async ({ params }) => {
    const data = await getStorefrontCategory(params.slug);
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    const c = loaderData?.category;
    return {
      meta: [
        { title: c ? `${c.name} — The Fashion Cove` : "Category — The Fashion Cove" },
        { name: "description", content: c?.blurb ?? "" },
        { property: "og:title", content: c?.name ?? "" },
        { property: "og:description", content: c?.blurb ?? "" },
        { property: "og:image", content: c?.image ?? "" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="container-luxe py-32 text-center">
      <h1 className="font-display text-4xl">Category not found</h1>
      <Link to="/categories" className="mt-6 inline-block text-primary underline">All categories</Link>
    </div>
  ),
  errorComponent: () => (
    <div className="container-luxe py-32 text-center">
      <h1 className="font-display text-4xl">Something went wrong</h1>
      <Link to="/categories" className="mt-6 inline-block text-primary underline">All categories</Link>
    </div>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { category, products } = Route.useLoaderData();
  return (
    <div>
      <section className="bg-secondary">
        <div className="container-luxe py-14 md:py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <Link to="/categories" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-4 w-4" /> All collections
            </Link>
            <p className="text-[11px] uppercase tracking-[0.28em] text-primary mt-6">Collection</p>
            <h1 className="font-display text-4xl md:text-5xl mt-3">{category.name}</h1>
            <div className="gold-underline mt-4" />
            <p className="mt-5 text-muted-foreground max-w-md">{category.blurb}</p>
          </div>
          <div className="aspect-[4/3] overflow-hidden">
            <img src={category.image} alt={category.name} width={800} height={600} decoding="async" fetchPriority="high" className="size-full object-cover" />
          </div>
        </div>
      </section>

      <section className="container-luxe py-14">
        {products.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">No products yet — check back soon.</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {products.map((p: typeof products[number], i: number) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </section>
    </div>
  );
}

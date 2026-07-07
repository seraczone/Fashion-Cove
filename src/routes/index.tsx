import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, Truck, ShieldCheck, Gem, Instagram } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import productVideo01 from "@/assets/videos/product-video-01.mp4";
import productVideo02 from "@/assets/videos/product-video-02.mp4";
import productVideo03 from "@/assets/videos/product-video-03.mp4";
import productVideo04 from "@/assets/videos/product-video-04.mp4";
import type { Product } from "@/lib/shop-data";
import { getStorefrontHome, storefrontKeys } from "@/lib/storefront-api";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";

export const Route = createFileRoute("/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData({
      queryKey: storefrontKeys.homepage,
      queryFn: getStorefrontHome,
    }),
  head: () => ({
    meta: [
      { title: "The Fashion Cove — Premium Fabrics, Bags, Shoes & Scents" },
      { name: "description", content: "Atamfa, lace, intimates, bags, shoes, veils and signature perfumes. Curated for the woman who chooses well." },
      { property: "og:title", content: "The Fashion Cove" },
      { property: "og:description", content: "A curated atelier of premium fashion." },
      { property: "og:image", content: heroImg },
    ],
  }),
  component: Home,
});

function categoryBalancedProducts(products: Product[], categories: { slug: string }[], limit: number, highlight: "newArrival" | "bestseller") {
  const selected: Product[] = [];
  const selectedIds = new Set<string>();

  for (const category of categories) {
    const highlighted = products.find((p) => p.category === category.slug && p[highlight]);
    const fallback = products.find((p) => p.category === category.slug);
    const product = highlighted ?? fallback;

    if (product && !selectedIds.has(product.id)) {
      selected.push(product);
      selectedIds.add(product.id);
    }
  }

  for (const product of products) {
    if (selected.length >= limit) break;
    if (product[highlight] && !selectedIds.has(product.id)) {
      selected.push(product);
      selectedIds.add(product.id);
    }
  }

  for (const product of products) {
    if (selected.length >= limit) break;
    if (!selectedIds.has(product.id)) {
      selected.push(product);
      selectedIds.add(product.id);
    }
  }

  return selected.slice(0, limit);
}

function Home() {
  const { catalog, content } = Route.useLoaderData();
  const { categories, products } = catalog;
  const newArrivals = categoryBalancedProducts(products, categories, 8, "newArrival");
  const bestSellers = categoryBalancedProducts(products, categories, 12, "bestseller");
  const firstPerfume = products.find((product) => product.category === "perfumes")?.image;
  const firstBag = products.find((product) => product.category === "bags")?.image;
  const heroSlides = [
    content.hero.imageUrl ? { image: content.hero.imageUrl, alt: content.hero.title } : null,
    { image: heroImg, alt: "Model wearing a flowing atamfa gown" },
    firstPerfume ? { image: firstPerfume, alt: "Assorted perfume and body mist products" } : null,
    firstBag ? { image: firstBag, alt: "Curated handbag collection" } : null,
  ].filter((slide): slide is { image: string; alt: string } => Boolean(slide));
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    setHeroIndex(Math.floor(Math.random() * heroSlides.length));
    const timer = window.setInterval(() => {
      setHeroIndex((current) => {
        if (heroSlides.length < 2) return current;
        let next = Math.floor(Math.random() * heroSlides.length);
        while (next === current) next = Math.floor(Math.random() * heroSlides.length);
        return next;
      });
    }, 6200);

    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[620px] overflow-hidden bg-foreground text-background">
        <AnimatePresence mode="wait">
          <motion.img
            key={heroSlides[heroIndex].image}
            src={heroSlides[heroIndex].image}
            alt={heroSlides[heroIndex].alt}
            aria-hidden="true"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="absolute inset-0 size-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/62 to-foreground/18" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/48 via-transparent to-transparent" />
        <div className="container-luxe relative flex min-h-[620px] items-center py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">{content.hero.eyebrow}</p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-[1.05] mt-5 text-background">
              {content.hero.title}
              <br />
              <span className="italic text-[color:var(--gold)]">{content.hero.highlight}</span>
            </h1>
            <div className="gold-underline mt-6" />
            <p className="mt-6 text-base md:text-lg text-background/86 max-w-md leading-relaxed">
              {content.hero.body}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-[color:var(--gold)] text-foreground px-7 py-3.5 text-sm uppercase tracking-[0.18em] hover:bg-[color:var(--gold)]/90 transition-colors"
              >
                {content.hero.primaryLabel} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/categories"
                className="inline-flex items-center gap-2 border border-background/45 text-background px-7 py-3.5 text-sm uppercase tracking-[0.18em] hover:border-[color:var(--gold)] hover:text-[color:var(--gold)] transition-colors"
              >
                {content.hero.secondaryLabel}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURED CATEGORIES */}
      <section className="container-luxe py-20 md:py-28">
        <SectionHeading eyebrow={content.collections.eyebrow} title={content.collections.title} subtitle={content.collections.subtitle} />
        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {categories.map((c, i) => (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.06 }}
            >
              <Link to="/category/$slug" params={{ slug: c.slug }} className="group block">
                <div className="relative aspect-square overflow-hidden bg-secondary">
                  <img src={c.image} alt={c.name} loading="lazy" decoding="async" width={800} height={800} className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent opacity-90" />
                  <div className="absolute bottom-4 left-4 right-4 text-background">
                    <p className="font-display text-xl">{c.name}</p>
                    <p className="text-xs opacity-90 mt-0.5">{c.blurb}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="container-luxe py-16">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <SectionHeading eyebrow={content.newArrivals.eyebrow} title={content.newArrivals.title} align="left" />
          <Link to="/shop" className="text-sm text-primary inline-flex items-center gap-1 hover:gap-2 transition-all">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {newArrivals.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="container-luxe py-16">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <SectionHeading eyebrow={content.bestSellers.eyebrow} title={content.bestSellers.title} align="left" />
          <Link to="/shop" className="text-sm text-primary inline-flex items-center gap-1 hover:gap-2 transition-all">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {bestSellers.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      {/* WHY US */}
      <section className="bg-secondary mt-20 py-20">
        <div className="container-luxe">
          <SectionHeading eyebrow={content.promise.eyebrow} title={content.promise.title} />
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {content.promise.items.map(({ title, body }, index) => {
              const Icon = [Gem, Sparkles, Truck, ShieldCheck][index % 4];
              return (
                <div key={title} className="text-center">
                  <div className="mx-auto h-14 w-14 rounded-full border border-[color:var(--gold)] flex items-center justify-center text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-xl mt-5">{title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRODUCT VIDEOS */}
      <section className="container-luxe py-20 md:py-24">
        <SectionHeading eyebrow={content.videos.eyebrow} title={content.videos.title} subtitle={content.videos.subtitle} />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { src: productVideo01, title: content.videos.captions[0] ?? "Product showcase" },
            { src: productVideo02, title: content.videos.captions[1] ?? "Close-up details" },
            { src: productVideo03, title: content.videos.captions[2] ?? "New product clip" },
            { src: productVideo04, title: content.videos.captions[3] ?? "Style preview" },
          ].map((video, i) => (
            <motion.figure
              key={video.src}
              initial={{ opacity: 0, y: 24, rotate: i % 2 === 0 ? -1.5 : 1.5 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.65, delay: i * 0.08 }}
              className="overflow-hidden bg-secondary"
            >
              <video
                src={video.src}
                className="aspect-[4/5] w-full object-cover"
                controls
                muted
                playsInline
                preload="metadata"
              />
              <figcaption className="px-4 py-4 font-display text-lg">{video.title}</figcaption>
            </motion.figure>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container-luxe py-20 md:py-28">
        <SectionHeading eyebrow={content.testimonials.eyebrow} title={content.testimonials.title} />
        <div className="mt-12 overflow-hidden">
          <div className="review-marquee flex w-max gap-6">
          {content.testimonials.items.map((t) => (
            <figure key={t.name} className="w-[18rem] shrink-0 bg-secondary p-8 md:w-[24rem]">
              <p className="font-display text-xl leading-snug">“{t.text}”</p>
              <figcaption className="mt-6 text-xs uppercase tracking-[0.22em] text-primary">— {t.name}</figcaption>
            </figure>
          ))}
          </div>
        </div>
      </section>

      {/* INSTAGRAM */}
      <section className="container-luxe pb-20">
        <SectionHeading eyebrow={content.instagram.eyebrow} title={content.instagram.title} subtitle={content.instagram.subtitle} />
        <div className="mt-10 grid grid-cols-3 md:grid-cols-6 gap-2">
          {categories.slice(0, 6).map((c) => (
            <a key={c.slug} href={content.instagram.url} aria-label={`Instagram - ${c.name}`} className="relative group aspect-square overflow-hidden bg-secondary">
              <img src={c.image} alt="" loading="lazy" decoding="async" className="size-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors flex items-center justify-center">
                <Instagram className="h-6 w-6 text-background opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container-luxe max-w-2xl text-center">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--gold)]">{content.newsletter.eyebrow}</p>
          <h2 className="font-display text-3xl md:text-4xl mt-3">{content.newsletter.title}</h2>
          <p className="mt-4 text-primary-foreground/80">{content.newsletter.body}</p>
          <form
            className="mt-7 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={(e) => { e.preventDefault(); alert(content.newsletter.successMessage); }}
          >
            <input
              type="email"
              required
              placeholder="your@email.com"
              className="flex-1 bg-background/10 border border-background/30 px-4 py-3 text-sm placeholder:text-primary-foreground/60 focus:outline-none focus:border-[color:var(--gold)]"
            />
            <button className="bg-[color:var(--gold)] text-foreground px-6 py-3 text-sm uppercase tracking-[0.18em] hover:opacity-90 transition-opacity">
              {content.newsletter.buttonLabel}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

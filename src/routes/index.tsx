import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, Truck, ShieldCheck, Gem, Instagram } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import bagHeroImg from "@/assets/cat-bags.jpg";
import perfumeHeroImg from "@/assets/perfumes/perfume-05.jpeg";
import productVideo01 from "@/assets/videos/product-video-01.mp4";
import productVideo02 from "@/assets/videos/product-video-02.mp4";
import productVideo03 from "@/assets/videos/product-video-03.mp4";
import { categories, products } from "@/lib/shop-data";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";

export const Route = createFileRoute("/")({
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

function categoryBalancedProducts(limit: number, highlight: "newArrival" | "bestseller") {
  const selected: typeof products = [];
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
  const newArrivals = categoryBalancedProducts(8, "newArrival");
  const bestSellers = categoryBalancedProducts(12, "bestseller");
  const heroSlides = [
    { image: heroImg, alt: "Model wearing a flowing atamfa gown" },
    { image: perfumeHeroImg, alt: "Assorted perfume and body mist products" },
    { image: bagHeroImg, alt: "Curated handbag collection" },
  ];
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
            <p className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">Atelier of Luxury</p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-[1.05] mt-5 text-background">
              Effortless elegance,
              <br />
              <span className="italic text-[color:var(--gold)]">curated for you.</span>
            </h1>
            <div className="gold-underline mt-6" />
            <p className="mt-6 text-base md:text-lg text-background/86 max-w-md leading-relaxed">
              Premium atamfa, lace, intimates, bags, shoes, veils and signature perfumes —
              hand-picked, beautifully packaged, delivered to your door.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-[color:var(--gold)] text-foreground px-7 py-3.5 text-sm uppercase tracking-[0.18em] hover:bg-[color:var(--gold)]/90 transition-colors"
              >
                Shop Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/categories"
                className="inline-flex items-center gap-2 border border-background/45 text-background px-7 py-3.5 text-sm uppercase tracking-[0.18em] hover:border-[color:var(--gold)] hover:text-[color:var(--gold)] transition-colors"
              >
                View Collections
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PRODUCT VIDEOS */}
      <section className="container-luxe py-20 md:py-24">
        <SectionHeading eyebrow="Product videos" title="See the details in motion" subtitle="Short product clips for texture, scale and finish before you order." />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { src: productVideo01, title: "Fresh arrivals" },
            { src: productVideo02, title: "Fabric and finish" },
            { src: productVideo03, title: "Product close-up" },
          ].map((video, i) => (
            <motion.figure
              key={video.src}
              initial={{ opacity: 0, y: 24, rotate: i === 0 ? -1.5 : i === 2 ? 1.5 : 0 }}
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

      {/* FEATURED CATEGORIES */}
      <section className="container-luxe py-20 md:py-28">
        <SectionHeading eyebrow="Collections" title="Shop by category" subtitle="From handwoven atamfa to whisper-light veils — each piece chosen with intention." />
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
                  <img src={c.image} alt={c.name} loading="lazy" width={800} height={800} className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
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
          <SectionHeading eyebrow="Fresh" title="New arrivals" align="left" />
          <Link to="/shop" className="text-sm text-primary inline-flex items-center gap-1 hover:gap-2 transition-all">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {newArrivals.map((p, i) => <ProductCard key={p.id} product={p} index={i} showAddToCart />)}
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="container-luxe py-16">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <SectionHeading eyebrow="Loved" title="Best sellers" align="left" />
          <Link to="/shop" className="text-sm text-primary inline-flex items-center gap-1 hover:gap-2 transition-all">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {bestSellers.map((p, i) => <ProductCard key={p.id} product={p} index={i} showAddToCart />)}
        </div>
      </section>

      {/* WHY US */}
      <section className="bg-secondary mt-20 py-20">
        <div className="container-luxe">
          <SectionHeading eyebrow="The Cove promise" title="Why customers stay" />
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Gem, title: "Premium quality", body: "Sourced and inspected piece by piece." },
              { icon: Sparkles, title: "Considered pricing", body: "Luxury that respects your budget." },
              { icon: Truck, title: "Fast delivery", body: "Beautifully packaged, swiftly dispatched." },
              { icon: ShieldCheck, title: "Trusted service", body: "Real people, real care, every order." },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="text-center">
                <div className="mx-auto h-14 w-14 rounded-full border border-[color:var(--gold)] flex items-center justify-center text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl mt-5">{title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container-luxe py-20 md:py-28">
        <SectionHeading eyebrow="Kind words" title="From our community" />
        <div className="mt-12 overflow-hidden">
          <div className="review-marquee flex w-max gap-6">
          {[
            { name: "Adaeze O.", text: "The atamfa was even more beautiful in person. Tailor's eyes lit up." },
            { name: "Ifeoma N.", text: "Packaging felt like a gift to myself. Will buy again — already have." },
            { name: "Zainab A.", text: "Cove Noir is now my signature scent. Compliments every single day." },
          ].map((t) => (
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
        <SectionHeading eyebrow="@thefashioncove" title="Follow the atelier" subtitle="Daily inspiration, fresh arrivals and behind-the-scenes." />
        <div className="mt-10 grid grid-cols-3 md:grid-cols-6 gap-2">
          {categories.slice(0, 6).map((c) => (
            <a key={c.slug} href="https://instagram.com" aria-label={`Instagram — ${c.name}`} className="relative group aspect-square overflow-hidden bg-secondary">
              <img src={c.image} alt="" loading="lazy" className="size-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
          <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--gold)]">The list</p>
          <h2 className="font-display text-3xl md:text-4xl mt-3">First looks, private pricing</h2>
          <p className="mt-4 text-primary-foreground/80">Subscribe for new drops, restocks and members-only offers.</p>
          <form
            className="mt-7 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={(e) => { e.preventDefault(); alert("Thank you — you're on the list."); }}
          >
            <input
              type="email"
              required
              placeholder="your@email.com"
              className="flex-1 bg-background/10 border border-background/30 px-4 py-3 text-sm placeholder:text-primary-foreground/60 focus:outline-none focus:border-[color:var(--gold)]"
            />
            <button className="bg-[color:var(--gold)] text-foreground px-6 py-3 text-sm uppercase tracking-[0.18em] hover:opacity-90 transition-opacity">
              Join
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

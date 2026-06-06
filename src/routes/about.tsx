import { createFileRoute } from "@tanstack/react-router";
import { SectionHeading } from "@/components/SectionHeading";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — The Fashion Cove" },
      { name: "description", content: "Our story, mission and the values behind The Fashion Cove." },
      { property: "og:title", content: "About — The Fashion Cove" },
      { property: "og:description", content: "An atelier built on craft, care and curation." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div>
      <section className="container-luxe py-14 md:py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-primary">Our story</p>
          <h1 className="font-display text-4xl md:text-5xl mt-3">An atelier built on craft, care and curation.</h1>
          <div className="gold-underline mt-5" />
          <p className="mt-6 text-foreground/80 leading-relaxed">
            The Fashion Cove began with a simple belief — that beautiful things should feel
            personal. Every fabric we stock, every bag we wrap and every bottle we send out
            passes through our hands first. We are small, deliberate and obsessed with the details.
          </p>
        </div>
        <div className="aspect-[4/5] overflow-hidden">
          <img src={heroImg} alt="The Fashion Cove" width={800} height={1000} className="size-full object-cover" />
        </div>
      </section>

      <section className="bg-secondary py-20">
        <div className="container-luxe grid md:grid-cols-3 gap-10">
          {[
            { title: "Mission", body: "To bring premium, hand-picked fashion to women who value quality without compromise." },
            { title: "Vision", body: "To become Africa's most trusted destination for curated luxury — accessible, considered and unmistakably ours." },
            { title: "Values", body: "Care over speed. Quality over quantity. Real relationships over transactions." },
          ].map((b) => (
            <div key={b.title}>
              <h3 className="font-display text-2xl">{b.title}</h3>
              <div className="gold-underline mt-3" />
              <p className="mt-4 text-muted-foreground leading-relaxed">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-luxe py-20">
        <SectionHeading eyebrow="Why us" title="Why customers trust The Cove" />
        <div className="mt-12 grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {[
            ["Every item checked", "We inspect each piece before it leaves us."],
            ["Beautiful packaging", "Designed to feel like a gift, every time."],
            ["Fair, transparent pricing", "No inflated tags, no surprise charges."],
            ["A real person to talk to", "WhatsApp us — we answer the same day."],
          ].map(([t, b]) => (
            <div key={t}>
              <h4 className="font-display text-lg text-primary">{t}</h4>
              <p className="mt-1 text-sm text-muted-foreground">{b}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

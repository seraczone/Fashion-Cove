import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { CONTACT_EMAIL, PHONE_DISPLAY, STORE_ADDRESS, whatsappLink } from "@/lib/shop-data";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — The Fashion Cove" },
      { name: "description", content: "Reach The Fashion Cove by WhatsApp, phone or email." },
      { property: "og:title", content: "Contact — The Fashion Cove" },
      { property: "og:description", content: "We'd love to hear from you." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const msg = `Hello The Fashion Cove!\n\nName: ${data.get("name")}\nEmail: ${data.get("email")}\nPhone: ${data.get("phone")}\n\n${data.get("message")}`;
    window.open(whatsappLink(msg), "_blank", "noopener");
    setSent(true);
    e.currentTarget.reset();
  };

  return (
    <div className="container-luxe py-12 md:py-16">
      <SectionHeading eyebrow="Say hello" title="Get in touch" subtitle="Questions, custom orders, or just a fashion chat — we're here for it." />

      <div className="mt-14 grid lg:grid-cols-[1.2fr_1fr] gap-12">
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Your name" name="name" required />
            <Field label="Phone" name="phone" type="tel" />
          </div>
          <Field label="Email" name="email" type="email" required />
          <div>
            <label className="block text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-2">Message</label>
            <textarea
              name="message"
              required
              rows={5}
              className="w-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 text-sm uppercase tracking-[0.18em] hover:bg-primary/90 transition-colors">
            <MessageCircle className="h-4 w-4" /> Send via WhatsApp
          </button>
          {sent && <p className="text-sm text-primary">Opening WhatsApp…</p>}
        </form>

        <aside className="space-y-6 text-sm">
          <Info icon={Phone} title="Phone" body={PHONE_DISPLAY} />
          <Info icon={MessageCircle} title="WhatsApp" body="Tap below to chat now">
            <a href={whatsappLink("Hello The Fashion Cove!")} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 text-primary underline">
              Open WhatsApp
            </a>
          </Info>
          <Info icon={Mail} title="Email" body={CONTACT_EMAIL} />
          <Info icon={MapPin} title="Store" body={STORE_ADDRESS} />

          <div className="aspect-video overflow-hidden border border-border">
            <iframe
              title="Map"
              src={`https://www.google.com/maps?q=${encodeURIComponent(STORE_ADDRESS)}&output=embed`}
              className="size-full"
              loading="lazy"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, name, type = "text", required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-2">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:border-primary"
      />
    </div>
  );
}

function Info({ icon: Icon, title, body, children }: { icon: React.ElementType; title: string; body: string; children?: React.ReactNode }) {
  return (
    <div className="flex gap-4 p-5 bg-secondary">
      <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center text-primary shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{title}</p>
        <p className="mt-1 text-foreground">{body}</p>
        {children}
      </div>
    </div>
  );
}

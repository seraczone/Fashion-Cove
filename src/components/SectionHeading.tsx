export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  const center = align === "center";
  return (
    <div className={center ? "text-center max-w-2xl mx-auto" : "max-w-2xl"}>
      {eyebrow && (
        <p className="text-[11px] uppercase tracking-[0.28em] text-primary">{eyebrow}</p>
      )}
      <h2 className="font-display text-3xl md:text-4xl mt-3">{title}</h2>
      <div className={`gold-underline mt-4 ${center ? "mx-auto" : ""}`} />
      {subtitle && (
        <p className="mt-5 text-muted-foreground leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}

import Link from "next/link";
import { Metadata } from "next";
import { fetchRepairCatalog, fetchModelRepairTypes } from "@/lib/api";
import Breadcrumbs from "@/components/Breadcrumbs";

export const revalidate = 3600;
export const dynamicParams = true;

interface ModelPageProps {
  params: Promise<{ brand: string; model: string }>;
}

export async function generateStaticParams() {
  const catalog = await fetchRepairCatalog();
  const allParams: { brand: string; model: string }[] = [];

  for (const brand of catalog.brands) {
    for (const model of brand.models) {
      allParams.push({ brand: brand.slug, model: model.slug });
    }
  }

  return allParams;
}

export async function generateMetadata({ params }: ModelPageProps): Promise<Metadata> {
  const { brand: brandSlug, model: modelSlug } = await params;
  const data = await fetchModelRepairTypes(brandSlug, modelSlug);

  const modelName = data?.model || modelSlug.replace(/-/g, " ");
  const brandName = data?.brand || brandSlug.replace(/-/g, " ");

  return {
    title: `${modelName} Repair Services in Ringwood | Ali Mobile & Repair`,
    description: `Choose a repair service for your ${modelName}. ${brandName} screen replacement, battery swap, charging port fix & more — under 1 hour in Ringwood with a 6-month warranty.`,
  };
}

export default async function ModelRepairSelectPage({ params }: ModelPageProps) {
  const { brand: brandSlug, model: modelSlug } = await params;
  const data = await fetchModelRepairTypes(brandSlug, modelSlug);

  const modelName = data?.model || modelSlug.replace(/-/g, " ");
  const brandName = data?.brand || brandSlug.replace(/-/g, " ");
  const repairTypes = data?.repairTypes || [];

  return (
    <div className="page-container" style={{ maxWidth: "900px" }}>
      <Breadcrumbs brand={brandSlug} model={modelSlug} />

      <h1
        style={{
          fontSize: "clamp(1.8rem, 4.5vw, 2.8rem)",
          fontWeight: 800,
          textAlign: "center",
          marginBottom: "0.5rem",
          letterSpacing: "-0.5px",
        }}
      >
        {modelName} Repair Services
      </h1>
      <p
        style={{
          textAlign: "center",
          opacity: 0.7,
          fontSize: "1rem",
          maxWidth: "520px",
          margin: "0 auto 2.5rem",
        }}
      >
        Select the repair you need for your {modelName}. Walk-in or book online for same-day service in Ringwood.
      </p>

      <div className="repair-option-grid">
        {repairTypes.map((rt) => (
          <Link
            key={rt.slug}
            href={`/repairs/${brandSlug}/${modelSlug}/${rt.slug}`}
            className="repair-option-card"
          >
            <span className="repair-option-icon">
              {getRepairIcon(rt.slug)}
            </span>
            <div className="repair-option-info">
              <span className="repair-option-name">{rt.name}</span>
              <span className="repair-option-price">
                {rt.price > 0 ? `From $${rt.price}` : "Quote on Request"}
              </span>
            </div>
            <span className="repair-option-arrow">→</span>
          </Link>
        ))}
      </div>

      {/* CTA Section */}
      <div
        style={{
          marginTop: "3rem",
          background: "var(--secondary)",
          borderRadius: "20px",
          padding: "2.5rem",
          border: "1px solid var(--layer-border)",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "1.4rem", marginBottom: "0.5rem" }}>
          Not sure what&apos;s wrong?
        </h2>
        <p style={{ opacity: 0.7, marginBottom: "1.5rem", fontSize: "0.95rem" }}>
          Bring your {modelName} to our Ringwood kiosk for a free diagnostic — no obligation.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/book-repair" className="cta-book">
            Book Repair Now
          </Link>
          <a href="tel:0481058514" className="cta-call">
            📞 Call 0481 058 514
          </a>
        </div>
      </div>
    </div>
  );
}

function getRepairIcon(slug: string): string {
  switch (slug) {
    case "screen-replacement": return "📱";
    case "battery-replacement": return "🔋";
    case "charging-port-repair": return "🔌";
    case "water-damage-repair": return "💧";
    case "back-glass-repair": return "🪟";
    case "camera-repair": return "📷";
    default: return "🔧";
  }
}

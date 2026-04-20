import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchRepairCatalog, fetchModelRepairTypes } from "@/lib/api";
import { formatDynamicParam } from "@/lib/inventoryUtils";
import Breadcrumbs from "@/components/Breadcrumbs";
import RepairOptionsGrid from "@/components/services/RepairOptionsGrid";

export const revalidate = 3600;
export const dynamicParams = true;

interface ModelPageProps {
  params: Promise<{ category: string; brand: string; model: string }>;
}

export async function generateStaticParams() {
  const catalog = await fetchRepairCatalog();
  
  // Limit to top 100 models to balance build time and SEO
  const allModels = catalog.brands.flatMap(brand => 
    brand.models.map(model => ({
      category: brand.category,
      brand: brand.slug,
      model: model.slug
    }))
  );

  return allModels.slice(0, 100);
}

export async function generateMetadata({ params }: ModelPageProps): Promise<Metadata> {
  const { category: categorySlug, brand: brandSlug, model: modelSlug } = await params;
  const data = await fetchModelRepairTypes(categorySlug, brandSlug, modelSlug);

  if (!data) return {};

  const modelName = data?.model || formatDynamicParam(modelSlug);
  const brandName = data?.brand || formatDynamicParam(brandSlug);

  return {
    title: `${modelName} Repair Services in Ringwood | Ali Mobile & Repair`,
    description: `Choose a repair service for your ${modelName}. ${brandName} screen replacement, battery swap, charging port fix & more — under 1 hour in Ringwood with a 6-month warranty.`,
  };
}

export default async function ModelRepairSelectPage({ params }: ModelPageProps) {
  const { category: categorySlug, brand: brandSlug, model: modelSlug } = await params;
  const data = await fetchModelRepairTypes(categorySlug, brandSlug, modelSlug);

  if (!data) {
    notFound();
  }

  const modelName = data?.model || formatDynamicParam(modelSlug);
  const repairTypes = data?.repairTypes || [];

  return (
    <div className="page-container" style={{ maxWidth: "900px" }}>
      <Breadcrumbs category={categorySlug} brand={brandSlug} model={modelSlug} />

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

      <RepairOptionsGrid 
        repairTypes={repairTypes}
        categorySlug={categorySlug}
        brandSlug={brandSlug}
        modelSlug={modelSlug}
        modelName={modelName}
      />

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

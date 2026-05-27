import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchRepairCatalog, fetchModelRepairTypes } from "@/lib/api";
import { formatDynamicParam } from "@/lib/inventoryUtils";
import Breadcrumbs from "@/components/Breadcrumbs";
import BackButton from "@/components/BackButton";
import RepairOptionsGrid from "@/components/services/RepairOptionsGrid";
import RepairCTA from "@/components/services/RepairCTA";
import { ArrowRight, Clock, ClipboardCheck, MapPin, PhoneCall, ShieldCheck, Wrench } from "lucide-react";

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

  return allModels;
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
    <main className="repair-page-shell repair-page-shell-narrow">
      <Breadcrumbs category={categorySlug} brand={brandSlug} model={modelSlug} />

      <section className="repair-tech-hero repair-tech-hero-compact" aria-labelledby="model-repair-heading">
        <div className="repair-tech-hero-copy">
          <BackButton fallbackHref={`/repairs/${categorySlug}/${brandSlug}`} />
          <span className="repair-kicker">
            <Wrench size={15} strokeWidth={2.4} aria-hidden="true" />
            Repair menu
          </span>
          <h1 id="model-repair-heading">{modelName} Repair Services</h1>
          <p>Select the repair you need for your {modelName}. Walk in or book online for practical service at Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134.</p>
          <div className="repair-hero-actions repair-model-actions">
            <a href="tel:0481058514" className="repair-secondary-action">
              <PhoneCall size={17} strokeWidth={2.6} aria-hidden="true" />
              Call Now
            </a>
            <a href="#repair-options" className="repair-primary-action">
              View repair options
              <ArrowRight size={18} strokeWidth={2.7} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="repair-hero-panel repair-hero-insight-panel" aria-label="Repair process highlights">
          <div className="repair-device-card" aria-hidden="true">
            <span className="repair-device-frame">
              <span />
            </span>
            <div>
              <strong>{modelName}</strong>
              <small>Repair path preview</small>
            </div>
          </div>
          <div>
            <ClipboardCheck size={20} strokeWidth={2.4} aria-hidden="true" />
            <span>Clear quote before repair</span>
          </div>
          <div>
            <ShieldCheck size={20} strokeWidth={2.4} aria-hidden="true" />
            <span>6-month warranty on eligible repairs</span>
          </div>
          <div>
            <Clock size={20} strokeWidth={2.4} aria-hidden="true" />
            <span>Most common repairs can be checked while you wait</span>
          </div>
          <div>
            <MapPin size={20} strokeWidth={2.4} aria-hidden="true" />
            <span>Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134</span>
          </div>
        </div>
      </section>

      <section id="repair-options" className="repair-content-band" aria-label={`${modelName} repair options`}>
        <RepairOptionsGrid
          repairTypes={repairTypes}
          categorySlug={categorySlug}
          brandSlug={brandSlug}
          modelSlug={modelSlug}
          modelName={modelName}
        />
      </section>

      <section className="repair-assist-panel" aria-labelledby="diagnostic-help-heading">
        <div>
          <span className="repair-kicker repair-kicker-muted">Free diagnostic</span>
          <h2 id="diagnostic-help-heading">Not sure what&apos;s wrong?</h2>
          <p>Bring your {modelName} to our Ringwood kiosk for a practical diagnostic before committing to a repair.</p>
        </div>
        <RepairCTA
          modelSlug={modelSlug}
          repairSlug="general"
          modelName={modelName}
          repairName="General Inquiry"
        />
      </section>
    </main>
  );
}

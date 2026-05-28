import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchRepairCatalog, fetchModelRepairTypes } from "@/lib/api";
import { formatDynamicParam } from "@/lib/inventoryUtils";
import Breadcrumbs from "@/components/Breadcrumbs";
import BackButton from "@/components/BackButton";
import RepairOptionsGrid from "@/components/services/RepairOptionsGrid";
import RepairCTA from "@/components/services/RepairCTA";
import ModelSeoWorkbench from "@/components/services/ModelSeoWorkbench";
import { getIphone13ModelSeoPocketSuite } from "@/data/modelSeoPockets";
import { ArrowRight, PhoneCall, Wrench } from "lucide-react";

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
  const seoPocketSuite = getIphone13ModelSeoPocketSuite({
    category: categorySlug,
    brand: brandSlug,
    model: modelSlug,
  });

  return (
    <main className="repair-page-shell repair-page-shell-narrow">
      <Breadcrumbs category={categorySlug} brand={brandSlug} model={modelSlug} />

      <section className="mb-5 rounded-[28px] border border-blue-100 bg-white/85 px-5 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:px-6" aria-labelledby="model-repair-heading">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="w-full max-w-2xl">
            <BackButton fallbackHref={`/repairs/${categorySlug}/${brandSlug}`} />
            <span className="repair-kicker mt-3">
              <Wrench size={15} strokeWidth={2.4} aria-hidden="true" />
              Repair menu
            </span>
            <h1 id="model-repair-heading" className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              {modelName} repair options
            </h1>
            <p className="mt-3 max-w-xl text-base font-semibold leading-7 text-slate-600">
              Choose the exact repair type below. Pricing and booking details unlock on the next step.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:pb-1">
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

      {seoPocketSuite && (
        <ModelSeoWorkbench
          suite={seoPocketSuite}
          repairTypes={repairTypes}
          categorySlug={categorySlug}
          brandSlug={brandSlug}
          modelSlug={modelSlug}
          modelName={modelName}
        />
      )}

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

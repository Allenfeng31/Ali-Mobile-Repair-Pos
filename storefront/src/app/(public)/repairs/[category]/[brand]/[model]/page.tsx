import { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchRepairCatalog, fetchModelRepairTypes } from "@/lib/api";
import { formatDynamicParam, preserveRouteSegment, safeSlugSegment } from "@/lib/inventoryUtils";
import Breadcrumbs from "@/components/Breadcrumbs";
import BackButton from "@/components/BackButton";
import RepairOptionsGrid from "@/components/services/RepairOptionsGrid";
import RepairCTA from "@/components/services/RepairCTA";
import RepairResultsMatchingSection from "@/components/repair-results/RepairResultsMatchingSection";
import ScrollReveal from "@/components/ScrollReveal";
import { ArrowRight, Battery, Camera, PhoneCall, PlugZap, Smartphone, Wrench } from "lucide-react";

export const revalidate = 86400;
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
  const canonicalPath = `/repairs/${safeSlugSegment(categorySlug)}/${safeSlugSegment(brandSlug)}/${preserveRouteSegment(modelSlug)}`;

  return {
    title: `${modelName} Repair in Ringwood | Fast \u0026 Reliable | Ali Mobile`,
    description: `Choose a repair service for your ${modelName}. ${brandName} screen replacement, battery swap, charging port fix \u0026 more — most common repairs under 1 hour in Ringwood when parts are in stock, with warranty support on eligible repairs.`,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: `${modelName} Repair in Ringwood | Fast \u0026 Reliable`,
      description: `Choose a repair service for your ${modelName}. ${brandName} screen replacement, battery swap, charging port fix \u0026 more — most common repairs under 1 hour in Ringwood when parts are in stock, with warranty support on eligible repairs.`,
      url: canonicalPath,
      type: "website",
      locale: "en_AU",
      siteName: "Ali Mobile & Repair",
    },
  };
}

export default async function ModelRepairSelectPage({ params }: ModelPageProps) {
  const { category: categorySlug, brand: brandSlug, model: modelSlug } = await params;
  const data = await fetchModelRepairTypes(categorySlug, brandSlug, modelSlug);

  if (!data) {
    notFound();
  }

  const modelName = data?.model || formatDynamicParam(modelSlug);
  const brandName = data?.brand || formatDynamicParam(brandSlug);
  const introBrandPrefix = brandName && modelName.toLowerCase().startsWith(brandName.toLowerCase()) ? "" : `${brandName} `;
  const repairTypes = data?.repairTypes || [];
  const commonIssues = [
    {
      icon: Smartphone,
      text: "Cracked front glass or display faults",
    },
    {
      icon: Battery,
      text: "Rapid battery drain or unexpected shutdowns",
    },
    {
      icon: PlugZap,
      text: "Loose charging port or cable connection issues",
    },
    {
      icon: Camera,
      text: "Camera focus faults or cracked rear lenses",
    },
  ];
  const diagnosticSteps = ["Quick test", "Honest quote", "Repair options"];

  return (
    <main className="repair-page-shell repair-page-shell-narrow">
      <Breadcrumbs category={categorySlug} brand={brandSlug} model={modelSlug} />

      <section className="mb-8 rounded-[32px] border border-blue-100 bg-white/85 px-5 py-6 shadow-[0_22px_70px_rgba(15,23,42,0.07)] sm:px-6 lg:px-7 lg:py-7" aria-labelledby="model-repair-heading">
        <div className="overflow-hidden rounded-[28px] border border-blue-100 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(248,250,252,0.86)),radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_40%)] p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-6 lg:p-7">
          <div className="flex flex-wrap items-center gap-3">
            <BackButton fallbackHref={`/repairs/${categorySlug}/${brandSlug}`} />
            <span className="repair-kicker">
              <Wrench size={15} strokeWidth={2.4} aria-hidden="true" />
              Repair menu
            </span>
          </div>
          <div className="mt-6 max-w-3xl">
            <h1 id="model-repair-heading" className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl lg:leading-[0.98]">
              {modelName} repair options
            </h1>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-slate-600 sm:text-[1.03rem]">
              Professional {introBrandPrefix}{modelName} repairs in Ringwood. Choose a repair type below to check pricing, parts availability and booking options.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
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
        </div>
      </section>

      <section
        id="repair-options"
        className="repair-content-band rounded-[28px] border border-blue-100 bg-white/80 px-5 py-6 shadow-[0_18px_60px_rgba(15,23,42,0.055)] sm:px-6"
        aria-labelledby="repair-options-heading"
      >
        <div className="mb-3">
          <span className="repair-kicker repair-kicker-muted">Repair options</span>
          <h2 id="repair-options-heading" className="sr-only">
            Repair options for {modelName}
          </h2>
        </div>
        <RepairOptionsGrid
          repairTypes={repairTypes}
          categorySlug={categorySlug}
          brandSlug={brandSlug}
          modelSlug={modelSlug}
          modelName={modelName}
        />
      </section>

      <RepairResultsMatchingSection
        category={categorySlug}
        brand={brandSlug}
        model={modelSlug}
        context="model"
      />

      <ScrollReveal>
        <section className="repair-assist-panel" aria-labelledby="common-issues-heading">
          <div className="w-full">
            <span className="repair-kicker repair-kicker-muted">Symptoms &amp; solutions</span>
            <h2 id="common-issues-heading">Common {modelName} issues we check</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {commonIssues.map((issue) => {
                const Icon = issue.icon;

                return (
                  <div
                    key={issue.text}
                    className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-white/90 px-4 py-3 text-sm font-semibold leading-6 text-slate-700 shadow-sm shadow-blue-950/5"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-blue-100 bg-blue-50/80 text-blue-600">
                      <Icon size={18} strokeWidth={2.1} aria-hidden="true" />
                    </span>
                    <p>{issue.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="repair-assist-panel" aria-labelledby="diagnostic-help-heading">
          <div className="w-full max-w-2xl">
            <span className="repair-kicker repair-kicker-muted">Free diagnostic</span>
            <h2 id="diagnostic-help-heading">Not sure what&apos;s wrong with your {modelName}?</h2>
            <p>Bring your {modelName} to our Ringwood kiosk for a practical, zero-obligation diagnostic before repair.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {diagnosticSteps.map((step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white/90 px-4 py-3 text-sm font-bold text-slate-700 shadow-sm shadow-blue-950/5"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-blue-200 bg-blue-50 text-xs text-blue-700">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
          <RepairCTA
            modelSlug={modelSlug}
            repairSlug="general"
            modelName={modelName}
            repairName="General Inquiry"
          />
        </section>
      </ScrollReveal>
    </main>
  );
}

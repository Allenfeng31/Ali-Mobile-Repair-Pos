import { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchRepairCatalog, fetchModelRepairTypes } from "@/lib/api";
import { formatDynamicParam, safeSlugSegment } from "@/lib/inventoryUtils";
import Breadcrumbs from "@/components/Breadcrumbs";
import BackButton from "@/components/BackButton";
import RepairOptionsGrid from "@/components/services/RepairOptionsGrid";
import RepairCTA from "@/components/services/RepairCTA";
import { ArrowRight, Battery, Camera, PhoneCall, PlugZap, Smartphone, Wrench } from "lucide-react";

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
  const canonicalPath = `/repairs/${safeSlugSegment(categorySlug)}/${safeSlugSegment(brandSlug)}/${safeSlugSegment(modelSlug)}`;

  return {
    title: `${modelName} Repair Services in Ringwood | Ali Mobile & Repair`,
    description: `Choose a repair service for your ${modelName}. ${brandName} screen replacement, battery swap, charging port fix & more — under 1 hour in Ringwood with a 6-month warranty.`,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: `${modelName} Repair Services in Ringwood | Ali Mobile & Repair`,
      description: `Choose a repair service for your ${modelName}. ${brandName} screen replacement, battery swap, charging port fix & more — under 1 hour in Ringwood with a 6-month warranty.`,
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
  const trustChips = ["Clear quote first", "Parts availability checked", "Ringwood repair desk"];
  const howItWorks = ["Choose repair", "Confirm quote", "Book or visit"];

  return (
    <main className="repair-page-shell repair-page-shell-narrow">
      <Breadcrumbs category={categorySlug} brand={brandSlug} model={modelSlug} />

      <section className="mb-7 rounded-[28px] border border-blue-100 bg-white/85 px-5 py-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:mb-8 sm:px-6" aria-labelledby="model-repair-heading">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(280px,320px)] lg:items-end">
          <div className="w-full max-w-2xl">
            <BackButton fallbackHref={`/repairs/${categorySlug}/${brandSlug}`} />
            <span className="repair-kicker mt-3">
              <Wrench size={15} strokeWidth={2.4} aria-hidden="true" />
              Repair menu
            </span>
            <h1 id="model-repair-heading" className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              {modelName} repair options
            </h1>
            <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-600">
              Professional {introBrandPrefix}{modelName} repair services in Ringwood. Select a repair category below to view live pricing, parts availability and repair timing confirmed after inspection.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {trustChips.map((chip) => (
                <span
                  key={chip}
                  className="inline-flex items-center rounded-full border border-blue-100 bg-white/80 px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm shadow-blue-950/5"
                >
                  {chip}
                </span>
              ))}
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {howItWorks.map((step, index) => (
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
          <div className="flex h-full flex-col justify-end gap-4 rounded-[24px] border border-blue-100 bg-white/75 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <div>
              <span className="repair-kicker repair-kicker-muted">Local support</span>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                Walk-ins are welcome at our Ringwood desk. Call ahead if you want to check parts availability or timing before you visit.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
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
        <div className="mb-5">
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
    </main>
  );
}

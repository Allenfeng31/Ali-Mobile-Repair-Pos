import Link from "next/link";
import { Metadata } from "next";
import { REPAIR_TYPES } from "@/data/seo-data";
import { fetchRepairCatalog, fetchBrandModels } from "@/lib/api";
import { formatDynamicParam } from "@/lib/inventoryUtils";
import { smartSortModels, groupModelsBySeries } from "@/lib/modelSortConfig";
import BrandModelSearch from "@/components/BrandModelSearch";
import { ArrowRight, Search, ShieldCheck, Smartphone } from "lucide-react";

export const dynamic = 'force-dynamic'; // Enforce absolute fresh data for model lists
export const dynamicParams = true; // Allow on-demand generation of new brand pages

interface BrandPageProps {
  params: Promise<{ category: string; brand: string }>;
}

export async function generateStaticParams() {
  const catalog = await fetchRepairCatalog();
  return catalog.brands.map((b) => ({
    category: b.category,
    brand: b.slug,
  }));
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { brand } = await fetchBrandModels(resolvedParams.category, resolvedParams.brand);
  const brandName = brand?.brand || formatDynamicParam(resolvedParams.brand);
  return {
    title: `${brandName} Repair Services in Ringwood | Ali Mobile & Repair`,
    description: `Expert ${brandName} repair services in Ringwood, Melbourne. Screen replacement, battery repair, charging port fix, and more. Under 1 hour, 6-month warranty.`,
  };
}

export default async function BrandSubHubPage({ params }: BrandPageProps) {
  const resolvedParams = await params;
  const { brand: brandEntry } = await fetchBrandModels(resolvedParams.category, resolvedParams.brand);

  const brandName = brandEntry?.brand || formatDynamicParam(resolvedParams.brand);
  const models = brandEntry?.models || [];
  const categorySlug = resolvedParams.category;
  const brandSlug = resolvedParams.brand;
  const sortedModels = smartSortModels(models);
  const seriesGroups = groupModelsBySeries(sortedModels, brandName);

  return (
    <main className="repair-page-shell repair-page-shell-narrow">
      <nav className="repair-breadcrumb" aria-label="breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/repairs">Repairs</Link>
        <span>/</span>
        <strong>{brandName}</strong>
      </nav>

      <section className="repair-tech-hero repair-tech-hero-compact" aria-labelledby="brand-repair-heading">
        <div className="repair-tech-hero-copy">
          <span className="repair-kicker">
            <Smartphone size={15} strokeWidth={2.4} aria-hidden="true" />
            Model selector
          </span>
          <h1 id="brand-repair-heading">{brandName} Repair Services</h1>
          <p>Select your exact model below to view repair options and pricing at our Ringwood Square kiosk.</p>
          <div className="repair-hero-actions">
            <Link href={`/repairs/${categorySlug}`} className="repair-secondary-action">
              Back to category
            </Link>
            <Link href="/book-repair" className="repair-primary-action">
              Live Quote
              <ArrowRight size={18} strokeWidth={2.7} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="repair-hero-panel" aria-label="Model selection support">
          <div>
            <Search size={20} strokeWidth={2.4} aria-hidden="true" />
            <span>Search by model name or code</span>
          </div>
          <div>
            <ShieldCheck size={20} strokeWidth={2.4} aria-hidden="true" />
            <span>Transparent repair paths before booking</span>
          </div>
        </div>
      </section>

      <section className="repair-content-band" aria-label={`${brandName} models`}>
        <BrandModelSearch
          seriesGroups={seriesGroups}
          categorySlug={categorySlug}
          brandSlug={brandSlug}
        />
      </section>

      <section className="repair-assist-panel" aria-labelledby="brand-repair-types-heading">
        <div>
          <span className="repair-kicker repair-kicker-muted">Common services</span>
          <h2 id="brand-repair-types-heading">All {brandName} Repair Types</h2>
          <p>These are the repair paths we commonly support once you choose a model.</p>
        </div>
        <div className="repair-chip-cloud">
          {REPAIR_TYPES.map((rt) => (
            <span key={rt.slug}>{rt.name}</span>
          ))}
        </div>
      </section>
    </main>
  );
}

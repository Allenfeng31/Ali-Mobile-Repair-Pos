import Link from "next/link";
import { Metadata } from "next";
import { REPAIR_TYPES } from "@/data/seo-data";
import { fetchRepairCatalog, fetchBrandModels } from "@/lib/api";
import { formatDynamicParam } from "@/lib/inventoryUtils";
import { smartSortModels, groupModelsBySeries } from "@/lib/modelSortConfig";
import BrandModelSearch from "@/components/BrandModelSearch";

export const revalidate = 3600; // ISR: revalidate every hour
export const dynamicParams = true; // Allow on-demand generation of new brand pages

interface BrandPageProps {
  params: Promise<{ category: string; brand: string }>;
}

export async function generateStaticParams() {
  const catalog = await fetchRepairCatalog();
  return catalog.brands.map((b) => ({ category: b.category, brand: b.slug }));
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
    <div className="page-container" style={{ maxWidth: "1000px" }}>
      <nav
        aria-label="breadcrumb"
        style={{
          fontSize: "0.86rem",
          marginBottom: "1.5rem",
          opacity: 0.85,
          textAlign: "center",
        }}
      >
        <ol
          style={{
            listStyle: "none",
            padding: 0,
            display: "flex",
            justifyContent: "center",
            gap: "0.6rem",
            flexWrap: "wrap",
            margin: 0,
          }}
        >
          <li>
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
              Home
            </Link>
          </li>
          <li>&rsaquo;</li>
          <li>
            <Link href="/repairs" style={{ color: "inherit", textDecoration: "none" }}>
              Repairs
            </Link>
          </li>
          <li>&rsaquo;</li>
          <li>
            <span style={{ color: "var(--primary)", fontWeight: 600 }}>
              {brandName}
            </span>
          </li>
        </ol>
      </nav>

      <h1
        style={{
          fontSize: "clamp(1.8rem, 4.5vw, 2.8rem)",
          fontWeight: 800,
          textAlign: "center",
          marginBottom: "0.5rem",
          letterSpacing: "-0.5px",
        }}
      >
        {brandName} Repair Services
      </h1>
      <p
        style={{
          textAlign: "center",
          opacity: 0.7,
          fontSize: "1rem",
          maxWidth: "480px",
          margin: "0 auto 3rem",
        }}
      >
        Select your model below to view repair options and pricing in Ringwood.
      </p>

      <BrandModelSearch 
        seriesGroups={seriesGroups} 
        categorySlug={categorySlug} 
        brandSlug={brandSlug} 
      />

      {/* Repair types nav */}
      <div
        style={{
          marginTop: "2rem",
          padding: "2rem",
          background: "var(--secondary)",
          borderRadius: "16px",
          border: "1px solid var(--layer-border)",
        }}
      >
        <h3
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            marginBottom: "1rem",
          }}
        >
          All {brandName} Repair Types
        </h3>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          {REPAIR_TYPES.map((rt) => (
            <span
              key={rt.slug}
              style={{
                padding: "0.5rem 1rem",
                background: "var(--layer)",
                border: "1px solid var(--layer-border)",
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: 500,
              }}
            >
              {rt.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

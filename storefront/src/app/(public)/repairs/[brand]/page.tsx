import Link from "next/link";
import { Metadata } from "next";
import { REPAIR_TYPES } from "@/data/seo-data";
import { fetchRepairCatalog, fetchBrandModels } from "@/lib/api";

export const revalidate = 3600; // ISR: revalidate every hour
export const dynamicParams = true; // Allow on-demand generation of new brand pages

interface BrandPageProps {
  params: Promise<{ brand: string }>;
}

export async function generateStaticParams() {
  const catalog = await fetchRepairCatalog();
  return catalog.brands.map((b) => ({ brand: b.slug }));
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { brand } = await fetchBrandModels(resolvedParams.brand);
  const brandName = brand?.brand || resolvedParams.brand.replace(/-/g, ' ');
  return {
    title: `${brandName} Repair Services in Ringwood | Ali Mobile & Repair`,
    description: `Expert ${brandName} repair services in Ringwood, Melbourne. Screen replacement, battery repair, charging port fix, and more. Under 1 hour, 6-month warranty.`,
  };
}

// ─── Smart Sorting: newest → oldest, highest tier → lowest ──────────────────

const TIER_WEIGHTS: Record<string, number> = {
  'pro max': 4,
  'ultra':   4,
  'pro':     3,
  'plus':    2,
  'mini':    1,
  'air':     1,
  'se':      0,
};

function getGeneration(name: string): number {
  // Extract the largest standalone number (e.g. "iPhone 15 Pro Max" → 15, "Galaxy S24" → 24)
  const nums = name.match(/\b(\d{1,3})\b/g);
  if (!nums) return 0;
  return Math.max(...nums.map(Number));
}

function getTierWeight(name: string): number {
  const lower = name.toLowerCase();
  for (const [tier, weight] of Object.entries(TIER_WEIGHTS)) {
    if (lower.includes(tier)) return weight;
  }
  return 0; // standard model
}

type ModelItem = { model: string; slug: string; repairTypes: { slug: string; name: string; price: number }[] };

function smartSortModels(models: ModelItem[]): ModelItem[] {
  return [...models].sort((a, b) => {
    const genDiff = getGeneration(b.model) - getGeneration(a.model);
    if (genDiff !== 0) return genDiff;
    return getTierWeight(b.model) - getTierWeight(a.model);
  });
}

// Group models into series. E.g. "iPhone 15 Pro Max" → "iPhone 15 Series"
function groupModelsBySeries(
  models: ModelItem[]
): { series: string; models: ModelItem[] }[] {
  const groups: Record<string, ModelItem[]> = {};

  for (const entry of models) {
    const seriesMatch = entry.model.match(
      /^(.+?)\s+(?:Pro\s+Max|Pro|Max|Ultra|Plus|\(.*?\)|Series\s+\d+|SE|mini|Air)/i
    );
    let seriesKey: string;
    if (seriesMatch) {
      seriesKey = seriesMatch[1].trim() + " Series";
    } else {
      seriesKey = entry.model;
    }
    if (!groups[seriesKey]) groups[seriesKey] = [];
    groups[seriesKey].push(entry);
  }

  return Object.entries(groups).map(([series, models]) => ({
    series,
    models,
  }));
}

export default async function BrandSubHubPage({ params }: BrandPageProps) {
  const resolvedParams = await params;
  const { brand: brandEntry } = await fetchBrandModels(resolvedParams.brand);

  const brandName = brandEntry?.brand || resolvedParams.brand.replace(/-/g, ' ');
  const models = brandEntry?.models || [];
  const brandSlug = resolvedParams.brand;
  const sortedModels = smartSortModels(models);
  const seriesGroups = groupModelsBySeries(sortedModels);

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

      {seriesGroups.map((group) => (
        <div key={group.series} className="model-series-section">
          <h2 className="model-series-title">{group.series}</h2>
          <div className="model-series-grid">
            {group.models.map((entry) => {
              // Link to the first available repair type (prefer screen-replacement)
              const defaultRepair =
                entry.repairTypes.find((r) => r.slug === "screen-replacement") ||
                entry.repairTypes[0];
              const repairSlug = defaultRepair?.slug || "screen-replacement";
              return (
                <Link
                  key={entry.slug}
                  href={`/repairs/${brandSlug}/${entry.slug}/${repairSlug}`}
                  className="model-card"
                >
                  <span>{entry.model}</span>
                  <span className="model-card-arrow">→</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}

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

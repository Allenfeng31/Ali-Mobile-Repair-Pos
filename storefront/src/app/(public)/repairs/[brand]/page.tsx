import Link from "next/link";
import { Metadata } from "next";
import { BRANDS, MODELS, REPAIR_TYPES } from "@/data/seo-data";
import { slugify } from "@/lib/inventoryUtils";
import Breadcrumbs from "@/components/Breadcrumbs";

interface BrandPageProps {
  params: Promise<{ brand: string }>;
}

export function generateStaticParams() {
  return BRANDS.map((brand) => ({ brand: slugify(brand) }));
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const brandName =
    BRANDS.find((b) => slugify(b) === resolvedParams.brand) || resolvedParams.brand;
  return {
    title: `${brandName} Repair Services in Ringwood | Ali Mobile & Repair`,
    description: `Expert ${brandName} repair services in Ringwood, Melbourne. Screen replacement, battery repair, charging port fix, and more. Under 1 hour, 6-month warranty.`,
  };
}

// Group models into series. E.g. "iPhone 15 Pro Max" → "iPhone 15 Series"
function groupModelsBySeries(
  models: string[]
): { series: string; models: string[] }[] {
  const groups: Record<string, string[]> = {};

  for (const model of models) {
    // Extract series prefix: take until the first variant keyword (Pro, Max, Ultra, Plus, etc.)
    const seriesMatch = model.match(
      /^(.+?)\s+(?:Pro\s+Max|Pro|Max|Ultra|Plus|\(.*?\)|Series\s+\d+|SE|mini|Air)/i
    );
    let seriesKey: string;
    if (seriesMatch) {
      seriesKey = seriesMatch[1].trim() + " Series";
    } else {
      // Fallback: use the model name itself as the series
      seriesKey = model;
    }
    if (!groups[seriesKey]) groups[seriesKey] = [];
    groups[seriesKey].push(model);
  }

  return Object.entries(groups).map(([series, models]) => ({
    series,
    models,
  }));
}

export default async function BrandSubHubPage({ params }: BrandPageProps) {
  const resolvedParams = await params;
  const brandName =
    BRANDS.find((b) => slugify(b) === resolvedParams.brand) || resolvedParams.brand;
  const models = MODELS[brandName as string] || [];
  const brandSlug = resolvedParams.brand;

  const seriesGroups = groupModelsBySeries(models);

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
            <Link
              href="/repairs"
              style={{ color: "inherit", textDecoration: "none" }}
            >
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
            {group.models.map((model) => {
              const modelSlug = slugify(model);
              return (
                <Link
                  key={model}
                  href={`/repairs/${brandSlug}/${modelSlug}/screen-replacement`}
                  className="model-card"
                >
                  <span>{model}</span>
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

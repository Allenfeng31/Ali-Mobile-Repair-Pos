import Link from "next/link";
import { Metadata } from "next";
import { fetchRepairCatalog } from "@/lib/api";

export const revalidate = 3600; // ISR: revalidate every hour

export const metadata: Metadata = {
  title: "Select Your Device Brand | Ali Mobile & Repair Ringwood",
  description:
    "Choose your device brand to find expert repair services in Ringwood. iPhone, Samsung, iPad, MacBook, Google Pixel, Oppo, and Apple Watch repairs with same-day turnaround.",
};

export default async function RepairsHubPage() {
  const catalog = await fetchRepairCatalog();

  return (
    <div className="page-container">
      <h1
        style={{
          fontSize: "clamp(2rem, 5vw, 3rem)",
          fontWeight: 800,
          textAlign: "center",
          marginBottom: "0.75rem",
          letterSpacing: "-0.5px",
        }}
      >
        Select Your Device Brand
      </h1>
      <p
        style={{
          textAlign: "center",
          opacity: 0.7,
          fontSize: "1.05rem",
          maxWidth: "520px",
          margin: "0 auto 3rem",
        }}
      >
        We repair all major brands — pick yours to see available services and pricing.
      </p>

      <div className="brand-grid">
        {catalog.brands.map((brandEntry) => (
          <Link
            key={brandEntry.slug}
            href={`/repairs/${brandEntry.slug}`}
            className="brand-card"
          >
            <span className="brand-card-icon">{brandEntry.icon}</span>
            <span className="brand-card-name">{brandEntry.brand}</span>
            <span className="brand-card-sub">
              {brandEntry.models.length} model{brandEntry.models.length !== 1 ? 's' : ''}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

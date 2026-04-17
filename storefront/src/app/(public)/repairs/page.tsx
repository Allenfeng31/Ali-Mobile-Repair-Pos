import Link from "next/link";
import { Metadata } from "next";
import { BRANDS, MODELS } from "@/data/seo-data";
import { slugify } from "@/lib/inventoryUtils";

export const metadata: Metadata = {
  title: "Select Your Device Brand | Ali Mobile & Repair Ringwood",
  description:
    "Choose your device brand to find expert repair services in Ringwood. iPhone, Samsung, iPad, MacBook, Google Pixel, Oppo, and Apple Watch repairs with same-day turnaround.",
};

const BRAND_CARDS = [
  { brand: "iPhone", icon: "📱", sub: "iPhone 11 – 15 Pro Max" },
  { brand: "Samsung", icon: "📱", sub: "Galaxy S · Z Fold · Z Flip" },
  { brand: "Google Pixel", icon: "📱", sub: "Pixel 6 – 8 Pro" },
  { brand: "Oppo", icon: "📱", sub: "Find X · Reno · A Series" },
  { brand: "iPad", icon: "📟", sub: "iPad · Air · Pro · Mini" },
  { brand: "MacBook", icon: "💻", sub: "MacBook Pro · Air" },
  { brand: "Apple Watch", icon: "⌚", sub: "Series 9 · Ultra 2 · SE" },
];

export default function RepairsHubPage() {
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
        {BRAND_CARDS.map((card) => {
          const brandSlug = slugify(card.brand);
          const modelCount = MODELS[card.brand]?.length || 0;
          return (
            <Link
              key={card.brand}
              href={`/repairs/${brandSlug}`}
              className="brand-card"
            >
              <span className="brand-card-icon">{card.icon}</span>
              <span className="brand-card-name">{card.brand}</span>
              <span className="brand-card-sub">
                {card.sub} · {modelCount} models
              </span>
            </Link>
          );
        })}
      </div>

      <div
        style={{
          marginTop: "4rem",
          background: "var(--secondary)",
          borderRadius: "20px",
          padding: "2.5rem",
          border: "1px solid var(--layer-border)",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
          Not sure which model you have?
        </h2>
        <p style={{ opacity: 0.7, marginBottom: "1.5rem", fontSize: "1rem" }}>
          Use our Live Quote tool or call us — we&apos;ll identify your device and give you an instant price.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/book-repair" className="primary-btn">
            Get a Live Quote
          </Link>
          <a href="tel:0481058514" className="secondary-btn">
            📞 Call 0481 058 514
          </a>
        </div>
      </div>
    </div>
  );
}

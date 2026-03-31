"use client";

import { useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RawItem {
  id: number;
  name: string;
  model: string;   // stored as "Brand||ServiceName" or just "ServiceName"
  price: number;
  category: string;
  sku?: string;
  stock?: number;
}

interface ParsedItem {
  id: number;
  name: string;
  brand: string;
  service: string;
  price: number;
  category: string;
  deviceType: "phone" | "tablet" | "computer" | "other";
}

// ─── Prefix-based device type detection ─────────────────────────────────────
// Rules:
//   P <brand>  →  phone
//   T <brand>  →  tablet
//   C <brand>  →  computer
//   other      →  other (no grouping)
//   anything else (legacy, no prefix) → phone

function detectDeviceType(brand: string): ParsedItem["deviceType"] {
  if (brand.toLowerCase() === "other") return "other";
  const firstChar = brand.charAt(0).toUpperCase();
  if (firstChar === "P") return "phone";
  if (firstChar === "T") return "tablet";
  if (firstChar === "C") return "computer";
  // Legacy data without prefix: default to phone
  return "phone";
}

// Strip prefix for customer-facing display: "P iPhone" → "iPhone"
function getDisplayBrand(brand: string): string {
  if (/^[PTCptc] .+/.test(brand)) return brand.slice(2).trim();
  return brand;
}

function parseItem(raw: RawItem): ParsedItem {
  let brand = "Other";
  let service = raw.name;

  if (typeof raw.model === "string" && raw.model.includes("||")) {
    const parts = raw.model.split("||");
    brand   = parts[0]?.trim() || "Other";
    service = parts[1]?.trim() || raw.name;
  }

  return {
    id: raw.id,
    name: raw.name,
    brand,
    service,
    price: raw.price ?? 0,
    category: raw.category ?? "",
    deviceType: detectDeviceType(brand),
  };
}

// ─── Device tabs config ───────────────────────────────────────────────────────
const DEVICE_TABS = [
  { key: "phone",    label: "📱 Phone Repair" },
  { key: "tablet",   label: "📟 Tablet Repair" },
  { key: "computer", label: "💻 Computer Repair" },
  { key: "other",    label: "🔧 Other" },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function LiveQuoteCalculator() {
  const [items, setItems]               = useState<ParsedItem[]>([]);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState<ParsedItem["deviceType"]>("phone");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [customBrand, setCustomBrand]   = useState("");
  const [selectedService, setSelectedService] = useState<ParsedItem | null>(null);

  // Fetch & refresh every 60 seconds (real-time sync)
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/inventory");
        if (res.ok) {
          const raw: RawItem[] = await res.json();
          // Filter out accessories and non-repair items (price-list only)
          const repairItems = raw
            .filter(i => !i.category?.toLowerCase().includes("accessor"))
            .map(parseItem);
          setItems(repairItems);
        }
      } catch (_) {}
      finally { setLoading(false); }
    };
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Compute which tabs have items
  const availableTabs = DEVICE_TABS.filter(tab =>
    items.some(i => i.deviceType === tab.key)
  );

  // Items for current tab
  const tabItems = items.filter(i => i.deviceType === activeTab);

  // Brands for current tab (unique, sorted)
  const brands = Array.from(new Set(tabItems.map(i => i.brand))).sort();

  // Services for selected brand
  const services = tabItems.filter(i =>
    selectedBrand === "Other" ? i.brand === "Other" : i.brand === selectedBrand
  );

  const switchTab = (tab: ParsedItem["deviceType"]) => {
    setActiveTab(tab);
    setSelectedBrand("");
    setCustomBrand("");
    setSelectedService(null);
  };

  const switchBrand = (brand: string) => {
    setSelectedBrand(brand);
    setCustomBrand("");
    setSelectedService(null);
  };

  const formatPrice = (item: ParsedItem) => {
    if (!item.price || item.price === 0) return null; // Contact us
    return `from $${item.price.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="form-container" style={{ textAlign: "center", padding: "3rem" }}>
        <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>⏳</div>
        <p style={{ opacity: 0.7 }}>Loading live pricing from our workshop...</p>
      </div>
    );
  }

  return (
    <div className="form-container" style={{ maxWidth: "700px" }}>
      <h2 style={{ marginBottom: "0.5rem", textAlign: "center" }}>Live Repair Quote</h2>
      <p style={{ textAlign: "center", fontSize: "0.85rem", opacity: 0.6, marginBottom: "2rem" }}>
        Prices are live from our POS system and may vary by device condition.
      </p>

      {/* ── Device Type Tabs ─────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {availableTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => switchTab(tab.key)}
            style={{
              padding: "0.55rem 1.1rem",
              borderRadius: "30px",
              border: activeTab === tab.key ? "2px solid var(--primary)" : "2px solid rgba(255,255,255,0.12)",
              background: activeTab === tab.key ? "var(--primary)" : "transparent",
              color: activeTab === tab.key ? "white" : "inherit",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Brand selection ───────────────────────────────────────── */}
      <div className="form-group">
        <label>Select Brand</label>
        <select
          className="form-control"
          value={selectedBrand}
          onChange={e => switchBrand(e.target.value)}
        >
          <option value="">-- Choose Brand --</option>
          {brands.map(b => (
            <option key={b} value={b}>{getDisplayBrand(b)}</option>
          ))}
          <option value="__other__">Other (not listed)</option>
        </select>
      </div>

      {/* Other brand text input */}
      {selectedBrand === "__other__" && (
        <div className="form-group" style={{ animation: "fadeIn 0.3s ease" }}>
          <label>Please describe your device / brand</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. OnePlus 12, Huawei P60..."
            value={customBrand}
            onChange={e => setCustomBrand(e.target.value)}
            style={{ color: "#000" }}
          />
          <p style={{ marginTop: "0.5rem", fontSize: "0.82rem", opacity: 0.65 }}>
            📞 Please contact us for a quote: <strong>0481 058 514</strong>. You can still complete your booking below.
          </p>
        </div>
      )}

      {/* ── Service selection ─────────────────────────────────────── */}
      {selectedBrand && selectedBrand !== "__other__" && (
        <div className="form-group" style={{ animation: "fadeIn 0.3s ease" }}>
          <label>Select Service</label>
          <select
            className="form-control"
            value={selectedService?.id ?? ""}
            onChange={e => {
              const item = services.find(s => s.id === parseInt(e.target.value));
              setSelectedService(item ?? null);
            }}
          >
            <option value="">-- Choose Service --</option>
            {services.map(s => (
              <option key={s.id} value={s.id}>
                {s.service}{s.price > 0 ? ` · from $${s.price.toFixed(2)}` : " · Contact us"}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ── Price card ────────────────────────────────────────────── */}
      {selectedService && (
        <div style={{
          marginTop: "1.5rem",
          padding: "1.5rem",
          background: "var(--layer, rgba(255,255,255,0.06))",
          borderRadius: "14px",
          textAlign: "center",
          border: "1px solid var(--primary-glow, rgba(0,122,255,0.3))",
          animation: "fadeIn 0.4s ease",
        }}>
          <p style={{ fontSize: "0.75rem", opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>
            {selectedService.category}
          </p>
          <h3 style={{ fontSize: "1.15rem", marginBottom: "0.75rem", color: "var(--primary)" }}>
            {selectedService.service}
          </h3>
          {formatPrice(selectedService) ? (
            <>
              <p style={{ fontSize: "2rem", fontWeight: 800, color: "var(--primary)" }}>
                {formatPrice(selectedService)}
              </p>
              <p style={{ fontSize: "0.78rem", opacity: 0.55, marginTop: "0.4rem" }}>
                Final price may vary depending on device condition. No fix, no charge.
              </p>
            </>
          ) : (
            <div style={{ padding: "0.75rem", background: "rgba(0,122,255,0.08)", borderRadius: "10px" }}>
              <p style={{ fontWeight: 600, marginBottom: "0.3rem" }}>📞 Contact us for a quote</p>
              <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>
                <strong>0481 058 514</strong>
              </p>
              <p style={{ fontSize: "0.78rem", opacity: 0.55, marginTop: "0.3rem" }}>
                You can still complete your booking below — we'll confirm the price when you bring the device in.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

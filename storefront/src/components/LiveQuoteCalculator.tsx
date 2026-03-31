"use client";

import { useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RawItem {
  id: number;
  name: string;
  model: string;   // "Brand||ServiceName" or plain "ServiceName"
  price: number;
  category: string;
  sku?: string;
}

interface ParsedItem {
  id: number;
  name: string;
  brand: string; // raw full brand (e.g. "P iPhone", "C MacBook")
  service: string;
  price: number;
  category: string;
  deviceType: "phone" | "tablet" | "computer";
}

// ─── Prefix-based device type detection ──────────────────────────────────────
// P <brand>  → phone    (e.g. "P iPhone", "P Samsung")
// T <brand>  → tablet   (e.g. "T iPad")
// C <brand>  → computer (e.g. "C MacBook")
// No prefix / unknown → phone (legacy data)
// "other" is excluded from the quote tool

function detectDeviceType(brand: string): ParsedItem["deviceType"] {
  const first = brand.charAt(0).toUpperCase();
  if (first === "T") return "tablet";
  if (first === "C") return "computer";
  return "phone"; // P prefix OR legacy no-prefix brands default to phone
}

// Strip prefix for display: "P iPhone" → "iPhone", "C MacBook" → "MacBook"
function displayBrand(brand: string): string {
  if (/^[PTCptc] .+/.test(brand)) return brand.slice(2).trim();
  return brand;
}

function parseItem(raw: RawItem): ParsedItem | null {
  // Skip non-repair items
  const cat = (raw.category || "").toLowerCase();
  if (cat.includes("accessor") || cat === "other") return null;

  let brand = "";
  let serviceName = raw.name;

  if (typeof raw.model === "string" && raw.model.includes("||")) {
    const parts = raw.model.split("||");
    brand = parts[0]?.trim() || "";
    // If the model part (parts[1]) is different from name, it might be just the model name
    // We want the most descriptive name for the service list
    serviceName = raw.name; 
  }

  // Skip items with "other" brand
  if (!brand || brand.toLowerCase() === "other") return null;

  return {
    id: raw.id,
    name: raw.name,
    brand,
    service: serviceName,
    price: raw.price ?? 0,
    category: raw.category,
    deviceType: detectDeviceType(brand),
  };
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { key: "phone"    as const, emoji: "📱", label: "Phone Repair"    },
  { key: "tablet"   as const, emoji: "📟", label: "Tablet Repair"   },
  { key: "computer" as const, emoji: "💻", label: "Computer Repair" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function LiveQuoteCalculator() {
  const [items, setItems]     = useState<ParsedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  const [activeTab, setActiveTab]           = useState<ParsedItem["deviceType"]>("phone");
  const [selectedBrand, setSelectedBrand]   = useState("");
  const [customBrand, setCustomBrand]       = useState("");
  const [selectedService, setSelectedService] = useState<ParsedItem | null>(null);

  // Fetch inventory from the proxy route (the only working path in this Next.js app)
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch("/api/proxy/inventory");
        if (!res.ok) throw new Error(`${res.status}`);
        const raw: RawItem[] = await res.json();
        if (cancelled) return;

        const parsed = raw.map(parseItem).filter(Boolean) as ParsedItem[];
        setItems(parsed);

        // Auto-select the first tab that has items
        const firstAvailable = TABS.find(t => parsed.some(i => i.deviceType === t.key));
        if (firstAvailable) setActiveTab(firstAvailable.key);
      } catch (_) {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const interval = setInterval(load, 60_000); // refresh every 60s
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  // ── Derived data ────────────────────────────────────────────────────────────

  const availableTabs = TABS.filter(t => items.some(i => i.deviceType === t.key));
  const tabItems      = items.filter(i => i.deviceType === activeTab);
  const brands        = Array.from(new Set(tabItems.map(i => i.brand))).sort();
  const services      = tabItems.filter(i => i.brand === selectedBrand);

  // ── Handlers ────────────────────────────────────────────────────────────────

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

  // ── Render helpers ──────────────────────────────────────────────────────────

  const priceStr = (item: ParsedItem) =>
    item.price > 0 ? `from $${item.price.toFixed(2)}` : null;

  // ── Loading / error states ──────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="form-container" style={{ textAlign: "center", padding: "3rem" }}>
        <p style={{ opacity: 0.7 }}>⏳ Loading live pricing from our workshop...</p>
      </div>
    );
  }

  if (error || availableTabs.length === 0) {
    return (
      <div className="form-container" style={{ textAlign: "center", padding: "3rem" }}>
        <p style={{ fontWeight: 600 }}>Could not load repair list.</p>
        <p style={{ marginTop: "0.5rem", opacity: 0.7, fontSize: "0.85rem" }}>
          Please call us: <strong>0481 058 514</strong> or visit us in store.
        </p>
      </div>
    );
  }

  return (
    <div className="form-container" style={{ maxWidth: "680px" }}>
      <h2 style={{ marginBottom: "0.5rem", textAlign: "center" }}>Live Repair Quote</h2>
      <p style={{ textAlign: "center", fontSize: "0.85rem", opacity: 0.6, marginBottom: "2rem" }}>
        Prices are live from our workshop and may vary by device condition.
      </p>

      {/* ── Device type tabs ──────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.75rem", flexWrap: "wrap" }}>
        {availableTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => switchTab(tab.key)}
            style={{
              padding: "0.55rem 1.2rem",
              borderRadius: "30px",
              border: activeTab === tab.key
                ? "2px solid var(--primary)"
                : "2px solid rgba(255,255,255,0.12)",
              background: activeTab === tab.key ? "var(--primary)" : "transparent",
              color: activeTab === tab.key ? "white" : "inherit",
              fontWeight: 700,
              fontSize: "0.88rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      {/* ── Brand ────────────────────────────────────────────────────────── */}
      <div className="form-group">
        <label>Select Brand</label>
        <select
          className="form-control"
          value={selectedBrand}
          onChange={e => switchBrand(e.target.value)}
        >
          <option value="">-- Choose Brand --</option>
          {brands.map(b => (
            <option key={b} value={b}>{displayBrand(b)}</option>
          ))}
          <option value="__other__">Other (not listed)</option>
        </select>
      </div>

      {/* ── Other brand text box ──────────────────────────────────────────── */}
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
            📞 Contact us for a quote: <strong>0481 058 514</strong>. You can still complete your booking below.
          </p>
        </div>
      )}

      {/* ── Service ──────────────────────────────────────────────────────── */}
      {selectedBrand && selectedBrand !== "__other__" && services.length > 0 && (
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
                {s.service}
                {s.price > 0 ? ` · from $${s.price.toFixed(2)}` : " · Contact us"}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ── Price card ───────────────────────────────────────────────────── */}
      {selectedService && (
        <div
          style={{
            marginTop: "1.5rem",
            padding: "1.5rem",
            background: "var(--layer, rgba(255,255,255,0.06))",
            borderRadius: "14px",
            textAlign: "center",
            border: "1px solid var(--primary-glow, rgba(0,122,255,0.3))",
            animation: "fadeIn 0.4s ease",
          }}
        >
          <p style={{ fontSize: "0.72rem", opacity: 0.55, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>
            {selectedService.category} &nbsp;·&nbsp; {displayBrand(selectedService.brand)}
          </p>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.75rem", color: "var(--primary)" }}>
            {selectedService.service}
          </h3>
          {priceStr(selectedService) ? (
            <>
              <p style={{ fontSize: "2rem", fontWeight: 800, color: "var(--primary)" }}>
                {priceStr(selectedService)}
              </p>
              <p style={{ fontSize: "0.78rem", opacity: 0.55, marginTop: "0.4rem" }}>
                Final price may vary depending on device condition. No fix, no charge.
              </p>
            </>
          ) : (
            <div style={{ padding: "0.75rem", background: "rgba(0,122,255,0.08)", borderRadius: "10px" }}>
              <p style={{ fontWeight: 600, marginBottom: "0.3rem" }}>📞 Contact us for a quote</p>
              <p style={{ fontSize: "0.9rem", opacity: 0.85 }}><strong>0481 058 514</strong></p>
              <p style={{ fontSize: "0.78rem", opacity: 0.55, marginTop: "0.3rem" }}>
                You can still complete your booking below — we&apos;ll confirm the price in store.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

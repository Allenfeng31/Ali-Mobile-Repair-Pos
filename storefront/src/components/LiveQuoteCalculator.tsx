"use client";

import { useState, useEffect } from "react";

import { 
  RawItem, ParsedItem, parseItem, displayBrand, TABS, MANUAL_MODELS 
} from "@/lib/inventoryUtils";

interface LiveQuoteCalculatorProps {
  initialBrand?: string;
  initialModel?: string;
  initialService?: string;
  onSelectionChange?: (data: {
    brand: string;
    model: string;
    service: string;
    price: number | null;
    category: string;
  } | null) => void;
}

export default function LiveQuoteCalculator({ 
  initialBrand,
  initialModel,
  initialService,
  onSelectionChange 
}: LiveQuoteCalculatorProps) {
  const [items, setItems]     = useState<ParsedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  const [activeTab, setActiveTab]           = useState<ParsedItem["deviceType"]>("phone");
  const [selectedBrand, setSelectedBrand]   = useState("");
  const [selectedModel, setSelectedModel]   = useState("");
  const [selectedService, setSelectedService] = useState<ParsedItem | null>(null);

  // Custom "Other" inputs
  const [otherBrand, setOtherBrand]     = useState("");
  const [otherModel, setOtherModel]     = useState("");
  const [otherService, setOtherService] = useState("");

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

        // Auto-select tab and defaults
        let defaultTab = "phone" as ParsedItem["deviceType"];
        let defaultBrand = "";
        let defaultModel = "";
        let defaultServiceItem: ParsedItem | null = null;
        let defaultOtherService = "";
        
        if (initialBrand) {
          const targetBrand = decodeURIComponent(initialBrand).toLowerCase().replace(/-/g, ' ');
          const allBrands = Array.from(new Set(parsed.map(i => i.brand)));
          const matchedBrand = allBrands.find(b => 
            displayBrand(b).toLowerCase().replace(/-/g, ' ') === targetBrand ||
            b.toLowerCase().replace(/-/g, ' ') === targetBrand
          );
          
          if (matchedBrand) {
             defaultBrand = matchedBrand;
             const itemWithBrand = parsed.find(i => i.brand === matchedBrand);
             if (itemWithBrand) defaultTab = itemWithBrand.deviceType;
             
             if (initialModel) {
               const targetModel = decodeURIComponent(initialModel).toLowerCase().replace(/-/g, ' ');
               const dbModels = Array.from(new Set(parsed.filter(i => i.brand === matchedBrand).map(i => i.deviceModel)));
               const matchedModel = dbModels.find(m => m.toLowerCase().replace(/-/g, ' ') === targetModel);
               
               let matchedManualModel = "";
               if (!matchedModel) {
                  const mModels = MANUAL_MODELS[defaultTab] || [];
                  matchedManualModel = mModels.find(m => m.toLowerCase().replace(/-/g, ' ') === targetModel) || "";
               }
               
               defaultModel = matchedModel || matchedManualModel;
               
               if (defaultModel && initialService) {
                 const targetService = decodeURIComponent(initialService).toLowerCase().replace(/-/g, ' ');
                 const servicesForModel = parsed.filter(i => i.brand === matchedBrand && i.deviceModel === defaultModel);
                 
                 const matchedService = servicesForModel.find(s => 
                   s.service.toLowerCase().replace(/-/g, ' ') === targetService ||
                   s.service.toLowerCase().replace(/-/g, ' ').includes(targetService) ||
                   targetService.includes(s.service.toLowerCase().replace(/-/g, ' '))
                 );
                 
                 if (matchedService) {
                   defaultServiceItem = matchedService;
                 } else {
                   defaultOtherService = decodeURIComponent(initialService).replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                 }
               }
             }
          }
        }
        
        if (defaultBrand) {
           setActiveTab(defaultTab);
           setSelectedBrand(defaultBrand);
           if (defaultModel) {
             setSelectedModel(defaultModel);
             if (defaultServiceItem) {
               setSelectedService(defaultServiceItem);
             } else if (defaultOtherService) {
               setOtherService(defaultOtherService);
             }
           }
        } else {
          const firstAvailable = TABS.find(t => parsed.some(i => i.deviceType === t.key));
          if (firstAvailable) setActiveTab(firstAvailable.key);
        }
      } catch (_) {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const interval = setInterval(load, 60_000); // refresh every 60s
    return () => { cancelled = true; clearInterval(interval); };
  }, [initialBrand, initialModel, initialService]);


  // Update parent when selection changes
  useEffect(() => {
    if (!onSelectionChange) return;

    if (selectedService || otherBrand || otherModel || otherService) {
      onSelectionChange({
        brand: otherBrand || displayBrand(selectedBrand),
        model: otherModel || selectedModel,
        service: otherService || (selectedService?.service || ""),
        price: selectedService?.price ?? null,
        category: selectedService?.category || activeTab.toUpperCase(),
      });
    } else {
      onSelectionChange(null);
    }
  }, [
    selectedService, 
    selectedBrand, 
    selectedModel, 
    otherBrand, 
    otherModel, 
    otherService, 
    activeTab, 
    onSelectionChange
  ]);

  // ── Derived data ────────────────────────────────────────────────────────────

  const availableTabs = TABS.filter(t => items.some(i => i.deviceType === t.key));
  const tabItems      = items.filter(i => i.deviceType === activeTab);
  
  // Levels: Brand -> Model -> Service
  const brands = Array.from(new Set(tabItems.map(i => i.brand))).sort();
  
  const sanitize = (m: string) => m.toLowerCase().replace(/(th|nd|st|rd)\s*gen(?:eration)?/g, '').replace(/[-"']/g, '').replace(/\s+/g, '');
  
  const dbModels = tabItems.filter(i => i.brand === selectedBrand).map(i => i.deviceModel);
  const manualModels = MANUAL_MODELS[activeTab] || [];
  
  const deduplicatedManual = manualModels.filter(mManual => {
     const cleanManual = sanitize(mManual);
     return !dbModels.some(mDb => {
        const cleanDb = sanitize(mDb);
        return cleanDb === cleanManual || cleanDb.includes(cleanManual) || cleanManual.includes(cleanDb);
     });
  });

  const models = Array.from(new Set([...dbModels, ...deduplicatedManual])).sort();

  
  const services = [
    ...tabItems.filter(i => i.brand === selectedBrand && i.deviceModel === selectedModel),
  ];
  
  // Guarantee core services are always available for Tablet/Computer/Watch
  if (activeTab === "tablet" || activeTab === "computer" || activeTab === "watch") {
    const CORE_SERVICES = [
      { name: activeTab === "watch" ? "Screen Repair" : "Screen Repair", category: activeTab.toUpperCase() },
      { name: activeTab === "watch" ? "Battery Replacement" : "Battery Replacement", category: activeTab.toUpperCase() },
      { name: "Charging Port Replacement", category: activeTab.toUpperCase() }
    ];

    CORE_SERVICES.forEach(core => {
      const exists = services.some(s => s.service.toLowerCase().includes(core.name.toLowerCase()));
      if (!exists) {
        services.push({ 
          id: -(Math.floor(Math.random() * 1000) + 100), 
          service: `${core.name} (Request Quote)`, 
          price: 0, 
          category: core.category 
        } as ParsedItem);
      }
    });
  }

  // ── Handlers ────────────────────────────────────────────────────────────────

  const resetAll = () => {
    setSelectedBrand("");
    setSelectedModel("");
    setSelectedService(null);
    setOtherBrand("");
    setOtherModel("");
    setOtherService("");
  };

  const switchTab = (tab: ParsedItem["deviceType"]) => {
    setActiveTab(tab);
    resetAll();
  };

  const switchBrand = (brand: string) => {
    setSelectedBrand(brand);
    setSelectedModel("");
    setSelectedService(null);
    setOtherBrand("");
    setOtherModel("");
    setOtherService("");
  };

  const switchModel = (model: string) => {
    setSelectedModel(model);
    setSelectedService(null);
    setOtherModel("");
    setOtherService("");
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

      {/* ── Other Brand Input ────────────────────────────────────────────── */}
      {selectedBrand === "__other__" && (
        <div className="form-group" style={{ animation: "fadeIn 0.3s ease" }}>
          <label>Device Brand</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. OnePlus, Huawei, Pixel..."
            value={otherBrand}
            onChange={e => setOtherBrand(e.target.value)}
            style={{ color: "#000" }}
          />
        </div>
      )}

      {/* ── Model ────────────────────────────────────────────────────────── */}
      {((selectedBrand && selectedBrand !== "__other__") || otherBrand) && (
        <div className="form-group" style={{ animation: "fadeIn 0.3s ease" }}>
          <label>Select Model</label>
          <select
            className="form-control"
            value={selectedModel}
            onChange={e => switchModel(e.target.value)}
          >
            <option value="">-- Choose Model --</option>
            {models.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
            <option value="__other__">Other Model</option>
          </select>
        </div>
      )}

      {/* ── Other Model Input ────────────────────────────────────────────── */}
      {selectedModel === "__other__" && (
        <div className="form-group" style={{ animation: "fadeIn 0.3s ease" }}>
          <label>Device Model</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. Galaxy S24 Ultra, P60 Pro..."
            value={otherModel}
            onChange={e => setOtherModel(e.target.value)}
            style={{ color: "#000" }}
          />
        </div>
      )}

      {/* ── Service ──────────────────────────────────────────────────────── */}
      {((selectedModel && selectedModel !== "__other__") || otherModel) && (
        <div className="form-group" style={{ animation: "fadeIn 0.3s ease" }}>
          <label>Select Service</label>
          <select
            className="form-control"
            value={selectedService?.id ?? (otherService ? "__other__" : "")}
            onChange={e => {
              const val = e.target.value;
              if (val === "__other__") {
                setSelectedService(null);
                setOtherService("Repair Service");
              } else {
                const item = services.find(s => s.id === parseInt(val));
                setSelectedService(item ?? null);
                setOtherService("");
              }
            }}
          >
            <option value="">-- Choose Service --</option>
            {services.map(s => (
              <option key={s.id} value={s.id}>
                {s.service}
              </option>
            ))}
            <option value="__other__">Other / Mixed Repairs</option>
          </select>
        </div>
      )}

      {/* ── Other Service Input ──────────────────────────────────────────── */}
      {otherService && !selectedService && (
        <div className="form-group" style={{ animation: "fadeIn 0.3s ease" }}>
          <label>Repair Description</label>
          <textarea
            className="form-control"
            rows={2}
            placeholder="Describe the issue (e.g. water damage, won't turn on...)"
            value={otherService === "Repair Service" ? "" : otherService}
            onChange={e => setOtherService(e.target.value)}
            style={{ color: "#000", resize: "none" }}
          />
        </div>
      )}

      {/* ── Price card ───────────────────────────────────────────────────── */}
      {(selectedService || (otherBrand || otherModel || otherService)) && (
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
            {selectedService?.category || activeTab.toUpperCase()} &nbsp;·&nbsp; 
            {otherBrand || displayBrand(selectedBrand)}
          </p>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.75rem", color: "var(--primary)" }}>
            {otherModel || selectedModel} {otherService || selectedService?.service}
          </h3>
          
          {selectedService && priceStr(selectedService) ? (
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
              <p style={{ fontSize: "1.2rem", fontWeight: 700 }}>0481 058 514</p>
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

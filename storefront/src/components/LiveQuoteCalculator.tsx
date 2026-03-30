"use client";

import { useState, useEffect } from "react";

interface InventoryItem {
  id: number;
  name: string;
  model: string;
  price: number;
  category: string;
}

export default function LiveQuoteCalculator() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInventory() {
      try {
        const res = await fetch("/api/proxy/inventory");
        if (res.ok) {
          const data = await res.json();
          setInventory(data);
        }
      } catch (err) {
        console.error("Failed to fetch inventory", err);
      } finally {
        setLoading(false);
      }
    }
    fetchInventory();
  }, []);

  // Helper to extract brands from "Brand||Model" or just product name
  const brands = Array.from(new Set(inventory.map(item => {
    if (item.model.includes("||")) return item.model.split("||")[0];
    if (item.name.toLowerCase().includes("ipad")) return "iPad";
    if (item.name.toLowerCase().includes("iphone")) return "iPhone";
    return "Other";
  })));

  const filteredModels = Array.from(new Set(inventory
    .filter(item => {
      const brand = item.model.includes("||") ? item.model.split("||")[0] : 
                   (item.name.toLowerCase().includes("ipad") ? "iPad" : 
                    (item.name.toLowerCase().includes("iphone") ? "iPhone" : "Other"));
      return brand === selectedBrand;
    })
    .map(item => item.model.includes("||") ? item.model.split("||")[1] : item.model || "General")
  ));

  const filteredItems = inventory.filter(item => {
    const model = item.model.includes("||") ? item.model.split("||")[1] : item.model || "General";
    return model === selectedModel;
  });

  if (loading) return <div style={{ textAlign: "center", padding: "2rem" }}>Loading repair list...</div>;

  return (
    <div className="form-container">
      <h2 style={{ marginBottom: "1.5rem", textAlign: "center" }}>Live Repair Quote</h2>
      
      <div className="form-group">
        <label>Select Brand / Device Category</label>
        <select 
          className="form-control" 
          value={selectedBrand} 
          onChange={(e) => {
            setSelectedBrand(e.target.value);
            setSelectedModel("");
            setSelectedItem(null);
          }}
        >
          <option value="">-- Choose Brand --</option>
          {brands.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {selectedBrand && (
        <div className="form-group" style={{ animation: "fadeIn 0.3s ease" }}>
          <label>Select Model</label>
          <select 
            className="form-control" 
            value={selectedModel} 
            onChange={(e) => {
              setSelectedModel(e.target.value);
              setSelectedItem(null);
            }}
          >
            <option value="">-- Choose Model --</option>
            {filteredModels.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      )}

      {selectedModel && (
        <div className="form-group" style={{ animation: "fadeIn 0.3s ease" }}>
          <label>Select Service / Repair Item</label>
          <select 
            className="form-control" 
            value={selectedItem?.id || ""} 
            onChange={(e) => {
              const item = filteredItems.find(i => i.id === parseInt(e.target.value));
              setSelectedItem(item || null);
            }}
          >
            <option value="">-- Choose Service --</option>
            {filteredItems.map(item => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
            <option value="other">Other / Custom Repair</option>
          </select>
        </div>
      )}

      {selectedItem && (
        <div style={{ marginTop: "2rem", padding: "1.5rem", background: "var(--layer)", borderRadius: "10px", textAlign: "center", border: "1px solid var(--primary-glow)", animation: "fadeIn 0.5s ease" }}>
          <h3 style={{ fontSize: "1.2rem", color: "var(--primary)", marginBottom: "0.5rem" }}>
            {selectedItem.name}
          </h3>
          <p style={{ fontSize: "2.2rem", fontWeight: "800" }}>
            {selectedItem.price === 0 ? (
              <span style={{ fontSize: "1.1rem", opacity: 0.8 }}>Please contact us: 0481058514</span>
            ) : (
              `$${selectedItem.price}`
            )}
          </p>
          <p style={{ fontSize: "0.8rem", opacity: 0.6, marginTop: "0.5rem" }}>
            Live price from our POS system.
          </p>
        </div>
      )}

      {selectedModel === "other" && (
        <div style={{ marginTop: "2rem", padding: "1.5rem", background: "var(--layer)", borderRadius: "10px", textAlign: "center" }}>
          <p>Please contact us for custom orders: <strong>0481 058 514</strong></p>
        </div>
      )}
    </div>
  );
}

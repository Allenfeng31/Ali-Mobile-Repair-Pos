'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface RawItem {
  id: number;
  name: string;
  model: string;
  price: number;
  category: string;
}

interface ParsedItem {
  brand: string;
  deviceModel: string;
  service: string;
  price: number;
  deviceType: string;
}

function detectDeviceType(brand: string): string {
  const first = brand.trim().charAt(0).toUpperCase();
  if (first === "T") return "tablet";
  if (first === "C") return "computer";
  if (first === "W") return "watch";
  return "phone";
}

function parseItem(raw: RawItem): ParsedItem | null {
  const cat = (raw.category || "").toLowerCase();
  if (cat.includes("accessor") || cat === "other") return null;

  let brand = "";
  let modelName = "";
  
  if (typeof raw.model === "string") {
    let parts = raw.model.split(/\|\||\|/).map(p => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
       brand = parts[0];
       modelName = parts.slice(1).join(" ");
       if (brand.toLowerCase() === "other" && parts.length >= 3) {
          brand = parts[1];
          modelName = parts.slice(2).join(" ");
       }
    } else if (parts.length === 1) {
       brand = parts[0];
    }
  }

  if (!brand || brand.toLowerCase() === "other") return null;

  return {
    brand: brand.replace(/^[PTCWptcw] .+/, match => match.slice(2).trim()),
    deviceModel: modelName || "Other",
    service: raw.name,
    price: raw.price || 0,
    deviceType: detectDeviceType(brand),
  };
}

import QuoteRequestModal from './QuoteRequestModal';

export default function LivePricingGrid({ deviceType, defaultItems, title }: { deviceType: string, defaultItems: any[], title: string }) {
  const [items, setItems] = useState<ParsedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ model: string, service: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchPrices = async () => {
      try {
        const res = await fetch("/api/proxy/inventory");
        if (!res.ok) throw new Error("Failed to fetch");
        const raw: RawItem[] = await res.json();
        if (cancelled) return;

        const parsed = raw.map(parseItem).filter(Boolean) as ParsedItem[];
        // Include $0 items now to allow for Quote on Request
        const filtered = parsed.filter(i => i.deviceType === deviceType);
        
        let eligibleItems = filtered.filter(i => 
          !i.service.toLowerCase().includes("protector") &&
          !i.service.toLowerCase().includes("case") &&
          !i.service.toLowerCase().includes("tempered glass") &&
          !i.service.toLowerCase().includes("cover")
        );

        if (deviceType === "phone") {
           eligibleItems = eligibleItems.filter(i => {
              const lower = i.deviceModel.toLowerCase();
              if (lower.includes("iphone 5") || lower.includes("iphone 6") || lower.includes("iphone 7") || lower.includes("iphone 8")) {
                 return false;
              }
              return true;
           });
        }
        
        const screenKeywords = ["screen", "glass", "digitizer", "display", "lcd", "oled"];
        const batteryKeywords = ["battery"];

        // Group by model, take top 5
        const uniqueModels = Array.from(new Set(eligibleItems.map(i => i.deviceModel))).slice(0, 5);
        
        const dynamicDisplayList = uniqueModels.map(model => {
          const modelItems = eligibleItems.filter(i => i.deviceModel === model);
          
          // 1. Try to find a screen repair
          const screenItem = modelItems.find(i => screenKeywords.some(kw => i.service.toLowerCase().includes(kw)));
          if (screenItem) return screenItem;
          
          // 2. Try to find a battery repair
          const batteryItem = modelItems.find(i => batteryKeywords.some(kw => i.service.toLowerCase().includes(kw)));
          if (batteryItem) return batteryItem;
          
          // 3. Fallback to any valid repair
          return modelItems[0];
        }).filter(Boolean);

        if (dynamicDisplayList.length > 0) {
          setItems(dynamicDisplayList);
        }
      } catch (error) {
        console.error("Error fetching live prices:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPrices();
    return () => { cancelled = true; };
  }, [deviceType]);

  const displayList = items.length > 0 ? items : defaultItems;

  const handleQuoteClick = (model: string, service: string) => {
    setSelectedItem({ model, service });
    setModalOpen(true);
  };

  return (
    <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>{title}</h2>
      
      <div style={{ overflowX: 'auto', border: '1px solid var(--layer-border)', borderRadius: '10px', background: 'var(--secondary)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--layer)', borderBottom: '1px solid var(--layer-border)' }}>
              <th style={{ padding: '1rem', fontWeight: 'bold' }}>Model</th>
              <th style={{ padding: '1rem', fontWeight: 'bold' }}>Service</th>
              <th style={{ padding: '1rem', fontWeight: 'bold', textAlign: 'right' }}>Price</th>
            </tr>
          </thead>
          <tbody>
            {displayList.map((item, i) => (
              <tr key={i} style={{ borderBottom: i === displayList.length - 1 ? 'none' : '1px solid var(--layer-border)' }}>
                <td style={{ padding: '1rem', fontWeight: 600 }}>{item.deviceModel || item.model}</td>
                <td style={{ padding: '1rem', opacity: 0.8 }}>{item.service}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  {item.price > 0 ? (
                    <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Starting at ${item.price}</span>
                  ) : (
                    <button 
                      onClick={() => handleQuoteClick(item.deviceModel || (item as any).model, item.service)}
                      style={{ 
                        background: 'var(--primary)', 
                        color: 'white', 
                        border: 'none', 
                        padding: '4px 12px', 
                        borderRadius: '6px', 
                        fontSize: '0.85rem', 
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Request Quote
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(0,122,255,0.05)', borderRadius: '10px', border: '1px solid var(--layer-border)' }}>
        <p style={{ fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>
          <strong>Note:</strong> Prices are queried live from our backend POS system. 
          If you want to check the price for other {deviceType} models, please check out our <Link href="/book-repair" style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 'bold' }}>Live Repair Quote</Link>.
        </p>
      </div>

      {modalOpen && selectedItem && (
        <QuoteRequestModal 
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          deviceModel={selectedItem.model}
          repairType={selectedItem.service}
        />
      )}
    </div>
  );
}


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
  
  if (typeof raw.model === "string" && raw.model.includes("||")) {
    const parts = raw.model.split("||");
    brand = parts[0]?.trim() || "";
    modelName = parts[1]?.trim() || "";
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

export default function LivePricingGrid({ deviceType, defaultItems, title }: { deviceType: string, defaultItems: any[], title: string }) {
  const [items, setItems] = useState<ParsedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchPrices = async () => {
      try {
        const res = await fetch("/api/proxy/inventory");
        if (!res.ok) throw new Error("Failed to fetch");
        const raw: RawItem[] = await res.json();
        if (cancelled) return;

        const parsed = raw.map(parseItem).filter(Boolean) as ParsedItem[];
        const filtered = parsed.filter(i => i.deviceType === deviceType && i.price > 0);
        
        let eligibleItems = filtered;
        if (deviceType === "phone") {
           eligibleItems = filtered.filter(i => {
              const lower = i.deviceModel.toLowerCase();
              if (lower.includes("iphone 5") || lower.includes("iphone 6") || lower.includes("iphone 7") || lower.includes("iphone 8")) {
                 return false;
              }
              return true;
           });
        }
        
        // Query the most serviced models dynamically
        const uniqueModels = Array.from(new Set(eligibleItems.map(i => i.deviceModel))).slice(0, 5);
        const dynamicDisplayList = uniqueModels.map(model => {
          const screenItem = eligibleItems.find(i => i.deviceModel === model && i.service.toLowerCase().includes("screen"));
          const batteryItem = eligibleItems.find(i => i.deviceModel === model && i.service.toLowerCase().includes("battery"));
          return screenItem || batteryItem || eligibleItems.find(i => i.deviceModel === model)!;
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
                <td style={{ padding: '1rem', color: 'var(--primary)', fontWeight: 'bold', textAlign: 'right' }}>
                  Starting at ${item.price}
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
    </div>
  );
}

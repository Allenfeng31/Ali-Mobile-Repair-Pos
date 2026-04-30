export interface RawItem {
  id: number;
  name: string;
  model: string;   // "Brand||ServiceName" or plain "ServiceName"
  device_model?: string; // Official AU Model Code
  price: number;
  category: string;
  sku?: string;
  quality_grade?: string;
}

export interface ParsedItem {
  id: number;
  name: string;
  brand: string;      // raw full brand (e.g. "P iPhone", "C MacBook")
  deviceModel: string; // The model name (e.g. "iPhone 13 Pro")
  modelCode?: string; // e.g. "SM-S931B, A3102"
  service: string;     // The service part (e.g. "Screen Replacement")
  price: number;
  category: string;
  deviceType: "phone" | "tablet" | "computer" | "watch";
  quality_grade: string;
}

export function slugify(text: string): string {
  if (!text) return "";
  return text.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/** 
 * Safely format URL params protecting against Next.js _tree.segment leaks.
 */
export function formatDynamicParam(param: string): string {
  if (!param || param.includes('_tree') || param.includes('%5BCategory%5D') || param.includes('%5Bbrand%5D')) return '';
  // decode in case it's URI encoded
  let decoded = param;
  try {
    decoded = decodeURIComponent(param);
  } catch (e) {
    // ignore
  }

  const Dictionary: Record<string, string> = {
    "iphone": "iPhone",
    "ipad": "iPad",
    "macbook": "MacBook",
    "samsung": "Samsung"
  };

  return decoded.split('-').map(w => {
    const lower = w.toLowerCase();
    if (Dictionary[lower]) return Dictionary[lower];
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(' ');
}

// ─── Prefix-based device type detection ──────────────────────────────────────
export function detectDeviceType(brand: string): ParsedItem["deviceType"] {
  const first = brand.trim().charAt(0).toUpperCase();
  if (first === "T") return "tablet";
  if (first === "C") return "computer";
  if (first === "W") return "watch";
  return "phone"; // P prefix OR legacy no-prefix brands default to phone
}

// Strip prefix for display: "P iPhone" → "iPhone", "C MacBook" → "MacBook"
export function displayBrand(brand: string): string {
  if (/^[PTCWptcw] .+/.test(brand)) return brand.slice(2).trim();
  return brand;
}

/**
 * Formats device title by deduplicating brand and model names.
 * e.g. Brand="iPhone", Model="iPhone 17 Pro Max" -> "iPhone 17 Pro Max"
 * e.g. Brand="Samsung", Model="Galaxy S24" -> "Samsung Galaxy S24"
 */
export function formatDeviceTitle(brand: string, model: string): string {
  if (!brand && !model) return "New Device";
  if (!brand) return model;
  if (!model) return displayBrand(brand);
  
  const b = displayBrand(brand);
  if (model.toLowerCase().includes(b.toLowerCase())) {
    return model;
  }
  return `${b} ${model}`;
}

export function parseItem(raw: RawItem): ParsedItem | null {
  // Skip non-repair items
  const cat = (raw.category || "").toLowerCase();
  if (cat.includes("accessor") || cat === "other") return null;

  let brand = "";
  let modelName = "";
  let serviceName = raw.name;

  // Split standardized model field: "P Brand||ModelName" or "Other||Brand|ModelName"
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

  // Skip items with "other" brand
  if (!brand || brand.toLowerCase() === "other") return null;

  // Fix for MacBooks and iPads where model field might contain service name
  const COMMON_SERVICES = [
    "Screen Replacement", "Battery Replacement", "Charging Port Repair", "Charging Port Replacement",
    "Logic Board Repair", "Screen Repair", "Battery Service", "Back Camera", "Back Camera Replacement", 
    "Front Camera", "Front Camera Replacement", "Charging Port", "Logic Board", "Back Glass", "Back Housing", "Back Housing Replacement"
  ];

  for (const service of COMMON_SERVICES) {
    if (modelName.toLowerCase().endsWith(service.toLowerCase())) {
      const regex = new RegExp(`\\s+${service.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}$`, "i");
      modelName = modelName.replace(regex, "").trim();
      serviceName = raw.name.includes(service) ? service : raw.name;
    }
  }

  // If we have a model name, try to extract the service part from the full name
  if (modelName && serviceName.toLowerCase().includes(modelName.toLowerCase()) && !modelName.toLowerCase().includes("service")) {
    const regex = new RegExp(modelName.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&"), "i");
    serviceName = serviceName.replace(regex, "").trim();
    serviceName = serviceName.charAt(0).toUpperCase() + serviceName.slice(1);
  }

  if (!serviceName || serviceName.length < 3) {
    serviceName = raw.name || "Repair Service";
  }

  return {
    id: raw.id,
    name: raw.name,
    brand,
    deviceModel: modelName || "Other Model",
    modelCode: raw.device_model || undefined,
    service: serviceName,
    price: raw.price ?? 0,
    category: raw.category,
    deviceType: detectDeviceType(brand),
    quality_grade: raw.quality_grade || "Standard",
  };
}

export const TABS = [
  { key: "phone"    as const, emoji: "📱", label: "Phone Repair"    },
  { key: "tablet"   as const, emoji: "📟", label: "Tablet Repair"   },
  { key: "computer" as const, emoji: "💻", label: "Computer Repair" },
  { key: "watch"    as const, emoji: "⌚", label: "Watch Repair"    },
];

export const MANUAL_MODELS: Record<string, string[]> = {
  "tablet": [
    "iPad mini 4", "iPad mini 5", "iPad mini 6", "iPad mini 7 (A17 Pro)",
    "iPad 5th Generation", "iPad 6th Generation", "iPad 7th Generation", "iPad 8th Generation", "iPad 9th Generation", "iPad 10th Generation",
    "iPad Air 4", "iPad Air 5", "iPad Air M2 (11-inch)", "iPad Air M2 (13-inch)",
    "iPad Pro 11-inch (M4)", "iPad Pro 13-inch (M4)", "iPad Pro 11-inch (Gen 1-4)", "iPad Pro 12.9-inch (Gen 3-6)"
  ],
  "computer": [
    "MacBook Pro 14 (M1/M2/M3)", "MacBook Pro 16 (M1/M2/M3)", "MacBook Pro 13 (M1/M2)",
    "MacBook Air 13 (M1/M2/M3)", "MacBook Air 15 (M2/M3)", "MacBook (12-inch Retina)"
  ],
  "watch": [
    "Apple Watch Series 3", "Apple Watch Series 4", "Apple Watch Series 5", "Apple Watch Series 6",
    "Apple Watch SE (1st Gen)", "Apple Watch Series 7", "Apple Watch Series 8", "Apple Watch Ultra",
    "Apple Watch SE (2nd Gen)", "Apple Watch Series 9", "Apple Watch Ultra 2", "Apple Watch Series 10"
  ]
};

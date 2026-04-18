export const BRANDS = ["iPhone", "Samsung", "Oppo", "Google Pixel", "iPad", "MacBook", "Apple Watch"];

export const MODELS: Record<string, string[]> = {
  "iPhone": ["iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15", "iPhone 14 Pro Max", "iPhone 14 Pro", "iPhone 14", "iPhone 13 Pro Max", "iPhone 13 Pro", "iPhone 13", "iPhone 12 Pro Max", "iPhone 12", "iPhone 11"],
  "Samsung": ["Galaxy S24 Ultra", "Galaxy S23 Ultra", "Galaxy S22 Ultra", "Galaxy S21 Ultra", "Galaxy Z Fold 5", "Galaxy Z Flip 5"],
  "Oppo": ["Find X5 Pro", "Reno 8 Pro", "A96"],
  "Google Pixel": ["Pixel 8 Pro", "Pixel 7 Pro", "Pixel 6 Pro"],
  "iPad": ["iPad Pro 12.9-inch (M2)", "iPad Pro 11-inch (M4)", "iPad Air (M2)", "iPad mini 6"],
  "MacBook": ["MacBook Pro 14 (M3)", "MacBook Pro 16 (M3)", "MacBook Air (M3)"],
  "Apple Watch": ["Apple Watch Ultra 2", "Apple Watch Series 9", "Apple Watch Series 10"]
};

export const REPAIR_TYPES = [
  { slug: "screen-replacement", name: "Screen Replacement" },
  { slug: "battery-replacement", name: "Battery Replacement" },
  { slug: "charging-port-replacement", name: "Charging Port Replacement" },
  { slug: "back-housing-replacement", name: "Back Housing Replacement" },
  { slug: "camera-repair", name: "Camera Repair" },
  { slug: "water-damage-repair", name: "Water Damage Recovery" }
];

export const LSI_KEYWORDS = {
  devices: {
    phone: ["smartphone", "mobile phone", "device", "cell phone", "handset"],
    tablet: ["tablet", "pad", "device", "touchscreen device"],
    laptop: ["laptop", "notebook", "MacBook", "computer", "machine"]
  },
  components: {
    screen: ["display", "LCD", "OLED panel", "digitizer", "front glass", "touch screen"],
    battery: ["power cell", "battery unit", "power source"],
    chargingPort: ["charging port", "dock connector", "USB-C port", "Lightning port", "charging socket"]
  },
  issues: {
    screenDamage: ["cracked screen", "shattered display", "broken glass", "unresponsive touch", "black spots on display"],
    batteryDrain: ["battery draining fast", "not holding charge", "unexpected shutdowns", "swollen battery"],
    waterDamage: ["water damage", "liquid damage", "spill recovery", "moisture damage"]
  },
  actions: {
    repair: ["repair", "fix", "replacement", "restore", "service"],
    evaluate: ["diagnostic", "assessment", "troubleshooting", "check-up"]
  }
};

export const TARGET_SUBURBS = [
  { name: "Ringwood", context: "We are locally based right here in Ringwood Square." },
  { name: "Ringwood East", context: "Just a 5-minute drive down Maroondah Highway." },
  { name: "Ringwood North", context: "A short trip down Warrandyte Road with easy parking when you arrive." },
  { name: "Heathmont", context: "Only 5 minutes away via Canterbury Road." },
  { name: "Croydon", context: "Less than 10 minutes drive down Mt Dandenong Road." },
  { name: "Mitcham", context: "A quick 5-minute trip on Maroondah Highway or EastLink." },
  { name: "Nunawading", context: "Easily accessible via the Maroondah Highway, less than 10 minutes away." },
  { name: "Wantirna", context: "A fast 10-minute drive straight up EastLink." },
  { name: "Bayswater", context: "Just 10 minutes away via Mountain Highway." },
  { name: "Vermont", context: "A quick 10-minute drive via Canterbury Road." },
  { name: "Mooroolbark", context: "About 15 minutes away, with plenty of free parking at our Ringwood Square kiosk." },
  { name: "Warranwood", context: "A simple 10-minute drive down Wonga Road." }
];

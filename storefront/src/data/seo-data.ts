export const BRANDS = ["iPhone", "Samsung", "Oppo", "Google Pixel", "Sony", "iPad", "Lenovo", "MacBook", "Apple Watch"];

export const MODELS: Record<string, string[]> = {
  "iPhone": [
    "iPhone 17 Pro Max",
    "iPhone 17 Pro",
    "iPhone 17 Air",
    "iPhone 17",
    "iPhone 17e",
    "iPhone 16 Pro Max",
    "iPhone 16 Pro",
    "iPhone 16 Plus",
    "iPhone 16",
    "iPhone 16e",
    "iPhone 15 Pro Max",
    "iPhone 15 Pro",
    "iPhone 15 Plus",
    "iPhone 15",
    "iPhone 14 Pro Max",
    "iPhone 14 Pro",
    "iPhone 14 Plus",
    "iPhone 14",
    "iPhone 13 Pro Max",
    "iPhone 13 Pro",
    "iPhone 13",
    "iPhone 12 Pro Max",
    "iPhone 12 Pro",
    "iPhone 12",
    "iPhone 11 Pro Max",
    "iPhone 11 Pro",
    "iPhone 11"
  ],
  "Samsung": [
    "Galaxy S25 Ultra",
    "Galaxy S25 Plus",
    "Galaxy S25",
    "Galaxy S24 Ultra",
    "Galaxy S24 Plus",
    "Galaxy S24",
    "Galaxy S23 Ultra",
    "Galaxy S23 Plus",
    "Galaxy S23",
    "Galaxy S22 Ultra",
    "Galaxy S22",
    "Galaxy S21 Ultra",
    "Galaxy Z Fold 6",
    "Galaxy Z Flip 6",
    "Galaxy Z Fold 5",
    "Galaxy Z Flip 5",
    "Galaxy A21s",
    "Galaxy A7",
    "Galaxy A5",
    "Galaxy Tab S10 FE",
    "Galaxy Tab S8 Ultra",
    "Galaxy Tab A 10.1 2019",
    "Galaxy Tab A7",
    "Galaxy Tab S5e"
  ],
  "Oppo": [
    "Find X7 Ultra",
    "Find X5 Pro",
    "Find X3 Pro",
    "Reno 8 Pro",
    "A96",
    "A76"
  ],
  "Google Pixel": [
    "Pixel 9 Pro XL",
    "Pixel 9 Pro",
    "Pixel 9",
    "Pixel 8 Pro",
    "Pixel 8",
    "Pixel 7 Pro",
    "Pixel 7",
    "Pixel 6 Pro",
    "Pixel 6"
  ],
  "Sony": [
    "Xperia 1"
  ],
  "iPad": [
    "iPad 11th Generation",
    "iPad 10th Generation",
    "iPad 9th Generation",
    "iPad Pro 12.9-inch (M2)",
    "iPad Pro 11-inch (M4)",
    "iPad Pro 11-inch 4th Generation",
    "iPad Air (M2)",
    "iPad mini 6"
  ],
  "Lenovo": [
    "Lenovo Tab Extreme TB-570FU",
    "Lenovo Tab M10 Gen 3 TB-328FU",
    "Lenovo Tab M10 Plus Gen 3 TB-125FU / TB-128FU",
    "Lenovo Tab M10 HD 2nd Gen TB-X306F",
    "Lenovo Tab M7 3rd Gen TB-7305F",
    "Lenovo Tab M8 Gen 4 TB-300FU",
    "Lenovo Tab P11 Gen 2 TB-350FU",
    "Lenovo Tab P11 Plus TB-J616F",
    "Lenovo Tab P11 Pro Gen 2 TB-132FU",
    "Lenovo Tab P11 TB-J606F",
    "Lenovo Tab P12 Pro TB-Q706F",
    "Lenovo Tab P12 TB-370FU",
    "Lenovo Yoga Smart Tab YT-X705F",
    "Lenovo Yoga Tab 11 YT-J706F"
  ],
  "MacBook": [
    "MacBook Pro 14/16 M1 Pro/Max 2021",
    "MacBook Pro 13 M1 2020",
    "MacBook Pro 14 (M3)",
    "MacBook Pro 16 (M3)",
    "MacBook Air (M3)",
    "MacBook Air M2"
  ],
  "Apple Watch": [
    "Apple Watch Ultra 2",
    "Apple Watch Series 10",
    "Apple Watch Series 9",
    "Apple Watch Series 8",
    "Apple Watch Series 7",
    "Apple Watch SE"
  ]
};

export const REPAIR_TYPES = [
  { slug: "screen-replacement", name: "Screen Replacement" },
  { slug: "battery-replacement", name: "Battery Replacement" },
  { slug: "charging-port-replacement", name: "Charging Port Replacement" },
  { slug: "back-housing-replacement", name: "Back Housing Replacement" },
  { slug: "front-camera-replacement", name: "Front Camera Replacement" },
  { slug: "back-camera-replacement", name: "Back Camera Replacement" },
  { slug: "camera-repair", name: "Camera Repair" },
  { slug: "water-damage-repair", name: "Water Damage Cleaning / Assessment" },
  { slug: "logic-board-repair", name: "Logic Board Repair" },
  { slug: "flex-cable", name: "Flex Cable" }
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

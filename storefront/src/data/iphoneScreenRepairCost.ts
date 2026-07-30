export const IPHONE_SCREEN_REPAIR_COST_SLUG = "how-much-does-iphone-screen-repair-cost-australia";

export type ScreenPrice = number | null;

export interface IPhoneScreenRepairPrice {
  model: string;
  lcdInCell: ScreenPrice;
  softOled: ScreenPrice;
  originalScreen: ScreenPrice;
}

export const IPHONE_SCREEN_REPAIR_PRICES: IPhoneScreenRepairPrice[] = [
  { model: "iPhone 17 Pro Max", lcdInCell: 190, softOled: 320, originalScreen: 599 },
  { model: "iPhone 17 Pro", lcdInCell: 190, softOled: 290, originalScreen: 540 },
  { model: "iPhone 17", lcdInCell: 190, softOled: 250, originalScreen: 470 },
  { model: "iPhone 17e", lcdInCell: 139, softOled: 179, originalScreen: 250 },
  { model: "iPhone 17 Air", lcdInCell: null, softOled: null, originalScreen: 540 },
  { model: "iPhone 16 Pro Max", lcdInCell: 190, softOled: 270, originalScreen: 540 },
  { model: "iPhone 16 Plus", lcdInCell: 170, softOled: 240, originalScreen: 350 },
  { model: "iPhone 16 Pro", lcdInCell: 190, softOled: 270, originalScreen: 450 },
  { model: "iPhone 16", lcdInCell: 170, softOled: 220, originalScreen: 370 },
  { model: "iPhone 16e", lcdInCell: 139, softOled: 170, originalScreen: 220 },
  { model: "iPhone 15 Pro Max", lcdInCell: 190, softOled: 240, originalScreen: 390 },
  { model: "iPhone 15 Plus", lcdInCell: 170, softOled: 220, originalScreen: 350 },
  { model: "iPhone 15 Pro", lcdInCell: 170, softOled: 240, originalScreen: 390 },
  { model: "iPhone 15", lcdInCell: 150, softOled: 200, originalScreen: 320 },
  { model: "iPhone 14 Pro Max", lcdInCell: 170, softOled: 220, originalScreen: 370 },
  { model: "iPhone 14 Plus", lcdInCell: 170, softOled: 190, originalScreen: 320 },
  { model: "iPhone 14 Pro", lcdInCell: 170, softOled: 220, originalScreen: 290 },
  { model: "iPhone 14", lcdInCell: 150, softOled: 190, originalScreen: 240 },
  { model: "iPhone SE 3", lcdInCell: 85, softOled: null, originalScreen: null },
  { model: "iPhone 13 Pro Max", lcdInCell: 170, softOled: 190, originalScreen: 320 },
  { model: "iPhone 13 Pro", lcdInCell: 150, softOled: 190, originalScreen: 270 },
  { model: "iPhone 13", lcdInCell: 129, softOled: 169, originalScreen: 240 },
  { model: "iPhone 13 mini", lcdInCell: 150, softOled: null, originalScreen: 290 },
  { model: "iPhone 12 Pro Max", lcdInCell: 150, softOled: null, originalScreen: null },
  { model: "iPhone 12 Pro", lcdInCell: 139, softOled: null, originalScreen: null },
  { model: "iPhone 12", lcdInCell: 129, softOled: 169, originalScreen: 199 },
  { model: "iPhone 12 mini", lcdInCell: 150, softOled: null, originalScreen: null },
  { model: "iPhone SE 2", lcdInCell: null, softOled: null, originalScreen: 85 },
  { model: "iPhone 11 Pro Max", lcdInCell: 139, softOled: null, originalScreen: null },
  { model: "iPhone 11 Pro", lcdInCell: 129, softOled: null, originalScreen: null },
  { model: "iPhone 11", lcdInCell: 120, softOled: null, originalScreen: 150 },
  { model: "iPhone XS Max", lcdInCell: 120, softOled: null, originalScreen: null },
  { model: "iPhone XS", lcdInCell: 100, softOled: null, originalScreen: 180 },
  { model: "iPhone X", lcdInCell: 100, softOled: null, originalScreen: 170 },
  { model: "iPhone XR", lcdInCell: 110, softOled: null, originalScreen: 150 },
  { model: "iPhone 8 Plus", lcdInCell: 90, softOled: null, originalScreen: null },
  { model: "iPhone 8", lcdInCell: null, softOled: null, originalScreen: 85 },
  { model: "iPhone 7 Plus", lcdInCell: 85, softOled: null, originalScreen: null },
  { model: "iPhone 7", lcdInCell: null, softOled: null, originalScreen: 80 },
  { model: "iPhone SE", lcdInCell: null, softOled: null, originalScreen: 85 },
  { model: "iPhone 6 Plus", lcdInCell: 70, softOled: null, originalScreen: null },
  { model: "iPhone 6S Plus", lcdInCell: 70, softOled: null, originalScreen: null },
  { model: "iPhone 6", lcdInCell: 60, softOled: null, originalScreen: null },
  { model: "iPhone 6S", lcdInCell: 65, softOled: null, originalScreen: null },
];

const OLDER_MODEL_START_INDEX = IPHONE_SCREEN_REPAIR_PRICES.findIndex(
  ({ model }) => model === "iPhone XS Max",
);

export const CURRENT_IPHONE_SCREEN_REPAIR_PRICES = IPHONE_SCREEN_REPAIR_PRICES.slice(
  0,
  OLDER_MODEL_START_INDEX,
);

export const OLDER_IPHONE_SCREEN_REPAIR_PRICES = IPHONE_SCREEN_REPAIR_PRICES.slice(
  OLDER_MODEL_START_INDEX,
);

export const SCREEN_OPTION_SAMPLE = [
  { name: "Soft OLED", customers: 72, colour: "#2563eb", summary: "Most frequently selected balance of display quality and price." },
  { name: "LCD / In-cell", customers: 21, colour: "#0891b2", summary: "Selected mainly where keeping the repair cost lower was the priority." },
  { name: "Original Screen", customers: 7, colour: "#a16207", summary: "Selected by customers prioritising the original screen option." },
] as const;

export const SCREEN_OPTION_SAMPLE_TOTAL = SCREEN_OPTION_SAMPLE.reduce(
  (total, option) => total + option.customers,
  0,
);

export const IPHONE_SCREEN_PHOTOS = {
  comparison: {
    src: "/images/blog/iphone-screen-repair-cost/iphone-screen-comparison.jpg",
    alt: "Side-by-side comparison of LCD in-cell, Soft OLED and Original iPhone screens",
    width: 5000,
    height: 2812,
  },
  lcdInCell: {
    src: "/images/blog/iphone-screen-repair-cost/iphone-screen-lcd-in-cell.jpg",
    alt: "LCD in-cell replacement screen fitted to an iPhone",
    width: 1997,
    height: 4029,
  },
  softOled: {
    src: "/images/blog/iphone-screen-repair-cost/iphone-screen-soft-oled.jpg",
    alt: "Soft OLED replacement screen fitted to an iPhone",
    width: 1954,
    height: 4029,
  },
  originalScreen: {
    src: "/images/blog/iphone-screen-repair-cost/iphone-screen-original.jpg",
    alt: "Original iPhone screen used for display comparison",
    width: 2811,
    height: 5708,
  },
} as const;

export const SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_SLUG =
  "how-much-does-samsung-galaxy-s-screen-replacement-cost-australia";

export const SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA = {
  slug: SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_SLUG,
  title: "How Much Does Samsung Galaxy S Screen Replacement Cost in Australia?",
  seoTitle: "How Much Does Samsung Galaxy S Screen Replacement Cost in Australia? | Ali Mobile",
  description:
    "Compare Ali Mobile's manually checked Samsung Galaxy S screen replacement prices, including Samsung Service Pack and selected aftermarket display-with-frame options.",
  heroIntro:
    "This guide compares Ali Mobile's manually maintained Samsung Galaxy S screen replacement prices and explains when a Samsung Service Pack assembly or a selected aftermarket display-with-frame option may suit your phone.",
  datePublished: "2026-09-08",
  dateModified: "2026-09-08",
  displayDateModified: "8 September 2026",
} as const;

export type SamsungGalaxySScreenRepairPrice = {
  model: string;
  servicePackWithFrame: number;
  aftermarketWithFrame: number | null;
};

export const SAMSUNG_GALAXY_S_SCREEN_REPAIR_PRICES: SamsungGalaxySScreenRepairPrice[] = [
  { model: "Galaxy S26 Ultra", servicePackWithFrame: 490, aftermarketWithFrame: null },
  { model: "Galaxy S26+", servicePackWithFrame: 430, aftermarketWithFrame: null },
  { model: "Galaxy S26", servicePackWithFrame: 370, aftermarketWithFrame: null },
  { model: "Galaxy S25 Ultra", servicePackWithFrame: 430, aftermarketWithFrame: 340 },
  { model: "Galaxy S25+", servicePackWithFrame: 360, aftermarketWithFrame: null },
  { model: "Galaxy S25", servicePackWithFrame: 330, aftermarketWithFrame: null },
  { model: "Galaxy S24 Ultra", servicePackWithFrame: 420, aftermarketWithFrame: 320 },
  { model: "Galaxy S24+", servicePackWithFrame: 340, aftermarketWithFrame: null },
  { model: "Galaxy S24", servicePackWithFrame: 310, aftermarketWithFrame: null },
  { model: "Galaxy S24 FE", servicePackWithFrame: 240, aftermarketWithFrame: null },
  { model: "Galaxy S23 Ultra", servicePackWithFrame: 420, aftermarketWithFrame: 298 },
  { model: "Galaxy S23+", servicePackWithFrame: 290, aftermarketWithFrame: null },
  { model: "Galaxy S23", servicePackWithFrame: 310, aftermarketWithFrame: null },
  { model: "Galaxy S23 FE", servicePackWithFrame: 240, aftermarketWithFrame: null },
  { model: "Galaxy S22 Ultra", servicePackWithFrame: 390, aftermarketWithFrame: 298 },
  { model: "Galaxy S22+", servicePackWithFrame: 270, aftermarketWithFrame: null },
  { model: "Galaxy S22", servicePackWithFrame: 290, aftermarketWithFrame: null },
  { model: "Galaxy S21 Ultra", servicePackWithFrame: 350, aftermarketWithFrame: null },
  { model: "Galaxy S21+", servicePackWithFrame: 260, aftermarketWithFrame: null },
  { model: "Galaxy S21", servicePackWithFrame: 240, aftermarketWithFrame: null },
  { model: "Galaxy S21 FE", servicePackWithFrame: 230, aftermarketWithFrame: null },
  { model: "Galaxy S20 Ultra", servicePackWithFrame: 330, aftermarketWithFrame: null },
  { model: "Galaxy S20+", servicePackWithFrame: 290, aftermarketWithFrame: null },
  { model: "Galaxy S20", servicePackWithFrame: 250, aftermarketWithFrame: null },
  { model: "Galaxy S20 FE", servicePackWithFrame: 190, aftermarketWithFrame: null },
];

export const PHONE_BRAND_STARTING_PRICES: Record<string, Partial<Record<string, number>>> = {
  iphone: {
    "screen-replacement": 50,
    "charging-port-replacement": 50,
    "battery-replacement": 50,
    "front-camera-replacement": 50,
    "back-camera-replacement": 50,
    "back-housing-replacement": 79,
    "back-glass": 79,
    "back-glass-repair": 79,
    "back-glass-replacement": 79,
  },
  samsung: {
    "screen-replacement": 129,
    "charging-port-replacement": 65,
    "battery-replacement": 65,
    "front-camera-replacement": 50,
    "back-camera-replacement": 50,
    "back-housing-replacement": 50,
    "back-glass": 50,
    "back-glass-repair": 50,
    "back-glass-replacement": 50,
  },
  "google-pixel": {
    "screen-replacement": 129,
    "charging-port-replacement": 65,
    "battery-replacement": 65,
    "front-camera-replacement": 50,
    "back-camera-replacement": 50,
    "back-housing-replacement": 50,
    "back-glass": 79,
    "back-glass-repair": 79,
    "back-glass-replacement": 50,
  },
  google: {
    "screen-replacement": 129,
    "charging-port-replacement": 65,
    "battery-replacement": 65,
    "front-camera-replacement": 50,
    "back-camera-replacement": 50,
    "back-housing-replacement": 50,
    "back-glass": 79,
    "back-glass-repair": 79,
    "back-glass-replacement": 50,
  },
  pixel: {
    "screen-replacement": 129,
    "charging-port-replacement": 65,
    "battery-replacement": 65,
    "front-camera-replacement": 50,
    "back-camera-replacement": 50,
    "back-housing-replacement": 50,
    "back-glass": 79,
    "back-glass-repair": 79,
    "back-glass-replacement": 50,
  },
  oppo: {
    "screen-replacement": 129,
    "charging-port-replacement": 65,
    "battery-replacement": 65,
    "front-camera-replacement": 50,
    "back-camera-replacement": 50,
    "back-housing-replacement": 50,
    "back-glass": 50,
    "back-glass-repair": 50,
    "back-glass-replacement": 50,
  },
  other: {
    "screen-replacement": 129,
    "charging-port-replacement": 50,
    "battery-replacement": 50,
    "front-camera-replacement": 50,
    "back-camera-replacement": 50,
    "back-housing-replacement": 50,
    "back-glass": 50,
    "back-glass-repair": 50,
    "back-glass-replacement": 50,
  },
};

export const TABLET_BRAND_STARTING_PRICES: Record<string, Partial<Record<string, number>>> = {
  ipad: {
    "screen-replacement": 89,
    "battery-replacement": 99,
    "front-camera-replacement": 65,
    "back-camera-replacement": 65,
    "charging-port-replacement": 120,
  },
  samsung: {
    "screen-replacement": 99,
    "battery-replacement": 85,
    "front-camera-replacement": 65,
    "back-camera-replacement": 65,
    "charging-port-replacement": 85,
  },
  lenovo: {
    "screen-replacement": 129,
    "battery-replacement": 85,
    "front-camera-replacement": 65,
    "back-camera-replacement": 65,
    "charging-port-replacement": 85,
  },
};

export const LAPTOP_BRAND_STARTING_PRICES: Record<string, Partial<Record<string, number>>> = {
  macbook: {
    "screen-replacement": 250,
    "battery-replacement": 150,
    "charging-port-replacement": 99,
  },
};

export const WATCH_BRAND_STARTING_PRICES: Record<string, Partial<Record<string, number>>> = {
  apple: {
    "screen-replacement": 150,
    "battery-replacement": 85,
  },
};

export function getStartingPrice(categorySlug: string, brandSlug: string, repairSlug: string) {
  if (categorySlug === "phone") {
    const brandPrices = PHONE_BRAND_STARTING_PRICES[brandSlug] || PHONE_BRAND_STARTING_PRICES.other;
    return brandPrices[repairSlug] ?? null;
  }
  if (categorySlug === "tablet") {
    const brandPrices = TABLET_BRAND_STARTING_PRICES[brandSlug];
    return brandPrices ? (brandPrices[repairSlug] ?? null) : null;
  }
  if (categorySlug === "laptop") {
    const brandPrices = LAPTOP_BRAND_STARTING_PRICES[brandSlug];
    return brandPrices ? (brandPrices[repairSlug] ?? null) : null;
  }
  if (categorySlug === "watch") {
    const brandPrices = WATCH_BRAND_STARTING_PRICES[brandSlug];
    return brandPrices ? (brandPrices[repairSlug] ?? null) : null;
  }
  return null;
}

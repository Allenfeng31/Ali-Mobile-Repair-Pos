"use client";

import React from "react";
import Link from "next/link";
import { analytics } from "@/lib/analytics";
import { Battery, Camera, Droplet, Plug, Smartphone, Wrench } from "lucide-react";

interface RepairVariant {
  quality_grade: string;
  price: number;
}

interface RepairOption {
  slug: string;
  name: string;
  price: number;
  variants?: RepairVariant[];
}

interface RepairOptionsGridProps {
  repairTypes: RepairOption[];
  categorySlug: string;
  brandSlug: string;
  modelSlug: string;
  modelName: string;
}

const PHONE_BRAND_STARTING_PRICES: Record<string, Partial<Record<string, number>>> = {
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
  google: {
    "screen-replacement": 129,
    "charging-port-replacement": 65,
    "battery-replacement": 65,
    "front-camera-replacement": 50,
    "back-camera-replacement": 50,
    "back-housing-replacement": 79,
    "back-glass": 79,
    "back-glass-repair": 79,
    "back-glass-replacement": 79,
  },
  pixel: {
    "screen-replacement": 129,
    "charging-port-replacement": 65,
    "battery-replacement": 65,
    "front-camera-replacement": 50,
    "back-camera-replacement": 50,
    "back-housing-replacement": 79,
    "back-glass": 79,
    "back-glass-repair": 79,
    "back-glass-replacement": 79,
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

const TABLET_BRAND_STARTING_PRICES: Record<string, Partial<Record<string, number>>> = {
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

const LAPTOP_BRAND_STARTING_PRICES: Record<string, Partial<Record<string, number>>> = {
  macbook: {
    "screen-replacement": 250,
    "battery-replacement": 150,
    "charging-port-replacement": 99,
  },
};

const WATCH_BRAND_STARTING_PRICES: Record<string, Partial<Record<string, number>>> = {
  apple: {
    "screen-replacement": 150,
    "battery-replacement": 85,
  },
};

function getStartingPrice(categorySlug: string, brandSlug: string, repairSlug: string) {
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

export default function RepairOptionsGrid({
  repairTypes,
  categorySlug,
  brandSlug,
  modelSlug,
  modelName,
}: RepairOptionsGridProps) {
  const getRepairIcon = (slug: string) => {
    switch (slug) {
      case "screen-replacement": return <Smartphone size={23} strokeWidth={2.4} aria-hidden="true" />;
      case "battery-replacement": return <Battery size={23} strokeWidth={2.4} aria-hidden="true" />;
      case "charging-port-repair":
      case "charging-port-replacement": return <Plug size={23} strokeWidth={2.4} aria-hidden="true" />;
      case "water-damage-repair": return <Droplet size={23} strokeWidth={2.4} aria-hidden="true" />;
      case "back-glass-repair":
      case "back-housing-replacement": return <Smartphone size={23} strokeWidth={2.4} aria-hidden="true" />;
      case "camera-repair":
      case "front-camera-replacement":
      case "back-camera-replacement": return <Camera size={23} strokeWidth={2.4} aria-hidden="true" />;
      default: return <Wrench size={23} strokeWidth={2.4} aria-hidden="true" />;
    }
  };

  const handleOptionClick = (e: React.MouseEvent, rt: RepairOption) => {
    analytics.trackRepairView(modelName, rt.name);
  };

  const getDisplayPrice = (rt: RepairOption) => {
    if (rt.price > 0) {
      return `From $${rt.price}`;
    }

    const startingPrice = getStartingPrice(categorySlug, brandSlug, rt.slug);
    if (startingPrice) {
      return `Starting from $${startingPrice}`;
    }

    return "Quote on Request";
  };

  const getRepairDisplayName = (rt: RepairOption) => {
    if (categorySlug === "phone" && rt.slug === "back-housing-replacement") {
      return brandSlug === "iphone" ? "Back Glass / Back Housing Replacement" : "Back Glass Replacement";
    }

    return rt.name;
  };

  const getRepairHref = (rt: RepairOption) => {
    const publicRepairSlug =
      categorySlug === "phone" && rt.slug === "back-housing-replacement"
        ? "back-glass-replacement"
        : rt.slug;

    return `/repairs/${categorySlug}/${brandSlug}/${modelSlug}/${publicRepairSlug}`;
  };

  return (
    <>
      <div className="repair-option-grid items-stretch">
        {repairTypes.map((rt) => {
          return (
            <div key={rt.slug} className="flex h-full flex-col">
              <Link
                href={getRepairHref(rt)}
                className="repair-option-card h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                onClick={(e) => handleOptionClick(e, rt)}
                style={{ minHeight: "108px" }}
              >
                <span className="repair-option-icon shrink-0">{getRepairIcon(rt.slug)}</span>
                <div className="repair-option-info min-w-0">
                  <span className="repair-option-name break-words leading-snug">{getRepairDisplayName(rt)}</span>
                  <span className="repair-option-price">
                    {getDisplayPrice(rt)}
                  </span>
                </div>
                <span className="repair-option-arrow shrink-0">
                  →
                </span>
              </Link>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-sm font-medium text-slate-500">
        Prices are starting prices. Final quote depends on parts, model, and device condition.
      </p>
    </>
  );
}

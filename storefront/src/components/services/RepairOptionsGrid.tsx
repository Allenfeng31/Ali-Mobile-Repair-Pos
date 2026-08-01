"use client";

import React from "react";
import Link from "next/link";
import { analytics } from "@/lib/analytics";
import { Battery, Camera, Droplet, Ear, Plug, Power, Smartphone, Volume2, Wrench } from "lucide-react";
import { getStartingPrice } from "@/lib/repairStartingPrices";
import { formatScopedRepairPriceLabel } from "@/lib/scopedRepairPriceLabel";
import { getModelHubRepairHref } from "@/lib/waterDamageRouting";
import { CAMERA_LENS_REPAIR_SLUG, getCameraLensLandingHref } from "@/lib/virtualCameraLens";
import { getVirtualPhoneRepairLandingHref, getVirtualPhoneRepair, type VirtualPhoneRepairSlug } from "@/lib/virtualPhoneRepairs";
import { sortRepairOptionsForDisplay } from "@/lib/repairOptionDisplayOrder";

interface RepairVariant {
  quality_grade: string;
  price: number;
}

interface RepairOption {
  slug: string;
  name: string;
  price: number;
  variants?: RepairVariant[];
  sourceType?: 'real' | 'virtual' | 'diagnostic';
}

interface RepairOptionsGridProps {
  repairTypes: RepairOption[];
  categorySlug: string;
  brandSlug: string;
  modelSlug: string;
  modelName: string;
}



export default function RepairOptionsGrid({
  repairTypes,
  categorySlug,
  brandSlug,
  modelSlug,
  modelName,
}: RepairOptionsGridProps) {
  const displayRepairTypes = sortRepairOptionsForDisplay(repairTypes);

  const getRepairIcon = (slug: string) => {
    switch (slug) {
      case "screen-replacement": return <Smartphone size={23} strokeWidth={2.4} aria-hidden="true" />;
      case "battery-replacement": return <Battery size={23} strokeWidth={2.4} aria-hidden="true" />;
      case "charging-port-repair":
      case "charging-port-replacement":
      case "charging-repair": return <Plug size={23} strokeWidth={2.4} aria-hidden="true" />;
      case "water-damage-repair": return <Droplet size={23} strokeWidth={2.4} aria-hidden="true" />;
      case "back-glass-repair":
      case "back-glass-replacement":
      case "back-housing-replacement": return <Smartphone size={23} strokeWidth={2.4} aria-hidden="true" />;
      case "camera-repair":
      case "front-camera-replacement":
      case "back-camera-replacement":
      case "camera-lens-replacement": return <Camera size={23} strokeWidth={2.4} aria-hidden="true" />;
      case "loudspeaker-replacement": return <Volume2 size={23} strokeWidth={2.4} aria-hidden="true" />;
      case "earpiece-speaker-replacement": return <Ear size={23} strokeWidth={2.4} aria-hidden="true" />;
      case "power-button-replacement": return <Power size={23} strokeWidth={2.4} aria-hidden="true" />;
      case "volume-button-replacement": return <Volume2 size={23} strokeWidth={2.4} aria-hidden="true" />;
      default: return <Wrench size={23} strokeWidth={2.4} aria-hidden="true" />;
    }
  };

  const handleOptionClick = (e: React.MouseEvent, rt: RepairOption) => {
    analytics.trackRepairView(modelName, rt.name);
  };

  const getDisplayPrice = (rt: RepairOption) => {
    let unscopedLabel: string;
    if (rt.price > 0) {
      unscopedLabel = `From $${rt.price}`;
    } else {
      const startingPrice = getStartingPrice(categorySlug, brandSlug, rt.slug);
      unscopedLabel = startingPrice ? `Starting from $${startingPrice}` : "Quote on Request";
    }

    return formatScopedRepairPriceLabel(rt.slug, rt.price, unscopedLabel, rt.sourceType);
  };

  const getRepairDisplayName = (rt: RepairOption) => {
    if (
      categorySlug === "phone" &&
      (rt.slug === "back-housing-replacement" || rt.slug === "back-glass-replacement")
    ) {
      return brandSlug === "iphone" ? "Back Glass / Back Housing Replacement" : "Back Glass Replacement";
    }

    return rt.name;
  };

  const getRepairHref = (rt: RepairOption) => {
    if (rt.slug === CAMERA_LENS_REPAIR_SLUG && categorySlug === "phone" && brandSlug !== "iphone") {
      return getCameraLensLandingHref(categorySlug, brandSlug, modelSlug) || `/repairs/${categorySlug}/${brandSlug}/${modelSlug}/${rt.slug}`;
    }

    if (categorySlug === "phone" && getVirtualPhoneRepair(rt.slug)) {
      return getVirtualPhoneRepairLandingHref(categorySlug, brandSlug, modelSlug, rt.slug as VirtualPhoneRepairSlug) || `/repairs/${categorySlug}/${brandSlug}/${modelSlug}/${rt.slug}`;
    }

    const publicRepairSlug =
      categorySlug === "phone" &&
      (rt.slug === "back-housing-replacement" || rt.slug === "back-glass-replacement")
        ? "back-glass-replacement"
        : rt.slug;

    return getModelHubRepairHref(
      rt.slug,
      `/repairs/${categorySlug}/${brandSlug}/${modelSlug}/${publicRepairSlug}`
    );
  };

  return (
    <>
      <div className="repair-option-grid items-stretch">
        {displayRepairTypes.map((rt) => {
          return (
            <div key={rt.slug} className="flex h-full flex-col">
              <Link
                href={getRepairHref(rt)}
                className="repair-option-card h-full !border-2 !border-slate-950 !bg-transparent !px-5 !py-5 !shadow-none hover:!border-blue-700 hover:!bg-blue-50/50 hover:!shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                onClick={(e) => handleOptionClick(e, rt)}
                style={{ minHeight: "108px" }}
              >
                <span className="repair-option-icon shrink-0 !border-2 !border-slate-950 !bg-transparent">{getRepairIcon(rt.slug)}</span>
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
        {displayRepairTypes.some((repair) => repair.sourceType === 'diagnostic')
          ? 'Final quote depends on the confirmed fault, parts and device condition.'
          : 'Prices are starting prices. Final quote depends on parts, model, and device condition.'}
      </p>
    </>
  );
}

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

  return (
    <>
      <div className="repair-option-grid">
        {repairTypes.map((rt) => {
          return (
            <div key={rt.slug} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link
                href={`/repairs/${categorySlug}/${brandSlug}/${modelSlug}/${rt.slug}`}
                className="repair-option-card"
                onClick={(e) => handleOptionClick(e, rt)}
              >
                <span className="repair-option-icon">{getRepairIcon(rt.slug)}</span>
                <div className="repair-option-info">
                  <span className="repair-option-name">{rt.name}</span>
                  <span className="repair-option-price">
                    {rt.price > 0
                      ? `From $${rt.price}`
                      : rt.slug === "water-damage-repair"
                      ? "From $50"
                      : "Quote on Request"}
                  </span>
                </div>
                <span className="repair-option-arrow">
                  →
                </span>
              </Link>
            </div>
          );
        })}
      </div>
    </>
  );
}

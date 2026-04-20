"use client";

import React, { useState } from "react";
import Link from "next/link";
import QuoteRequestModal from "./QuoteRequestModal";

interface RepairOption {
  slug: string;
  name: string;
  price: number;
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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState<RepairOption | null>(null);

  const getRepairIcon = (slug: string): string => {
    switch (slug) {
      case "screen-replacement": return "📱";
      case "battery-replacement": return "🔋";
      case "charging-port-repair":
      case "charging-port-replacement": return "🔌";
      case "water-damage-repair": return "💧";
      case "back-glass-repair":
      case "back-housing-replacement": return "🪟";
      case "camera-repair":
      case "front-camera-replacement":
      case "back-camera-replacement": return "📷";
      default: return "🔧";
    }
  };

  const handleRepairClick = (e: React.MouseEvent, rt: RepairOption) => {
    if (rt.price <= 0 && rt.slug !== "water-damage-repair") {
      e.preventDefault();
      setSelectedRepair(rt);
      setModalOpen(true);
    }
  };

  return (
    <>
      <div className="repair-option-grid">
        {repairTypes.map((rt) => (
          <Link
            key={rt.slug}
            href={`/repairs/${categorySlug}/${brandSlug}/${modelSlug}/${rt.slug}`}
            className="repair-option-card"
            onClick={(e) => handleRepairClick(e, rt)}
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
            <span className="repair-option-arrow">→</span>
          </Link>
        ))}
      </div>

      {modalOpen && selectedRepair && (
        <QuoteRequestModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          deviceModel={modelName}
          repairType={selectedRepair.name}
        />
      )}
    </>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { analytics } from "@/lib/analytics";
import QuoteRequestModal from "./QuoteRequestModal";

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
  const router = useRouter();
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

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

  const handleOptionClick = (e: React.MouseEvent, rt: RepairOption) => {
    analytics.trackRepairView(modelName, rt.name);

    // If it has multiple variants, toggle accordion
    if (rt.variants && rt.variants.length > 1) {
      e.preventDefault();
      setExpandedSlug(expandedSlug === rt.slug ? null : rt.slug);
    }
  };

  return (
    <>
      <div className="repair-option-grid">
        {repairTypes.map((rt) => {
          const hasVariants = rt.variants && rt.variants.length > 1;
          const isExpanded = expandedSlug === rt.slug;
          
          return (
            <div key={rt.slug} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link
                href={`/repairs/${categorySlug}/${brandSlug}/${modelSlug}/${rt.slug}`}
                className="repair-option-card"
                onClick={(e) => handleOptionClick(e, rt)}
                style={isExpanded ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none' } : {}}
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
                <span className="repair-option-arrow" style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s ease' }}>
                  →
                </span>
              </Link>
              
              {/* Variants Accordion */}
              {isExpanded && hasVariants && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1px',
                  background: 'var(--layer-border)',
                  border: '1px solid var(--layer-border)',
                  borderTop: 'none',
                  borderBottomLeftRadius: '12px',
                  borderBottomRightRadius: '12px',
                  overflow: 'hidden',
                  marginTop: '-0.5rem'
                }}>
                  {rt.variants!.map((v, i) => (
                    <Link
                      key={`${rt.slug}-${v.quality_grade}`}
                      href={`/repairs/${categorySlug}/${brandSlug}/${modelSlug}/${rt.slug}?tier=${encodeURIComponent(v.quality_grade)}`}
                      style={{
                        padding: '1rem 1.5rem',
                        background: 'var(--layer)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        textDecoration: 'none',
                        color: 'inherit',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--layer-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--layer)')}
                    >
                      <div>
                        <span style={{ fontWeight: 600, display: 'block', fontSize: '0.95rem' }}>
                          {v.quality_grade} Tier
                        </span>
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        ${v.price}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}


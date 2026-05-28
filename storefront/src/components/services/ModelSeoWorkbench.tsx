"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import FaqAccordion from "@/components/FaqAccordion";
import { normalizeRepairPocketSlug } from "@/data/modelSeoPockets";
import type { ModelSeoPocket, ModelSeoPocketSuite } from "@/data/modelSeoPockets";
import { ArrowRight } from "lucide-react";

interface RepairOption {
  slug: string;
  name: string;
  price: number;
}

interface ModelSeoWorkbenchProps {
  suite: ModelSeoPocketSuite;
  repairTypes: RepairOption[];
  categorySlug: string;
  brandSlug: string;
  modelSlug: string;
  modelName: string;
}

const GENERAL_TAB = "general";

function buildPocketLookup(pockets: ModelSeoPocket[]) {
  return pockets.reduce<Record<string, ModelSeoPocket>>((acc, pocket) => {
    acc[pocket.slug] = pocket;
    return acc;
  }, {});
}

export default function ModelSeoWorkbench({
  suite,
  repairTypes,
  categorySlug,
  brandSlug,
  modelSlug,
  modelName,
}: ModelSeoWorkbenchProps) {
  const [activeSlug, setActiveSlug] = useState(GENERAL_TAB);
  const pocketLookup = useMemo(() => buildPocketLookup(suite.pockets), [suite.pockets]);
  const availableRepairTabs = useMemo(() => {
    const seenPocketSlugs = new Set<string>();

    return repairTypes
      .map((repairType) => {
        const pocketSlug = normalizeRepairPocketSlug(repairType.slug);
        const pocket = pocketLookup[pocketSlug];
        if (!pocket || seenPocketSlugs.has(pocketSlug)) return null;
        seenPocketSlugs.add(pocketSlug);
        return pocket ? { repairType, pocket, pocketSlug } : null;
      })
      .filter(Boolean) as Array<{
        repairType: RepairOption;
        pocket: ModelSeoPocket;
        pocketSlug: string;
      }>;
  }, [pocketLookup, repairTypes]);

  const activePocket = activeSlug === GENERAL_TAB ? null : pocketLookup[activeSlug] || null;
  const activeFaqs = activePocket?.faqs || suite.defaultFaqs;

  if (availableRepairTabs.length === 0) {
    return null;
  }

  return (
    <section className="model-seo-workbench" aria-labelledby="model-seo-workbench-heading">
      <div className="repair-workbench-heading">
        <span>Repair desk</span>
        <h2 id="model-seo-workbench-heading">{modelName} repair intelligence</h2>
        <p>
          Start with the common trust questions, or choose a repair category to see the technician notes and FAQ set for that exact iPhone 13 repair path.
        </p>
      </div>

      <div className="model-seo-tabs" role="tablist" aria-label={`${modelName} repair FAQ categories`}>
        <button
          type="button"
          role="tab"
          aria-selected={activeSlug === GENERAL_TAB}
          className="model-seo-tab"
          onClick={() => setActiveSlug(GENERAL_TAB)}
        >
          General
        </button>
        {availableRepairTabs.map(({ pocket, pocketSlug }) => (
          <button
            key={pocketSlug}
            type="button"
            role="tab"
            aria-selected={activeSlug === pocketSlug}
            className="model-seo-tab"
            onClick={() => setActiveSlug(pocketSlug)}
          >
            {pocket.label}
          </button>
        ))}
      </div>

      {activePocket ? (
        <div key={`workbench-${activePocket.slug}`} className="repair-workbench-grid model-seo-workbench-grid">
          <details className="repair-workbench-box">
            <summary>
              <span className="repair-workbench-number">01</span>
              <h3>Workbench brief</h3>
              <span className="repair-workbench-chevron" aria-hidden="true" />
            </summary>
            <div className="repair-workbench-box-content">
              <article className="repair-workbench-mini-card">
                <h3>{activePocket.label} repair focus</h3>
                <p>{activePocket.quickAnswer}</p>
              </article>
            </div>
          </details>

          {activePocket.workbench.map((item, index) => (
            <details key={item.title} className="repair-workbench-box">
              <summary>
                <span className="repair-workbench-number">{String(index + 2).padStart(2, "0")}</span>
                <h3>{item.title}</h3>
                <span className="repair-workbench-chevron" aria-hidden="true" />
              </summary>
              <div className="repair-workbench-box-content">
                <article className="repair-workbench-mini-card">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              </div>
            </details>
          ))}
        </div>
      ) : (
        <div key="general-workbench" className="model-seo-general-panel">
          <p>
            Choose the repair path that matches your fault, or start with the common questions customers ask before leaving an iPhone 13 at the bench.
          </p>
        </div>
      )}

      <div key={`faq-${activeSlug}`}>
        <FaqAccordion faqs={activeFaqs} />
      </div>

      {activePocket && (
        <div className="model-seo-deep-link">
          <Link
            href={`/repairs/${categorySlug}/${brandSlug}/${modelSlug}/${availableRepairTabs.find((tab) => tab.pocketSlug === activePocket.slug)?.repairType.slug || activePocket.slug}`}
            className="repair-primary-action"
          >
            Open {activePocket.label.toLowerCase()} repair quote
            <ArrowRight size={18} strokeWidth={2.7} aria-hidden="true" />
          </Link>
        </div>
      )}
    </section>
  );
}

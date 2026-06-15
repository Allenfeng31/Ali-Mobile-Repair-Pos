import { ModelEntry } from './api';

export interface CrossModelCandidate {
  modelName: string;
  modelSlug: string;
  repairSlug: string;
  score: number;
  reason?: string;
}

export interface RecommendationContext {
  category: string;
  brandSlug: string;
  currentModelSlug: string;
  currentModelName: string;
  repairSlug: string;
  models: ModelEntry[];
  limit?: number;
}

interface ParsedModel {
  baseFamily: string;
  generationNumber: number | null;
  variants: Set<string>;
  explicitSize: string | null;
  explicitYear: number | null;
}

function normalizeCandidateSlug(slug: string): string {
  return slug.toLowerCase().trim().replace(/[-_]+/g, '-');
}

function parseModel(modelName: string, category: string, brandSlug: string): ParsedModel {
  const lower = modelName.toLowerCase();
  let baseFamily = 'Generic';
  let generationNumber: number | null = null;
  const variants = new Set<string>();
  let explicitSize: string | null = null;
  let explicitYear: number | null = null;

  const yearMatch = lower.match(/\b(20\d{2})\b/);
  if (yearMatch) explicitYear = parseInt(yearMatch[1], 10);

  // Extract common variants
  if (lower.includes('pro max')) variants.add('pro max');
  else if (lower.includes('pro')) variants.add('pro');
  if (lower.includes('plus') || lower.includes('+')) variants.add('plus');
  if (lower.includes('mini')) variants.add('mini');
  if (lower.includes('ultra')) variants.add('ultra');

  if (category === 'phone') {
    if (brandSlug.includes('iphone') || lower.includes('iphone')) {
      baseFamily = 'iPhone';
      const match = lower.match(/iphone\s+(\d+)/);
      if (match) generationNumber = parseInt(match[1], 10);
      else if (lower.includes('se')) {
         baseFamily = 'iPhone SE';
         const seGenMatch = lower.match(/se\s*\(?(\d+)/);
         if (seGenMatch) generationNumber = parseInt(seGenMatch[1], 10);
      }
    } else if (brandSlug.includes('samsung') || lower.includes('galaxy')) {
      if (lower.includes('galaxy s')) {
        baseFamily = 'Galaxy S';
        const m = lower.match(/galaxy s(\d+)/);
        if (m) generationNumber = parseInt(m[1], 10);
      } else if (lower.includes('galaxy a')) {
        baseFamily = 'Galaxy A';
        const m = lower.match(/galaxy a(\d+)/);
        if (m) generationNumber = parseInt(m[1], 10);
      } else if (lower.includes('galaxy z fold') || lower.includes('z fold')) {
        baseFamily = 'Galaxy Z Fold';
        const m = lower.match(/fold\s*(\d+)/);
        if (m) generationNumber = parseInt(m[1], 10);
      } else if (lower.includes('galaxy z flip') || lower.includes('z flip')) {
        baseFamily = 'Galaxy Z Flip';
        const m = lower.match(/flip\s*(\d+)/);
        if (m) generationNumber = parseInt(m[1], 10);
      } else if (lower.includes('note')) {
        baseFamily = 'Galaxy Note';
        const m = lower.match(/note\s*(\d+)/);
        if (m) generationNumber = parseInt(m[1], 10);
      } else {
        baseFamily = 'Samsung Phone';
      }
    } else if (lower.includes('pixel')) {
      baseFamily = 'Pixel';
      const m = lower.match(/pixel\s+(\d+)/);
      if (m) generationNumber = parseInt(m[1], 10);
      if (lower.includes('xl')) variants.add('xl');
      if (lower.match(/\d+a\b/)) variants.add('a-series');
    } else if (lower.includes('find')) baseFamily = 'Find';
    else if (lower.includes('reno')) baseFamily = 'Reno';
    else if (lower.includes('redmi')) baseFamily = 'Redmi';
    else if (lower.includes('poco')) baseFamily = 'Poco';
  } else if (category === 'tablet') {
    if (lower.includes('ipad pro')) baseFamily = 'iPad Pro';
    else if (lower.includes('ipad air')) baseFamily = 'iPad Air';
    else if (lower.includes('ipad mini')) baseFamily = 'iPad mini';
    else if (lower.includes('ipad')) baseFamily = 'iPad Standard';
    else if (lower.includes('tab s')) {
       baseFamily = 'Tab S';
       const m = lower.match(/tab s(\d+)/);
       if (m) generationNumber = parseInt(m[1], 10);
    }
    else if (lower.includes('tab a')) {
       baseFamily = 'Tab A';
       const m = lower.match(/tab a(\d+)/);
       if (m) generationNumber = parseInt(m[1], 10);
    }
    else if (lower.includes('tab active')) baseFamily = 'Tab Active';

    const genMatch = lower.match(/(\d+)(?:th|rd|nd|st)\s+(?:gen|generation)/) || lower.match(/generation\s+(\d+)/);
    if (genMatch) generationNumber = parseInt(genMatch[1], 10);

    const sizeMatch = lower.match(/(\d+(?:\.\d+)?)-inch/);
    if (sizeMatch) explicitSize = sizeMatch[1];

  } else if (category === 'laptop' || category === 'computer') {
    if (lower.includes('macbook pro')) baseFamily = 'MacBook Pro';
    else if (lower.includes('macbook air')) baseFamily = 'MacBook Air';
    else if (lower.includes('macbook')) baseFamily = 'MacBook';

    const mChip = lower.match(/m(\d)/);
    if (mChip) generationNumber = parseInt(mChip[1], 10);

    const sizeMatch = lower.match(/(\d+(?:\.\d+)?)[-"]\s?(?:inch)?/);
    if (sizeMatch) explicitSize = sizeMatch[1];
  } else if (category === 'watch') {
    if (lower.includes('ultra')) baseFamily = 'Watch Ultra';
    else if (lower.includes('se')) baseFamily = 'Watch SE';
    else if (lower.includes('series')) {
       baseFamily = 'Watch Series';
       const m = lower.match(/series\s+(\d+)/);
       if (m) generationNumber = parseInt(m[1], 10);
    } else {
       baseFamily = 'Watch';
    }

    const sizeMatch = lower.match(/(\d+)mm/);
    if (sizeMatch) explicitSize = sizeMatch[1];
  }

  return { baseFamily, generationNumber, variants, explicitSize, explicitYear };
}

interface RankTuple {
  isSameFamily: number;
  isExactGen: number;
  negativeGenDistance: number;
  sharedVariants: number;
  isSameSize: number;
  negativeYearDistance: number;
  fallbackScore: number;
}

export function getCrossModelRepairRecommendations(ctx: RecommendationContext): CrossModelCandidate[] {
  const { category, brandSlug, currentModelSlug, currentModelName, repairSlug, models, limit = 4 } = ctx;

  const normCurrentSlug = normalizeCandidateSlug(currentModelSlug);
  const sourceParsed = parseModel(currentModelName, category, brandSlug);
  const uniqueCandidates = new Map<string, CrossModelCandidate & { rankTuple: RankTuple }>();

  for (const m of models) {
    const normSlug = normalizeCandidateSlug(m.slug);
    if (normSlug === normCurrentSlug) continue; // Not current model
    if (!m.repairTypes.some(r => r.slug === repairSlug)) continue; // Must have same repair
    if (uniqueCandidates.has(normSlug)) continue; // Deduplicate by normalized slug before scoring

    const candidateParsed = parseModel(m.model, category, brandSlug);

    // Semantic duplication check
    if (category === 'laptop' || category === 'computer') {
      if (
        sourceParsed.baseFamily === candidateParsed.baseFamily &&
        sourceParsed.explicitSize !== null && candidateParsed.explicitSize !== null && sourceParsed.explicitSize === candidateParsed.explicitSize &&
        sourceParsed.generationNumber !== null && candidateParsed.generationNumber !== null && sourceParsed.generationNumber === candidateParsed.generationNumber &&
        sourceParsed.explicitYear !== null && candidateParsed.explicitYear !== null && sourceParsed.explicitYear === candidateParsed.explicitYear
      ) {
        continue;
      }
    }

    let reason = '';

    const rankTuple: RankTuple = {
      isSameFamily: sourceParsed.baseFamily === candidateParsed.baseFamily ? 1 : 0,
      isExactGen: 0,
      negativeGenDistance: -999, // Lower absolute distance is better, so closer to 0 is higher
      sharedVariants: 0,
      isSameSize: 0,
      negativeYearDistance: -999,
      fallbackScore: 0
    };

    if (rankTuple.isSameFamily) {
      reason += 'Same Family; ';

      if (sourceParsed.generationNumber !== null && candidateParsed.generationNumber !== null) {
        if (sourceParsed.generationNumber === candidateParsed.generationNumber) {
          rankTuple.isExactGen = 1;
          reason += 'Exact Gen; ';
        }
        const diff = Math.abs(sourceParsed.generationNumber - candidateParsed.generationNumber);
        rankTuple.negativeGenDistance = -diff;
        if (diff > 0) reason += `Gen Diff ${diff}; `;
      } else if (sourceParsed.generationNumber === null && candidateParsed.generationNumber === null) {
        rankTuple.negativeGenDistance = 0; // Both unknown is better than one known
      }

      for (const v of sourceParsed.variants) {
        if (candidateParsed.variants.has(v)) {
          rankTuple.sharedVariants++;
        }
      }
      if (rankTuple.sharedVariants > 0) {
        reason += `Shared Variants (${rankTuple.sharedVariants}); `;
      }

      // Penalties for variant mismatch when in same generation
      const sourceVariantCount = sourceParsed.variants.size;
      const candidateVariantCount = candidateParsed.variants.size;
      if (sourceVariantCount > 0 && candidateVariantCount === 0) rankTuple.fallbackScore -= 1;
      if (sourceVariantCount === 0 && candidateVariantCount > 0) rankTuple.fallbackScore -= 1;

      if (sourceParsed.explicitSize && sourceParsed.explicitSize === candidateParsed.explicitSize) {
        rankTuple.isSameSize = 1;
        reason += `Same Size (${sourceParsed.explicitSize}); `;
      }

      if (sourceParsed.explicitYear !== null && candidateParsed.explicitYear !== null) {
        const yearDiff = Math.abs(sourceParsed.explicitYear - candidateParsed.explicitYear);
        rankTuple.negativeYearDistance = -yearDiff;
        reason += `Year Diff ${yearDiff}; `;
      } else if (sourceParsed.explicitYear === null && candidateParsed.explicitYear === null) {
        rankTuple.negativeYearDistance = 0;
      }
    } else {
      reason += 'Diff Family; ';
    }

    uniqueCandidates.set(normSlug, {
      modelName: m.model,
      modelSlug: m.slug,
      repairSlug,
      score: 0, // Unused now, keeping for interface
      reason: reason.trim() || 'Fallback',
      rankTuple
    });
  }

  const sorted = Array.from(uniqueCandidates.values()).sort((a, b) => {
    const rA = a.rankTuple;
    const rB = b.rankTuple;

    if (rA.isSameFamily !== rB.isSameFamily) return rB.isSameFamily - rA.isSameFamily;

    if (category === 'phone') {
      if (rA.isExactGen !== rB.isExactGen) return rB.isExactGen - rA.isExactGen;
      if (rA.negativeGenDistance !== rB.negativeGenDistance) return rB.negativeGenDistance - rA.negativeGenDistance;
      if (rA.sharedVariants !== rB.sharedVariants) return rB.sharedVariants - rA.sharedVariants;
      if (rA.isSameSize !== rB.isSameSize) return rB.isSameSize - rA.isSameSize;
      if (rA.negativeYearDistance !== rB.negativeYearDistance) return rB.negativeYearDistance - rA.negativeYearDistance;
    } else if (category === 'tablet') {
      if (rA.isSameSize !== rB.isSameSize) return rB.isSameSize - rA.isSameSize;
      if (rA.isExactGen !== rB.isExactGen) return rB.isExactGen - rA.isExactGen;
      if (rA.negativeGenDistance !== rB.negativeGenDistance) return rB.negativeGenDistance - rA.negativeGenDistance;
      if (rA.sharedVariants !== rB.sharedVariants) return rB.sharedVariants - rA.sharedVariants;
    } else if (category === 'laptop' || category === 'computer') {
      if (rA.isSameSize !== rB.isSameSize) return rB.isSameSize - rA.isSameSize;
      if (rA.isExactGen !== rB.isExactGen) return rB.isExactGen - rA.isExactGen;
      if (rA.negativeGenDistance !== rB.negativeGenDistance) return rB.negativeGenDistance - rA.negativeGenDistance;
      if (rA.negativeYearDistance !== rB.negativeYearDistance) return rB.negativeYearDistance - rA.negativeYearDistance;
    } else if (category === 'watch') {
      if (rA.isExactGen !== rB.isExactGen) return rB.isExactGen - rA.isExactGen;
      if (rA.negativeGenDistance !== rB.negativeGenDistance) return rB.negativeGenDistance - rA.negativeGenDistance;
      if (rA.isSameSize !== rB.isSameSize) return rB.isSameSize - rA.isSameSize;
      if (rA.negativeYearDistance !== rB.negativeYearDistance) return rB.negativeYearDistance - rA.negativeYearDistance;
    } else {
      if (rA.isExactGen !== rB.isExactGen) return rB.isExactGen - rA.isExactGen;
      if (rA.negativeGenDistance !== rB.negativeGenDistance) return rB.negativeGenDistance - rA.negativeGenDistance;
      if (rA.sharedVariants !== rB.sharedVariants) return rB.sharedVariants - rA.sharedVariants;
    }

    if (rA.fallbackScore !== rB.fallbackScore) return rB.fallbackScore - rA.fallbackScore;

    const normNameCompare = normalizeCandidateSlug(a.modelName).localeCompare(normalizeCandidateSlug(b.modelName));
    if (normNameCompare !== 0) return normNameCompare;

    return normalizeCandidateSlug(a.modelSlug).localeCompare(normalizeCandidateSlug(b.modelSlug));
  });

  return sorted.slice(0, limit).map(c => ({
    modelName: c.modelName,
    modelSlug: c.modelSlug,
    repairSlug: c.repairSlug,
    score: c.score,
    reason: c.reason
  }));
}

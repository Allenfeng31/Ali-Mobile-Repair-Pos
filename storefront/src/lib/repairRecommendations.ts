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
}

function parseModel(modelName: string, category: string, brandSlug: string): ParsedModel {
  const lower = modelName.toLowerCase();
  let baseFamily = 'Generic';
  let generationNumber: number | null = null;
  const variants = new Set<string>();

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

    const genMatch = lower.match(/(\d+)(?:th|rd|nd|st)\s+gen/);
    if (genMatch) generationNumber = parseInt(genMatch[1], 10);
    
    const sizeMatch = lower.match(/(\d+(?:\.\d+)?)-inch/);
    if (sizeMatch) variants.add(`${sizeMatch[1]}-inch`);

  } else if (category === 'laptop' || category === 'computer') {
    if (lower.includes('macbook pro')) baseFamily = 'MacBook Pro';
    else if (lower.includes('macbook air')) baseFamily = 'MacBook Air';
    else if (lower.includes('macbook')) baseFamily = 'MacBook';

    const mChip = lower.match(/m(\d)/);
    if (mChip) generationNumber = parseInt(mChip[1], 10);

    const sizeMatch = lower.match(/(\d+(?:\.\d+)?)[-"]\s?(?:inch)?/);
    if (sizeMatch) variants.add(`${sizeMatch[1]}-inch`);
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
    if (sizeMatch) variants.add(`${sizeMatch[1]}mm`);
  }

  return { baseFamily, generationNumber, variants };
}

export function getCrossModelRepairRecommendations(ctx: RecommendationContext): CrossModelCandidate[] {
  const { category, brandSlug, currentModelSlug, currentModelName, repairSlug, models, limit = 4 } = ctx;
  const candidates: CrossModelCandidate[] = [];

  const sourceParsed = parseModel(currentModelName, category, brandSlug);

  for (const m of models) {
    if (m.slug === currentModelSlug) continue; // Not current model
    if (!m.repairTypes.some(r => r.slug === repairSlug)) continue; // Must have same repair

    const candidateParsed = parseModel(m.model, category, brandSlug);
    let score = 0;
    let reason = '';

    // 1. Same product family
    if (sourceParsed.baseFamily === candidateParsed.baseFamily) {
      score += 1000;
      reason += 'Same Family; ';

      // 2. Same generation or nearest numeric generation
      if (sourceParsed.generationNumber !== null && candidateParsed.generationNumber !== null) {
        const diff = Math.abs(sourceParsed.generationNumber - candidateParsed.generationNumber);
        score += Math.max(100 - (diff * 20), 0);
        reason += `Gen Diff ${diff}; `;
      } else if (sourceParsed.generationNumber === null && candidateParsed.generationNumber === null) {
        score += 50;
      }

      // 3. Same variant or size
      let sharedVariants = 0;
      for (const v of sourceParsed.variants) {
        if (candidateParsed.variants.has(v)) {
          score += 300;
          reason += `Shared Variant (${v}); `;
          sharedVariants++;
        }
      }
      
      const sourceVariantCount = sourceParsed.variants.size;
      const candidateVariantCount = candidateParsed.variants.size;
      if (sourceVariantCount === 0 && candidateVariantCount > 0) {
        score -= 50; 
      } else if (sourceVariantCount > 0 && candidateVariantCount === 0) {
        score -= 50; 
      } else if (sourceVariantCount > 0 && sharedVariants === 0) {
        score -= 100;
      }
    } else {
      // Different family fallback
      score += 10;
      reason += 'Different Family; ';
    }

    candidates.push({
      modelName: m.model,
      modelSlug: m.slug,
      repairSlug,
      score,
      reason: reason.trim() || 'Fallback'
    });
  }

  // Deduplicate just in case
  const uniqueCandidates = new Map<string, CrossModelCandidate>();
  for (const c of candidates) {
    if (!uniqueCandidates.has(c.modelSlug)) {
      uniqueCandidates.set(c.modelSlug, c);
    }
  }

  const sorted = Array.from(uniqueCandidates.values()).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // 4. Stable normalized-name/slug fallback
    return a.modelName.localeCompare(b.modelName);
  });

  return sorted.slice(0, limit);
}

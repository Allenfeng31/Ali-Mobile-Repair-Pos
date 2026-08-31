export type SharedRepairRouteContext =
  | Readonly<{ scope: 'global' }>
  | Readonly<{
      scope: 'brand';
      canonicalBrandSlug: string;
      routeBrandSegment: string;
    }>;

export type SharedRepairModelCandidate = Readonly<{
  canonicalBrandSlug: string;
  modelSlug: string;
  displayBrand: string;
  displayModel: string;
}>;

export type SharedRepairContextInput = Readonly<{
  route: SharedRepairRouteContext;
  repairSlug: string;
  bookingService: string;
  query: Readonly<{
    brand?: string | readonly string[];
    model?: string | readonly string[];
    service?: string | readonly string[];
  }>;
  candidates: readonly SharedRepairModelCandidate[];
}>;

export type SharedRepairContextReason =
  | 'generic-context'
  | 'brand-context'
  | 'model-context'
  | 'invalid-query-shape'
  | 'invalid-brand'
  | 'invalid-model'
  | 'brand-model-mismatch'
  | 'route-brand-mismatch'
  | 'forbidden-service-override'
  | 'invalid-candidates';

export type SharedRepairContext = Readonly<{
  canonicalBrandSlug: string | null;
  routeBrandSegment: string | null;
  modelSlug: string | null;
  displayBrand: string | null;
  displayModel: string | null;
  repairSlug: string;
  bookingService: string;
  isValid: boolean;
  reason: SharedRepairContextReason;
}>;

const CANONICAL_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isCanonicalSlug(value: string) {
  return CANONICAL_SLUG.test(value);
}

function hasDisplayValue(value: string) {
  return /\S/.test(value);
}

function candidateKey(candidate: SharedRepairModelCandidate) {
  return `${candidate.canonicalBrandSlug}/${candidate.modelSlug}`;
}

function hasValidCandidates(candidates: readonly SharedRepairModelCandidate[]) {
  const seenKeys: Record<string, true> = {};

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'object'
      || !isCanonicalSlug(candidate.canonicalBrandSlug)
      || !isCanonicalSlug(candidate.modelSlug)
      || !hasDisplayValue(candidate.displayBrand)
      || !hasDisplayValue(candidate.displayModel)) {
      return false;
    }

    const key = candidateKey(candidate);
    if (seenKeys[key]) return false;
    seenKeys[key] = true;
  }

  return true;
}

function invalidOutput(
  input: SharedRepairContextInput,
  reason: Exclude<SharedRepairContextReason, 'generic-context' | 'brand-context' | 'model-context'>,
): SharedRepairContext {
  const route = input.route;
  const fixedBrand = route.scope === 'brand' ? route.canonicalBrandSlug : null;
  const fixedSegment = route.scope === 'brand' ? route.routeBrandSegment : null;
  const displayBrand = fixedBrand && reason !== 'invalid-candidates'
    ? input.candidates.find((candidate) => candidate.canonicalBrandSlug === fixedBrand)?.displayBrand ?? null
    : null;

  return Object.freeze({
    canonicalBrandSlug: fixedBrand,
    routeBrandSegment: fixedSegment,
    modelSlug: null,
    displayBrand,
    displayModel: null,
    repairSlug: input.repairSlug,
    bookingService: input.bookingService,
    isValid: false,
    reason,
  });
}

function validatedQueryValue(value: string | readonly string[] | undefined) {
  if (value === undefined) return { value: null, valid: true } as const;
  if (typeof value !== 'string') return { value: null, valid: false } as const;
  return { value, valid: true } as const;
}

function contextOutput(
  input: SharedRepairContextInput,
  reason: Extract<SharedRepairContextReason, 'generic-context' | 'brand-context' | 'model-context'>,
  candidate: SharedRepairModelCandidate | null,
  canonicalBrandSlug: string | null,
): SharedRepairContext {
  return Object.freeze({
    canonicalBrandSlug,
    routeBrandSegment: input.route.scope === 'brand' ? input.route.routeBrandSegment : null,
    modelSlug: reason === 'model-context' ? candidate?.modelSlug ?? null : null,
    displayBrand: candidate?.displayBrand ?? null,
    displayModel: reason === 'model-context' ? candidate?.displayModel ?? null : null,
    repairSlug: input.repairSlug,
    bookingService: input.bookingService,
    isValid: true,
    reason,
  });
}

/**
 * Validates untrusted shared-page query state without generating URLs, metadata,
 * static params, redirects, or booking payloads. Future consumers own those effects.
 */
export function resolveSharedRepairContext(input: SharedRepairContextInput): SharedRepairContext {
  if (!hasValidCandidates(input.candidates)) {
    return invalidOutput(input, 'invalid-candidates');
  }

  const brand = validatedQueryValue(input.query.brand);
  const model = validatedQueryValue(input.query.model);
  const service = validatedQueryValue(input.query.service);
  if (!brand.valid || !model.valid || !service.valid) {
    return invalidOutput(input, 'invalid-query-shape');
  }

  if (service.value !== null) {
    return invalidOutput(input, 'forbidden-service-override');
  }

  if (brand.value !== null && !isCanonicalSlug(brand.value)) {
    return invalidOutput(input, 'invalid-brand');
  }
  if (model.value !== null && !isCanonicalSlug(model.value)) {
    return invalidOutput(input, 'invalid-model');
  }

  if (input.route.scope === 'brand') {
    const fixedBrand = input.route.canonicalBrandSlug;
    if (!isCanonicalSlug(fixedBrand) || !isCanonicalSlug(input.route.routeBrandSegment)) {
      return invalidOutput(input, 'invalid-candidates');
    }
    if (brand.value !== null && brand.value !== fixedBrand) {
      return invalidOutput(input, 'route-brand-mismatch');
    }

    const brandCandidate = input.candidates.find((candidate) => candidate.canonicalBrandSlug === fixedBrand) ?? null;
    if (!brandCandidate) return invalidOutput(input, 'invalid-brand');
    if (model.value === null) return contextOutput(input, 'brand-context', brandCandidate, fixedBrand);

    const candidate = input.candidates.find((entry) =>
      entry.canonicalBrandSlug === fixedBrand && entry.modelSlug === model.value,
    ) ?? null;
    if (candidate) return contextOutput(input, 'model-context', candidate, fixedBrand);

    const otherBrandCandidate = input.candidates.find((entry) => entry.modelSlug === model.value);
    return invalidOutput(input, otherBrandCandidate ? 'brand-model-mismatch' : 'invalid-model');
  }

  if (brand.value === null && model.value === null) {
    return contextOutput(input, 'generic-context', null, null);
  }
  if (brand.value === null) return invalidOutput(input, 'invalid-brand');

  const brandCandidate = input.candidates.find((candidate) => candidate.canonicalBrandSlug === brand.value) ?? null;
  if (!brandCandidate) return invalidOutput(input, 'invalid-brand');
  if (model.value === null) return contextOutput(input, 'brand-context', brandCandidate, brand.value);

  const candidate = input.candidates.find((entry) =>
    entry.canonicalBrandSlug === brand.value && entry.modelSlug === model.value,
  ) ?? null;
  if (candidate) return contextOutput(input, 'model-context', candidate, brand.value);

  const otherBrandCandidate = input.candidates.find((entry) => entry.modelSlug === model.value);
  return invalidOutput(input, otherBrandCandidate ? 'brand-model-mismatch' : 'invalid-model');
}

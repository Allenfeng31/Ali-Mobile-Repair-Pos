/**
 * One-time pre-Hybrid public-detail cutoff. This is deliberately static: a
 * later POS row may support pricing and booking, but cannot create an SEO
 * detail page without an explicit source change here.
 */
export const GRANDFATHERED_SECONDARY_PHONE_DETAIL_REPAIR_CUTOFF = Object.freeze({
  validatedAt: '2026-09-24T16:30:51.323+00:00',
  source: 'Durable public repair catalogue snapshot before secondary-phone Hybrid cutover.',
  checksum: '9c23fe646dde54b470f27b23af8f422d0d7e081668a06799fff090f32432d725',
});

export const GRANDFATHERED_SECONDARY_PHONE_DETAIL_REPAIR_SLUGS = Object.freeze([
  'screen-replacement',
  'battery-replacement',
  'charging-port-replacement',
  'back-glass-replacement',
] as const);

type GrandfatheredRepairSlug = (typeof GRANDFATHERED_SECONDARY_PHONE_DETAIL_REPAIR_SLUGS)[number];

export type GrandfatheredSecondaryPhoneDetailRepair = Readonly<{
  category: 'phone';
  brandSlug: string;
  modelSlug: string;
  repairSlug: GrandfatheredRepairSlug;
}>;

const APPROVED_PRE_HYBRID_REPAIR_SLUGS = Object.freeze([
  'screen-replacement',
  'battery-replacement',
  'charging-port-replacement',
] as const);

const MODELS_BY_BRAND = Object.freeze({
  asus: 'rog-phone-3 rog-phone-5 rog-phone-6 zenfone-8 zenfone-9'.split(' '),
  htc: 'desire-21-pro-5g one-m8 one-m9 u11 u12-plus'.split(' '),
  huawei: 'mate-20-pro mate-30-pro nova-5t p30-pro p40-pro'.split(' '),
  lg: 'g7-thinq g8s g8s-thinq k10-k430 k10-k530 k10-m250yk k11-plus k4-x230 k50 k520 nexus-4 nexus-5 nexus-5x v30 v40 v40-thinq v50 velvet'.split(' '),
  microsoft: 'lumia-640 lumia-950 lumia-950-xl surface-duo surface-duo-2'.split(' '),
  motorola: 'edge-20 edge-30-pro moto-g-power moto-g-stylus moto-g04 moto-g24 moto-g50 moto-g55'.split(' '),
  nokia: '31 32 42 51 51-plus 53 54 61 61-plus 62 640xl 7-plus 71 72 81 83-5g 9-pureview 950xl c21-plus c22 c30 c32 g10 g11 g11-plus g20 g21 g22 g42 g50 g60 x20 xr20 xr21'.split(' '),
  nothing: 'cmf-phone-2-pro-5g phone-1 phone-2 phone-3a-5g phone-3a-pro-5g'.split(' '),
  oneplus: '10-pro 10t 8-pro 9-pro 9rt-5g nord-2 nord-5g nord-ce-2-5g nord-ce-5g'.split(' '),
  realme: '7-pro 8-5g c21y gt-master-edition x3-superzoom'.split(' '),
  sony: 'xperia-1 xperia-1-ii xperia-10-ii xperia-5 xperia-5-ii'.split(' '),
  tcl: '10-pro 20-5g 20-pro-5g 30-plus 30-se'.split(' '),
  telstra: 'essential-pro essential-smart-21 evoke-pro-2 t-smart tough-max-3'.split(' '),
  vivo: 's15e v29 x50 x50-pro x60-pro x70-pro y11 y11s y12 y12a y15 y15s y16 y17 y17s y20 y20i y20s y20s-g y21 y21s y22 y22s y30 y30g y33s y3s y52-5g y55-5g y56-5g y70 y76-5g'.split(' '),
  xiaomi: '12-pro 13-pro 14c 14c-5g 14r-5g mi-10 mi-10-pro mi-11 mi-11-lite mi-8 mi-9 mi-9t mi-a2 mi-a3 mi-max-3 mi-mix-2s mi-mix-3 mi-note-10 mi-note-10-pro note-13-pro-5g poco-c75 poco-f1 poco-f3 poco-x3 redmi-10 redmi-12 redmi-13c redmi-7 redmi-note-10-pro redmi-note-11-pro redmi-note-5 redmi-note-6-pro redmi-note-7'.split(' '),
} as const);

export const GRANDFATHERED_SECONDARY_PHONE_DETAIL_REPAIRS: readonly GrandfatheredSecondaryPhoneDetailRepair[] = Object.freeze(
  Object.entries(MODELS_BY_BRAND).flatMap(([brandSlug, modelSlugs]) =>
    modelSlugs.flatMap((modelSlug) =>
      APPROVED_PRE_HYBRID_REPAIR_SLUGS.map((repairSlug) => Object.freeze({
        category: 'phone' as const,
        brandSlug,
        modelSlug,
        repairSlug,
      })),
    ),
  ),
);

const APPROVED_IDENTITIES = new Set(
  GRANDFATHERED_SECONDARY_PHONE_DETAIL_REPAIRS.map(
    ({ category, brandSlug, modelSlug, repairSlug }) => `${category}/${brandSlug}/${modelSlug}/${repairSlug}`,
  ),
);

/** Exact, fail-closed authority for secondary phone dedicated detail pages. */
export function isGrandfatheredSecondaryPhoneDetailRepair(
  category: string,
  brandSlug: string,
  modelSlug: string,
  repairSlug: string,
) {
  return category === 'phone'
    && (GRANDFATHERED_SECONDARY_PHONE_DETAIL_REPAIR_SLUGS as readonly string[]).includes(repairSlug)
    && APPROVED_IDENTITIES.has(`${category}/${brandSlug}/${modelSlug}/${repairSlug}`);
}

import { evaluateTargetPublicRepairPageMode } from './publicRepairPageModePolicy';

const FUTURE_SHARED_MASTER_ROUTES = [
  {
    category: 'phone',
    canonicalBrandSlug: 'google-pixel',
    repairSlug: 'loudspeaker-replacement',
    targetMode: 'brand-shared',
    href: '/repairs/phone/google/loudspeaker-replacement',
  },
  {
    category: 'phone',
    canonicalBrandSlug: 'google-pixel',
    repairSlug: 'earpiece-speaker-replacement',
    targetMode: 'brand-shared',
    href: '/repairs/phone/google/earpiece-speaker-replacement',
  },
  {
    category: 'phone',
    canonicalBrandSlug: 'google-pixel',
    repairSlug: 'power-button-replacement',
    targetMode: 'brand-shared',
    href: '/repairs/phone/google/power-button-replacement',
  },
  {
    category: 'phone',
    canonicalBrandSlug: 'google-pixel',
    repairSlug: 'volume-button-replacement',
    targetMode: 'brand-shared',
    href: '/repairs/phone/google/volume-button-replacement',
  },
] as const;

export function resolveFutureRepairResultDestination(input: {
  category: string;
  brandSlug: string;
  modelSlug: string;
  repairSlug: string;
}) {
  const decision = evaluateTargetPublicRepairPageMode(input);
  const route = FUTURE_SHARED_MASTER_ROUTES.find((candidate) => (
    candidate.category === input.category
    && candidate.canonicalBrandSlug === decision.canonicalBrandSlug
    && candidate.repairSlug === decision.canonicalRepairSlug
    && candidate.targetMode === decision.targetMode
  ));

  return route && decision.sharedMasterAvailability === 'available'
    ? { href: route.href, decision }
    : null;
}

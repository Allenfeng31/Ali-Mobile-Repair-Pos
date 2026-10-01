import { evaluateTargetPublicRepairPageMode, PUBLIC_REPAIR_SHARED_ROUTE_REGISTRY } from './publicRepairPageModePolicy';

export function resolveFutureRepairResultDestination(input: {
  category: string;
  brandSlug: string;
  modelSlug: string;
  repairSlug: string;
}) {
  const decision = evaluateTargetPublicRepairPageMode(input);
  const route = decision.targetMode === 'brand-shared'
    ? PUBLIC_REPAIR_SHARED_ROUTE_REGISTRY.find((candidate) => (
      candidate.catalogueBrandSlug === decision.canonicalBrandSlug
      && candidate.repairSlug === decision.canonicalRepairSlug
    ))
    : null;

  return route && decision.sharedMasterAvailability === 'available'
    ? { href: `${route.href}?model=${encodeURIComponent(input.modelSlug)}`, decision }
    : null;
}

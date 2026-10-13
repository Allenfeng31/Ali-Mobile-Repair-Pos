import { OPPO_ENHANCED_CONFIG } from "./config";

export function getOppoModelConfig(modelSlug: string) {
  return OPPO_ENHANCED_CONFIG.models[modelSlug];
}

export function getOppoBackGlassTurnaroundMinutes(modelSlug: string) {
  const config = getOppoModelConfig(modelSlug);
  if (!config) return undefined;

  const terminology = config.rearPanelPublicTerminology.toLowerCase();
  const isConfirmedRearGlassOrCover =
    config.rearPanelType === 'glass' &&
    (terminology.includes('glass') || terminology.includes('back cover'));

  return isConfirmedRearGlassOrCover ? 20 : undefined;
}

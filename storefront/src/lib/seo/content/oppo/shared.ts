import { OppoEnhancedConfig } from "./types";
import { OPPO_ENHANCED_CONFIG } from "./config";

export function getOppoModelConfig(modelSlug: string) {
  return OPPO_ENHANCED_CONFIG.models[modelSlug];
}

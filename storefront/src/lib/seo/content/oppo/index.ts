import { getOppoScreenPocket } from "./screen-replacement";
import { getOppoBatteryPocket } from "./battery-replacement";
import { getOppoChargingPortPocket } from "./charging-port-replacement";
import { getOppoBackGlassPocket } from "./back-glass-replacement";
import { getOppoFrontCameraPocket } from "./front-camera-replacement";
import { getOppoBackCameraPocket } from "./back-camera-replacement";
import { getOppoLogicBoardPocket } from "./logic-board-repair";
import { getOppoModelConfig } from "./shared";
export { getOppoModelConfig };

export function getAliMobileEnhancedOppoSeoPocket({
  category,
  brand,
  model,
  repairType,
  pocket
}: {
  category: string;
  brand: string;
  model: string;
  repairType: string;
  pocket: any;
}) {
  if (brand.toLowerCase() !== "oppo") return pocket;

  const config = getOppoModelConfig(model.toLowerCase());
  if (!config) return pocket;

  const repairSlug = repairType.toLowerCase();
  
  let oppoPocket = null;
  switch (repairSlug) {
    case "screen-replacement": oppoPocket = getOppoScreenPocket(model.toLowerCase()); break;
    case "battery-replacement": oppoPocket = getOppoBatteryPocket(model.toLowerCase()); break;
    case "charging-port-replacement": oppoPocket = getOppoChargingPortPocket(model.toLowerCase()); break;
    case "back-glass-replacement":
    case "back-housing-replacement": oppoPocket = getOppoBackGlassPocket(model.toLowerCase()); break;
    case "front-camera-replacement": oppoPocket = getOppoFrontCameraPocket(model.toLowerCase()); break;
    case "back-camera-replacement": oppoPocket = getOppoBackCameraPocket(model.toLowerCase()); break;
    case "logic-board-repair": oppoPocket = getOppoLogicBoardPocket(model.toLowerCase()); break;
  }

  return oppoPocket || pocket;
}

export function getAliMobileEnhancedOppoRepairType(params: any): string | null {
  if (params.brand?.toLowerCase() !== "oppo") return null;

  const config = getOppoModelConfig(params.model?.toLowerCase() || "");
  if (!config) return null;

  const validRoutes = [
    'screen-replacement',
    'battery-replacement',
    'charging-port-replacement',
    'back-glass-replacement',
    'back-housing-replacement',
    'front-camera-replacement',
    'back-camera-replacement',
    'logic-board-repair'
  ];
  const repairType = params['repair-type']?.toLowerCase();
  return validRoutes.includes(repairType) ? repairType : null;
}

export function isAliMobileEnhancedOppoRepairPage(params: any): boolean {
  return getAliMobileEnhancedOppoRepairType(params) !== null;
}

export function getEnhancedOppoSeriesModelHubLinks(
  models: ReadonlyArray<{ slug: string; model: string }>,
  currentModelSlug: string
) {
  const currentConfig = getOppoModelConfig(currentModelSlug);
  if (!currentConfig) return [];

  const currentSeries = currentConfig.series;
  
  if (currentSeries === 'A Series') {
    const commercialPool = [
      'a98', 'a96', 'a79', 'a78-5g', 'a77-5g', 'a76',
      'a74-5g', 'a74', 'a73', 'a54-5g', 'a54', 'a53s'
    ];
    const available = commercialPool.filter(s => s !== currentModelSlug.toLowerCase());
    const offset = currentModelSlug.length % Math.max(1, available.length - 5);
    const selected = available.slice(offset, offset + 6);
    
    return selected.map(slug => {
      const candidateConfig = getOppoModelConfig(slug);
      return {
        href: `/repairs/phone/oppo/${slug}`,
        label: `Explore OPPO ${candidateConfig?.displayName || slug.toUpperCase()} repairs`,
        slug
      };
    });
  }

  return models
    .filter(model => model.slug.toLowerCase() !== currentModelSlug.toLowerCase())
    .map(model => {
      const candidateConfig = getOppoModelConfig(model.slug.toLowerCase());
      if (!candidateConfig || candidateConfig.series !== currentSeries) return null;
      
      return {
        href: `/repairs/phone/oppo/${model.slug}`,
        label: `Explore OPPO ${candidateConfig.displayName} repairs`,
        slug: model.slug
      };
    })
    .filter((item): item is { href: string; label: string; slug: string } => item !== null)
    .slice(0, 6);
}

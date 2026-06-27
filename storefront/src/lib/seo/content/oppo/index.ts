import { getOppoScreenPocket } from "./screen-replacement";
import { getOppoBatteryPocket } from "./battery-replacement";
import { getOppoChargingPortPocket } from "./charging-port-replacement";
import { getOppoBackGlassPocket } from "./back-glass-replacement";
import { getOppoFrontCameraPocket } from "./front-camera-replacement";
import { getOppoBackCameraPocket } from "./back-camera-replacement";
import { getOppoLogicBoardPocket } from "./logic-board-repair";
import { getOppoModelConfig } from "./shared";
import { RepairTypeSeoPocket } from "../iphone/types"; // Assuming RepairTypeSeoPocket is available globally or here. Actually it's imported in page.tsx from iphone/types but let's use the local one if we didn't export it. Wait, I'll just use any or omit strict types for the signature. Or import from "../../../seo/content/iphone". 
// Actually, let's just make it return the pocket if matched, else the original pocket.

export function getAliMobileEnhancedOppoSeoPocket({
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
  if (model.toLowerCase() !== "a98") return pocket;

  const config = getOppoModelConfig("a98");
  if (!config) return pocket;

  const repairSlug = repairType.toLowerCase();
  
  let oppoPocket = null;
  switch (repairSlug) {
    case "screen-replacement": oppoPocket = getOppoScreenPocket("a98"); break;
    case "battery-replacement": oppoPocket = getOppoBatteryPocket("a98"); break;
    case "charging-port-replacement": oppoPocket = getOppoChargingPortPocket("a98"); break;
    case "back-glass-replacement": oppoPocket = getOppoBackGlassPocket("a98"); break;
    case "front-camera-replacement": oppoPocket = getOppoFrontCameraPocket("a98"); break;
    case "back-camera-replacement": oppoPocket = getOppoBackCameraPocket("a98"); break;
    case "logic-board-repair": oppoPocket = getOppoLogicBoardPocket("a98"); break;
  }

  return oppoPocket || pocket;
}

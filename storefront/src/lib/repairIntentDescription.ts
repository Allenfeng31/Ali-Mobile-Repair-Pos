import { getRepairOptionIntent, type RepairOptionIntent } from '@/lib/repairOptionDisplayOrder';
import { isWaterDamageRepairSlug } from '@/lib/waterDamageRouting';

type RepairIntentDescriptionInput = {
  model: string;
  repairName: string;
  repairSlug: string;
  category?: string;
};

function getSafeRepairIntent(repairSlug: string): RepairOptionIntent {
  const intent = getRepairOptionIntent(repairSlug);

  return intent === 'water-damage' && !isWaterDamageRepairSlug(repairSlug) ? 'generic' : intent;
}

function getScreenDescription(model: string, category?: string): string {
  const normalizedCategory = category?.trim().toLowerCase();

  if (normalizedCategory === 'phone' || normalizedCategory === 'tablet' || normalizedCategory === 'watch') {
    return `${model} screen replacement in Ringwood for cracked glass, display faults or touch-screen problems. We inspect the device and confirm the repair path before work starts.`;
  }

  return `${model} screen repair in Ringwood for cracked display, image faults or screen damage. We inspect the device and confirm the repair path before work starts.`;
}

/**
 * Builds a concise, deterministic service summary for generic repair-detail
 * metadata and JSON-LD fallbacks. It deliberately reuses the catalogue's
 * display-order aliases and the canonical water-damage routing helper.
 */
export function getRepairIntentDescription({
  model,
  repairName,
  repairSlug,
  category,
}: RepairIntentDescriptionInput): string {
  switch (getSafeRepairIntent(repairSlug)) {
    case 'screen':
      return getScreenDescription(model, category);
    case 'battery':
      return `${model} battery replacement in Ringwood for poor battery life, unexpected shutdowns or battery-health concerns. We inspect the device and confirm the repair path first.`;
    case 'charging-port':
      return `${model} charging port repair in Ringwood for no charging, intermittent power or a loose connection. We inspect the port and confirm the repair path first.`;
    case 'back-glass':
      return `${model} back glass replacement in Ringwood for cracked rear glass or a damaged back housing. We inspect the device and confirm the repair path first.`;
    case 'back-camera':
      return `${model} back camera replacement in Ringwood for a rear camera that is not working, blurry images or focus problems. We inspect the device before work.`;
    case 'front-camera':
      return `${model} front camera replacement in Ringwood for a selfie camera that is not working, blurred images or focus problems. We inspect the device before work.`;
    case 'camera-lens':
      return `${model} camera lens replacement in Ringwood for a cracked lens cover or damaged camera lens. We inspect the device and confirm the repair path first.`;
    case 'water-damage':
      return `${model} water damage assessment in Ringwood for liquid damage, corrosion inspection or internal cleaning. We inspect the device before confirming any repair path.`;
    case 'loudspeaker':
      return `${model} loudspeaker replacement in Ringwood for no sound, low volume or distorted speaker audio. We inspect the device and confirm the repair path first.`;
    case 'earpiece-speaker':
      return `${model} earpiece speaker replacement in Ringwood for low call volume, no sound during calls or distorted earpiece audio. We inspect the device first.`;
    case 'power-button':
      return `${model} power button replacement in Ringwood for an unresponsive or damaged side button. We inspect the device and confirm the repair path first.`;
    case 'volume-button':
      return `${model} volume button replacement in Ringwood for controls that are not responding or damaged buttons. We inspect the device and confirm the repair path first.`;
    case 'logic-board':
      return `${model} logic board repair assessment in Ringwood for no power, boot issues or suspected board-level faults. We inspect the device and explain the available repair options.`;
    default:
      return `${model} ${repairName.toLowerCase()} in Ringwood. We inspect the device and confirm the repair path, timing and parts availability before work begins.`;
  }
}

export interface RepairResultDescriptionInput {
  deviceName: string;
  repairType: string;
  repairTypeSlug: string;
}

export interface RepairResultDescriptionPreset {
  id: string;
  label: string;
  description: string;
}

type PresetDefinition = {
  id: string;
  label: string;
  describe: (deviceName: string, repairType: string) => string;
};

const definition = (
  id: string,
  label: string,
  describe: PresetDefinition['describe'],
): PresetDefinition => ({ id, label, describe });

const SCREEN_PRESETS: PresetDefinition[] = [
  definition('no-display', 'No Display', (device) => `This ${device} arrived with a display that stopped showing an image after an impact. Following a screen replacement, the display was working again during post-repair checks.`),
  definition('cracked-glass', 'Cracked Glass', (device) => `The front glass on this ${device} was cracked or shattered. A screen replacement was completed and the replacement display was checked before return.`),
  definition('touch-failure', 'Touch Failure', (device) => `This ${device} had a touchscreen that was no longer responding correctly. Touch function was restored following the screen replacement and verified during testing.`),
  definition('screen-lines', 'Screen Lines', (device) => `Vertical or horizontal lines were visible across the display of this ${device}. The damaged screen assembly was replaced and the new display was checked for a clear image.`),
  definition('black-spots', 'Black Spots', (device) => `This ${device} showed dark patches and damaged areas within the display. A screen replacement was completed to address the visible panel damage.`),
  definition('flickering', 'Flickering', (device) => `The display on this ${device} was flickering intermittently before repair. The screen was replaced and its image remained stable during post-repair checks.`),
  definition('green-white-screen', 'Green / White Screen', (device) => `This ${device} presented with an abnormal solid-colour or severely distorted display. A screen replacement was completed and normal display output was confirmed during testing.`),
  definition('ghost-touch', 'Ghost Touch', (device) => `The screen on this ${device} was registering unintended inputs and operating by itself. Replacing the screen addressed the ghost-touch behaviour during post-repair checks.`),
  definition('dead-pixels', 'Dead Pixels', (device) => `Pixel defects and visible display abnormalities were present on this ${device}. A screen replacement was completed and the replacement panel was inspected during testing.`),
  definition('screen-lifting', 'Screen Lifting', (device) => `The display assembly on this ${device} was damaged or separating from the frame. The screen assembly was replaced and its fit was checked before return.`),
];

const BATTERY_PRESETS: PresetDefinition[] = [
  definition('rapid-drain', 'Rapid Drain', (device) => `This ${device} was experiencing unusually rapid battery drain. A battery replacement was completed to address the battery performance issue.`),
  definition('low-battery-health', 'Low Battery Health', (device) => `Testing showed reduced battery health or degraded capacity on this ${device}. The worn battery was replaced and the device was checked afterwards.`),
  definition('unexpected-shutdown', 'Unexpected Shutdown', (device) => `This ${device} was shutting down unexpectedly during normal use. A battery replacement was completed after the battery was identified as the cause.`),
  definition('no-power', 'No Power', (device) => `This ${device} could not power on and assessment confirmed a battery-related fault. The battery was replaced before power and charging checks were completed.`),
  definition('swollen-battery', 'Swollen Battery', (device) => `Battery swelling was identified while inspecting this ${device}. The swollen battery was removed and replaced before the device was checked for safe operation.`),
  definition('overheating', 'Overheating', (device) => `Assessment linked the reported overheating concern on this ${device} to its battery. A battery replacement was completed to address the diagnosed battery issue.`),
  definition('percentage-jump', 'Percentage Jump', (device) => `This ${device} was showing erratic jumps in its battery percentage. Replacing the battery addressed the inconsistent charge readings during testing.`),
  definition('battery-warning', 'Battery Warning', (device) => `A battery service or replacement warning was showing on this ${device}. The battery was replaced and the device was checked after the repair.`),
  definition('short-battery-life', 'Short Battery Life', (device) => `Everyday operating time had become significantly reduced on this ${device}. A battery replacement was completed to address the degraded battery performance.`),
  definition('intermittent-power', 'Intermittent Power', (device) => `This ${device} had irregular power behaviour that assessment traced to the battery. The battery was replaced and power stability was checked afterwards.`),
];

const CHARGING_PRESETS: PresetDefinition[] = [
  definition('not-charging', 'Not Charging', (device) => `This ${device} was not accepting a charge through its charging port. A charging port replacement was completed and charging was checked afterwards.`),
  definition('loose-port', 'Loose Port', (device) => `The charging connector fitted loosely in this ${device}. Replacing the charging port addressed the worn physical connection.`),
  definition('cable-angle', 'Cable Angle', (device) => `This ${device} had an unreliable charging connection that only worked when the cable was held at certain angles. A charging port replacement was completed to address the faulty connection.`),
  definition('intermittent-charging', 'Intermittent Charging', (device) => `Charging repeatedly connected and disconnected on this ${device}. The charging port was replaced and a stable connection was checked after repair.`),
  definition('slow-charging', 'Slow Charging', (device) => `Assessment identified a port-related charging performance problem on this ${device}. A charging port replacement was completed to address the diagnosed fault.`),
  definition('damaged-pins', 'Damaged Pins', (device) => `Physical damage was visible on the charging port contacts of this ${device}. The damaged port assembly was replaced and the connection was tested.`),
  definition('broken-connector', 'Broken Connector', (device) => `This ${device} had a damaged charging connector or port assembly. A charging port replacement was completed and the new connector was checked.`),
  definition('liquid-exposure', 'Liquid Exposure', (device) => `Assessment found charging port damage after reported liquid exposure on this ${device}. The affected charging port was replaced and its operation was checked.`),
  definition('cable-not-detected', 'Cable Not Detected', (device) => `This ${device} was failing to detect an attached charging cable. Replacing the charging port addressed the connection fault during testing.`),
  definition('data-connection', 'Data Connection', (device) => `The USB or data connection through the port on this ${device} was not working correctly. A charging port replacement was completed to address the port-related connectivity issue.`),
];

function fiveServicePresets(service: string, scenarios: Array<[string, string, string]>): PresetDefinition[] {
  return scenarios.map(([label, finding, action]) => definition(
    label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    label,
    (device) => `${finding.replace('{device}', device)}. ${action.replace('{device}', device).replace('{service}', service)}.`,
  ));
}

const OTHER_PRESETS: Record<string, PresetDefinition[]> = {
  'back-glass-replacement': fiveServicePresets('back glass replacement', [
    ['Cracked Back', 'The rear glass on this {device} was cracked', 'A {service} was completed and the new panel was checked for fit'],
    ['Shattered Panel', 'This {device} arrived with a shattered rear panel', 'The damaged back glass was replaced and the finish was inspected'],
    ['Missing Glass', 'Sections of rear glass were missing from this {device}', 'A {service} was completed to restore the rear panel'],
    ['Sharp Edges', 'Damaged back glass had left sharp exposed edges on this {device}', 'The rear glass was replaced and the repaired surface was checked'],
    ['Rear Cosmetic Damage', 'This {device} had visible damage across its rear glass', 'A {service} was completed to address the damaged panel'],
  ]),
  'front-camera-replacement': fiveServicePresets('front camera replacement', [
    ['No Image', 'The front camera on this {device} was not producing an image', 'A {service} was completed and camera output was checked'],
    ['Blurry Image', 'Front-camera images from this {device} remained blurry after cleaning checks', 'The camera was replaced and focus was tested'],
    ['Camera Error', 'This {device} displayed an error when opening the front camera', 'A {service} was completed to address the diagnosed camera fault'],
    ['Focus Failure', 'The front camera on this {device} could not focus correctly', 'The faulty camera module was replaced and tested'],
    ['Image Artefacts', 'Front-camera images from this {device} showed persistent visual artefacts', 'A {service} was completed and image output was checked'],
  ]),
  'back-camera-replacement': fiveServicePresets('back camera replacement', [
    ['No Image', 'The rear camera on this {device} was not producing an image', 'A {service} was completed and camera output was checked'],
    ['Blurry Image', 'Rear-camera images from this {device} remained blurry after cleaning checks', 'The camera was replaced and focus was tested'],
    ['Camera Error', 'This {device} displayed an error when opening the rear camera', 'A {service} was completed to address the diagnosed camera fault'],
    ['Focus Failure', 'The rear camera on this {device} could not focus correctly', 'The faulty camera module was replaced and tested'],
    ['Camera Shaking', 'The rear camera image on this {device} was shaking during use', 'A {service} was completed after the module fault was confirmed'],
  ]),
  'camera-lens-replacement': fiveServicePresets('camera lens replacement', [
    ['Cracked Lens', 'The external camera lens on this {device} was cracked', 'A {service} was completed and the camera opening was inspected'],
    ['Shattered Cover', 'This {device} had a shattered camera lens cover', 'The damaged lens cover was replaced and checked for fit'],
    ['Missing Lens', 'The external camera lens cover was missing from this {device}', 'A replacement lens was fitted to protect the camera opening'],
    ['Scratched Lens', 'Deep scratches on the camera lens cover of this {device} affected image clarity', 'A {service} was completed to address the damaged cover'],
    ['Lens Damage', 'Visible physical damage was present on the camera lens cover of this {device}', 'The damaged cover was replaced and inspected'],
  ]),
  'loudspeaker-replacement': fiveServicePresets('loudspeaker replacement', [
    ['No Sound', 'The loudspeaker on this {device} was not producing sound', 'A {service} was completed and audio output was checked'],
    ['Low Volume', 'Loudspeaker volume on this {device} remained unusually low after cleaning checks', 'The speaker was replaced and tested'],
    ['Distorted Sound', 'Audio from the loudspeaker on this {device} was distorted', 'A {service} was completed to address the diagnosed speaker fault'],
    ['Crackling', 'The loudspeaker on this {device} produced persistent crackling', 'The faulty speaker was replaced and audio was checked'],
    ['Intermittent Sound', 'Loudspeaker audio on this {device} was cutting in and out', 'A {service} was completed after the speaker fault was confirmed'],
  ]),
  'earpiece-speaker-replacement': fiveServicePresets('earpiece speaker replacement', [
    ['No Call Audio', 'This {device} had no sound through the earpiece during calls', 'An {service} was completed and call audio was checked'],
    ['Low Call Volume', 'Call volume through the earpiece of this {device} remained unusually low after cleaning checks', 'The earpiece speaker was replaced and tested'],
    ['Distorted Calls', 'Voice audio through the earpiece of this {device} was distorted', 'An {service} was completed to address the diagnosed fault'],
    ['Crackling Audio', 'The earpiece on this {device} produced crackling during calls', 'The faulty earpiece speaker was replaced and checked'],
    ['Intermittent Audio', 'Earpiece audio on this {device} was cutting in and out', 'An {service} was completed after the speaker fault was confirmed'],
  ]),
  'power-button-replacement': fiveServicePresets('power button replacement', [
    ['Not Responding', 'The power button on this {device} was not responding', 'A {service} was completed and button operation was checked'],
    ['Stuck Button', 'The power button on this {device} was physically stuck', 'The faulty button assembly was replaced and tested'],
    ['Intermittent Button', 'The power button on this {device} worked only intermittently', 'A {service} was completed to address the diagnosed fault'],
    ['Damaged Button', 'Physical damage was present around the power button of this {device}', 'The damaged button assembly was replaced and checked'],
    ['No Click', 'The power button on this {device} had lost its normal tactile response', 'A {service} was completed and button feedback was tested'],
  ]),
  'volume-button-replacement': fiveServicePresets('volume button replacement', [
    ['Not Responding', 'The volume buttons on this {device} were not responding', 'A {service} was completed and button operation was checked'],
    ['Stuck Button', 'A volume button on this {device} was physically stuck', 'The faulty button assembly was replaced and tested'],
    ['Intermittent Button', 'The volume controls on this {device} worked only intermittently', 'A {service} was completed to address the diagnosed fault'],
    ['Damaged Button', 'Physical damage was present around the volume buttons of this {device}', 'The damaged button assembly was replaced and checked'],
    ['No Click', 'A volume button on this {device} had lost its normal tactile response', 'A {service} was completed and button feedback was tested'],
  ]),
  'water-damage-repair': fiveServicePresets('water damage assessment', [
    ['Liquid Exposure', 'This {device} was presented after reported liquid exposure', 'A {service} was completed to inspect the extent of contamination and damage'],
    ['No Power', 'This {device} would not power on after reported liquid exposure', 'A {service} was completed without assuming that recovery was possible'],
    ['Intermittent Faults', 'This {device} developed intermittent faults after reported liquid exposure', 'Inspection and cleaning were completed to assess the affected areas'],
    ['Visible Corrosion', 'Visible corrosion was identified inside this {device}', 'A {service} was completed to document and address accessible contamination'],
    ['Assessment Only', 'This {device} required inspection for possible liquid-related damage', 'The assessment recorded the condition and any recommended next steps'],
  ]),
  'logic-board-repair': fiveServicePresets('logic board assessment', [
    ['No Power', 'This {device} had a no-power fault requiring board-level assessment', 'A {service} was completed before any repair recommendation was made'],
    ['Intermittent Fault', 'This {device} had an intermittent fault that required board-level diagnosis', 'The logic board was assessed to identify the affected circuit area'],
    ['Boot Failure', 'This {device} could not complete its normal startup process', 'A {service} was completed to investigate a possible board-level cause'],
    ['Board Damage', 'Inspection identified physical or corrosion damage on the logic board of this {device}', 'Board-level work was completed only on the diagnosed area'],
    ['Assessment Only', 'This {device} required specialist logic board diagnosis', 'The assessment documented findings and the available repair options'],
  ]),
};

OTHER_PRESETS['back-housing-replacement'] = OTHER_PRESETS['back-glass-replacement'];
OTHER_PRESETS['earpiece-replacement'] = OTHER_PRESETS['earpiece-speaker-replacement'];
OTHER_PRESETS['motherboard-repair'] = OTHER_PRESETS['logic-board-repair'];

const NEUTRAL_VARIATIONS = [
  (device: string, repair: string) => `This ${device} was booked for a ${repair}. The repair result records the device and service selected by the technician.`,
  (device: string, repair: string) => `A ${repair} was recorded for this ${device}. The saved result uses the selected device and repair category without adding an unverified fault.` ,
  (device: string, repair: string) => `This repair result relates to a ${repair} for the ${device}. Any specific symptoms or findings can be added by the technician when verified.`,
  (device: string, repair: string) => `The selected service for this ${device} is ${repair}. This neutral description can be replaced with verified repair details.`,
  (device: string, repair: string) => `This ${device} repair result is categorised as ${repair}. No cause, symptom or repair outcome is assumed by this automatic description.`,
];

function stableIndex(value: string, length: number) {
  let hash = 0;
  for (const character of value) hash = ((hash << 5) - hash + character.charCodeAt(0)) | 0;
  return Math.abs(hash) % length;
}

function neutralPresetDefinitions(repairType: string): PresetDefinition[] {
  return NEUTRAL_VARIATIONS.map((describe, index) => definition(
    `neutral-${index + 1}`,
    `Neutral ${index + 1}`,
    (device) => describe(device, repairType),
  ));
}

export function getRepairResultDescriptionPresets(input: RepairResultDescriptionInput): RepairResultDescriptionPreset[] {
  const definitions = input.repairTypeSlug === 'screen-replacement'
    ? SCREEN_PRESETS
    : input.repairTypeSlug === 'battery-replacement'
      ? BATTERY_PRESETS
      : input.repairTypeSlug === 'charging-port-replacement'
        ? CHARGING_PRESETS
        : OTHER_PRESETS[input.repairTypeSlug] || neutralPresetDefinitions(input.repairType);

  return definitions.map((preset) => ({
    id: preset.id,
    label: preset.label,
    description: preset.describe(input.deviceName, input.repairType),
  }));
}

export function getNeutralRepairResultDescription(input: RepairResultDescriptionInput, offset = 0) {
  const baseIndex = stableIndex(`${input.deviceName}|${input.repairTypeSlug}`, NEUTRAL_VARIATIONS.length);
  const index = (baseIndex + offset) % NEUTRAL_VARIATIONS.length;
  return NEUTRAL_VARIATIONS[index](input.deviceName, input.repairType);
}

export function findMatchingRepairResultPreset(input: RepairResultDescriptionInput, description: string) {
  return getRepairResultDescriptionPresets(input).find((preset) => preset.description === description) || null;
}

export function isNeutralRepairResultDescription(input: RepairResultDescriptionInput, description: string) {
  return NEUTRAL_VARIATIONS.some((variation) => variation(input.deviceName, input.repairType) === description);
}

export interface RepairResultDescriptionAuditRecord {
  id: string;
  model: string;
  repair_type: string;
  repair_type_slug: string;
  short_description: string | null;
}

export function auditRepairResultDescriptions(records: RepairResultDescriptionAuditRecord[]) {
  const proposals = records.flatMap((record) => {
    const legacy = `Before and after result from a ${record.model} ${record.repair_type} completed by Ali Mobile Repairs in Ringwood.`;
    if (record.short_description?.trim() !== legacy) return [];

    return [{
      id: record.id,
      model: record.model,
      repairType: record.repair_type,
      repairTypeSlug: record.repair_type_slug,
      before: record.short_description,
      replacement: getNeutralRepairResultDescription({
        deviceName: record.model,
        repairType: record.repair_type,
        repairTypeSlug: record.repair_type_slug,
      }),
    }];
  });

  return {
    total: records.length,
    likelyLegacy: proposals.length,
    userAuthoredOrUnknown: records.length - proposals.length,
    proposals,
  };
}

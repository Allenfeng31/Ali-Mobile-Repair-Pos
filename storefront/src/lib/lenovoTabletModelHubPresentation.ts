import { getLenovoTabletModelConfig } from './seo/content/lenovo-tablet/config';

type LenovoTabletModelHubRepair = {
  slug: string;
  repairOrigin?: string;
};

const HERO_REPAIR_LABELS: ReadonlyArray<readonly [string, string]> = [
  ['screen-replacement', 'screens'],
  ['battery-replacement', 'batteries'],
  ['charging-port-replacement', 'charging ports'],
  ['front-camera-replacement', 'front cameras'],
  ['back-camera-replacement', 'back cameras'],
];

const METADATA_REPAIR_LABELS: ReadonlyArray<readonly [string, string]> = [
  ['screen-replacement', 'screen'],
  ['battery-replacement', 'battery'],
  ['charging-port-replacement', 'charging port'],
  ['front-camera-replacement', 'camera'],
  ['back-camera-replacement', 'camera'],
];

function formatList(items: readonly string[]) {
  if (items.length < 2) return items[0] ?? '';
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items.at(-1)}`;
}

function formatMetadataList(items: readonly string[]) {
  if (items.length < 2) return items[0] ?? '';
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
}

function getCommercialModelName(modelSlug: string, fallbackModelName: string) {
  const config = getLenovoTabletModelConfig(modelSlug);
  return config
    ? config.modelName.replace(/\s+\([^)]*\)$/, '')
    : fallbackModelName;
}

export function getLenovoTabletModelHubPresentation({
  modelSlug,
  fallbackModelName,
  repairTypes,
}: {
  modelSlug: string;
  fallbackModelName: string;
  repairTypes: readonly LenovoTabletModelHubRepair[];
}) {
  const config = getLenovoTabletModelConfig(modelSlug);
  const commercialModelName = getCommercialModelName(modelSlug, fallbackModelName);
  const repairSlugs = new Set(repairTypes.map((repair) => repair.slug));
  const services = HERO_REPAIR_LABELS
    .filter(([slug]) => repairSlugs.has(slug))
    .map(([, label]) => label);
  const serviceList = formatList(services);

  return {
    commercialModelName,
    modelNumbersLabel: config?.modelCodes.length ? `Model Numbers: ${config.modelCodes.join(' / ')}` : null,
    heroDescription: serviceList
      ? `We repair ${commercialModelName} ${serviceList}. Explore the available repair options for your model, check pricing and find out what each repair involves.`
      : `Explore the available repair options for your ${commercialModelName}, check pricing and find out what each repair involves.`,
  };
}

export function getLenovoTabletModelHubMetadata({
  modelSlug,
  fallbackModelName,
  repairTypes,
}: {
  modelSlug: string;
  fallbackModelName: string;
  repairTypes: readonly LenovoTabletModelHubRepair[];
}) {
  const commercialModelName = getCommercialModelName(modelSlug, fallbackModelName);
  const posRepairSlugs = new Set(
    repairTypes
      .filter((repair) => repair.repairOrigin === 'pos')
      .map((repair) => repair.slug),
  );
  const services = [...new Set(
    METADATA_REPAIR_LABELS
      .filter(([slug]) => posRepairSlugs.has(slug))
      .map(([, label]) => label),
  )];
  const serviceList = formatMetadataList(services);

  return {
    title: `${commercialModelName} Repair & Pricing | Ali Mobile`,
    description: serviceList
      ? `Explore ${commercialModelName} ${serviceList} repair options. Check available pricing and find the right repair for your tablet.`
      : `Explore available repair options for your ${commercialModelName}. Check available pricing and find the right repair for your tablet.`,
  };
}

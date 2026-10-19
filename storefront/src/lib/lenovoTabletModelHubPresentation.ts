import { getLenovoTabletModelConfig } from './seo/content/lenovo-tablet/config';

type LenovoTabletModelHubRepair = {
  slug: string;
};

const HERO_REPAIR_LABELS: ReadonlyArray<readonly [string, string]> = [
  ['screen-replacement', 'screens'],
  ['battery-replacement', 'batteries'],
  ['charging-port-replacement', 'charging ports'],
  ['front-camera-replacement', 'front cameras'],
  ['back-camera-replacement', 'back cameras'],
];

function formatList(items: readonly string[]) {
  if (items.length < 2) return items[0] ?? '';
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items.at(-1)}`;
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
  const commercialModelName = config
    ? config.modelName.replace(/\s+\([^)]*\)$/, '')
    : fallbackModelName;
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

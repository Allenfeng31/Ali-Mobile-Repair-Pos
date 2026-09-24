import 'server-only';

import {
  checksumPublicRepairCatalogue,
  countPublicRepairCatalogue,
  serializePublicRepairCatalogue,
  validatePublicRepairCatalogue,
  type BrandEntry,
  type RepairCatalog,
  type RepairOption,
} from './publicRepairCataloguePolicy';
import type { RawItem } from './inventoryUtils';

const LOCAL_REPAIR_CATALOGUE_TIMESTAMP = '2026-01-01T00:00:00.000Z';

function quoteRepair(slug: string, name: string): RepairOption {
  return { slug, name, price: 0, repairOrigin: 'synthetic-backfill' };
}

const LOCAL_REPAIR_CATALOGUE_BRANDS: BrandEntry[] = [
  {
    category: 'phone', brand: 'Huawei', slug: 'huawei', icon: '📱', models: [{
      model: 'P30', slug: 'p30', repairTypes: [
        quoteRepair('loudspeaker-replacement', 'Loudspeaker Replacement'),
        quoteRepair('volume-button-replacement', 'Volume Button Replacement'),
      ],
    }],
  },
  {
    category: 'phone', brand: 'Asus', slug: 'asus', icon: '📱', models: [{
      model: 'ROG Phone 5', slug: 'rog-phone-5', repairTypes: [
        quoteRepair('loudspeaker-replacement', 'Loudspeaker Replacement'),
      ],
    }],
  },
  {
    category: 'phone', brand: 'Samsung', slug: 'samsung', icon: '📱', models: [{
      model: 'Galaxy S21', slug: 'galaxy-s21', repairTypes: [quoteRepair('loudspeaker-replacement', 'Loudspeaker Replacement')],
    }],
  },
  {
    category: 'phone', brand: 'Google Pixel', slug: 'google-pixel', icon: '📱', models: [{
      model: 'Pixel 8 Pro', slug: 'pixel-8-pro', repairTypes: [quoteRepair('loudspeaker-replacement', 'Loudspeaker Replacement')],
    }],
  },
  {
    category: 'phone', brand: 'Oppo', slug: 'oppo', icon: '📱', models: [{
      model: 'Find X5 Pro', slug: 'find-x5-pro', repairTypes: [quoteRepair('loudspeaker-replacement', 'Loudspeaker Replacement')],
    }],
  },
  {
    category: 'tablet', brand: 'iPad', slug: 'ipad', icon: '📟', models: [{
      model: 'iPad Pro 12.9-inch (M2)', slug: 'ipad-pro-12-9-inch-m2', repairTypes: [quoteRepair('screen-replacement', 'Screen Replacement')],
    }],
  },
  {
    category: 'laptop', brand: 'MacBook', slug: 'macbook', icon: '💻', models: [{
      model: 'MacBook Air (M3)', slug: 'macbook-air-m3', repairTypes: [quoteRepair('screen-replacement', 'Screen Replacement')],
    }],
  },
  {
    category: 'watch', brand: 'Apple Watch', slug: 'apple-watch', icon: '⌚', models: [{
      model: 'Apple Watch Series 9', slug: 'apple-watch-series-9', repairTypes: [quoteRepair('screen-replacement', 'Screen Replacement')],
    }],
  },
];

function createLocalRepairCatalogueFixture(): RepairCatalog {
  const payload = serializePublicRepairCatalogue(LOCAL_REPAIR_CATALOGUE_BRANDS);
  const validationError = validatePublicRepairCatalogue(payload);
  if (validationError) throw new Error(`Local repair catalogue fixture rejected: ${validationError}.`);

  const counts = countPublicRepairCatalogue(payload.brands);
  return {
    ...payload,
    source: 'fallback',
    catalogueSource: 'development-fallback',
    fetchedAt: LOCAL_REPAIR_CATALOGUE_TIMESTAMP,
    validatedAt: LOCAL_REPAIR_CATALOGUE_TIMESTAMP,
    checksum: checksumPublicRepairCatalogue(payload),
    inventoryRowCount: 0,
    ...counts,
  };
}

const LOCAL_REPAIR_CATALOGUE_FIXTURE = createLocalRepairCatalogueFixture();

export function isLocalRepairCatalogueOnly() {
  if (process.env.ALI_MOBILE_LOCAL_CATALOG_ONLY !== 'true') return false;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('ALI_MOBILE_LOCAL_CATALOG_ONLY cannot be enabled in production.');
  }
  return true;
}

export function getLocalRepairCatalogueFixture(): RepairCatalog {
  return structuredClone(LOCAL_REPAIR_CATALOGUE_FIXTURE);
}

const LOCAL_INVENTORY_PREFIX_BY_CATEGORY: Record<string, string> = {
  phone: 'P',
  tablet: 'T',
  laptop: 'C',
  watch: 'W',
};

/** Deterministic local catalogue identities for the legacy Book Repair inventory response. */
export function getLocalRepairInventoryFixture(): RawItem[] {
  let id = 1;
  return LOCAL_REPAIR_CATALOGUE_FIXTURE.brands.flatMap((brand) =>
    brand.models.flatMap((model) =>
      model.repairTypes.map((repair) => ({
        id: id++,
        name: `${model.model} ${repair.name}`,
        model: `${LOCAL_INVENTORY_PREFIX_BY_CATEGORY[brand.category] ?? 'P'} ${brand.brand}||${model.model}`,
        price: 0,
        category: 'Repair',
        quality_grade: 'Quote Only',
        is_active: true,
      })),
    ),
  );
}

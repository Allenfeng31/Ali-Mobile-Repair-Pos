import type { RepairTypeHubCategoryGroup } from '@/lib/repair-type-hubs';
import styles from './RepairTypeHub.module.css';

interface RepairTypeHubCrawlerLinkIndexProps {
  categories: RepairTypeHubCategoryGroup[];
}

/**
 * Server-only, optional browse path. Destinations are resolved before this
 * component receives them, so it cannot broaden public repair-page authority.
 */
export default function RepairTypeHubCrawlerLinkIndex({
  categories,
}: RepairTypeHubCrawlerLinkIndexProps) {
  const availableCategories = categories
    .map((category) => ({
      ...category,
      brands: category.brands.filter((brand) => brand.models.length > 0),
    }))
    .filter((category) => category.brands.length > 0);

  if (availableCategories.length === 0) return null;

  return (
    <details className={styles.crawlerIndex}>
      <summary>Browse all supported repair pages</summary>
      {availableCategories.map((category) => (
        <section key={category.category}>
          <h3>{category.categoryLabel}</h3>
          {category.brands.map((brand) => (
            <div key={brand.brandSlug}>
              <h4>{brand.brand}</h4>
              <ul>
                {brand.models.map((model) => (
                  <li key={`${model.brandSlug}-${model.modelSlug}-${model.repairSlug}`}>
                    <a href={model.href}>{model.model}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </details>
  );
}

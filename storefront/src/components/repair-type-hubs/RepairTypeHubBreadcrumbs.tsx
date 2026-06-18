import Link from 'next/link';
import styles from './RepairTypeHub.module.css';

interface RepairTypeHubBreadcrumbsProps {
  label: string;
}

export default function RepairTypeHubBreadcrumbs({ label }: RepairTypeHubBreadcrumbsProps) {
  return (
    <nav aria-label="breadcrumb" className={styles.breadcrumbs}>
      <ol className={styles.breadcrumbList}>
        <li>
          <Link href="/" className={styles.breadcrumbLink}>
            Home
          </Link>
        </li>
        <li aria-hidden="true" className={styles.breadcrumbDivider}>
          ›
        </li>
        <li>
          <Link href="/repairs" className={styles.breadcrumbLink}>
            Repairs
          </Link>
        </li>
        <li aria-hidden="true" className={styles.breadcrumbDivider}>
          ›
        </li>
        <li aria-current="page" className={styles.breadcrumbCurrent}>
          {label}
        </li>
      </ol>
    </nav>
  );
}

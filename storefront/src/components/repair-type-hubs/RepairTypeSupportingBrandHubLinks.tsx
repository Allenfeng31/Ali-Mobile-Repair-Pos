"use client";

import Link from 'next/link';
import { useId, useState } from 'react';
import styles from './RepairTypeHub.module.css';

type SupportingBrandHubLink = {
  href: string;
  label: string;
  desktopPriority?: boolean;
  mobilePriority?: boolean;
};

const SUPPORTING_BRAND_HUB_LINKS: SupportingBrandHubLink[] = [
  { href: '/repairs/phone/iphone', label: 'iPhone Repairs', desktopPriority: true, mobilePriority: true },
  { href: '/repairs/phone/samsung', label: 'Samsung Repairs', desktopPriority: true, mobilePriority: true },
  { href: '/repairs/phone/google-pixel', label: 'Google Pixel Repairs', desktopPriority: true, mobilePriority: true },
  { href: '/repairs/phone/oppo', label: 'OPPO Repairs', desktopPriority: true, mobilePriority: true },
  { href: '/repairs/tablet/ipad', label: 'iPad Repairs', desktopPriority: true, mobilePriority: true },
  { href: '/repairs/tablet/samsung', label: 'Samsung Tablet Repairs', desktopPriority: true },
  { href: '/repairs/laptop/macbook', label: 'MacBook Repairs', desktopPriority: true, mobilePriority: true },
  { href: '/repairs/watch/apple', label: 'Apple Watch Repairs', desktopPriority: true },
  { href: '/repairs/phone/huawei', label: 'Huawei Repairs' },
  { href: '/repairs/phone/xiaomi', label: 'Xiaomi Repairs' },
  { href: '/repairs/phone/htc', label: 'HTC Repairs' },
  { href: '/repairs/phone/lg', label: 'LG Repairs' },
  { href: '/repairs/phone/nokia', label: 'Nokia Repairs' },
  { href: '/repairs/phone/sony', label: 'Sony Repairs' },
  { href: '/repairs/phone/telstra', label: 'Telstra Repairs' },
  { href: '/repairs/phone/vivo', label: 'Vivo Repairs' },
  { href: '/repairs/phone/motorola', label: 'Motorola Repairs' },
  { href: '/repairs/phone/microsoft', label: 'Microsoft Repairs' },
  { href: '/repairs/phone/oneplus', label: 'OnePlus Repairs' },
  { href: '/repairs/phone/realme', label: 'Realme Repairs' },
  { href: '/repairs/phone/asus', label: 'Asus Repairs' },
  { href: '/repairs/phone/tcl', label: 'TCL Repairs' },
  { href: '/repairs/phone/nothing', label: 'Nothing Repairs' },
  { href: '/repairs/tablet/lenovo', label: 'Lenovo Tablet Repairs' },
];

export default function RepairTypeSupportingBrandHubLinks() {
  const [isExpanded, setIsExpanded] = useState(false);
  const linksId = useId();

  return (
    <section className={`repair-content-band ${styles.sectionCard}`}>
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.sectionEyebrow}>Explore More</p>
          <h2 className={styles.sectionTitle}>Browse device repair hubs</h2>
        </div>
        <p className={styles.sectionBody}>
          If you want to compare repair options before selecting a repair page, you can also browse supported device hubs across phones, tablets, laptops and smart watches.
        </p>
      </div>
      <div
        id={linksId}
        className={`${styles.supportingLinks} ${isExpanded ? styles.supportingLinksExpanded : ''}`}
      >
        {SUPPORTING_BRAND_HUB_LINKS.map((link) => {
          const isDesktopHidden = !link.desktopPriority;
          const isMobileHidden = !link.mobilePriority;
          const className = [
            styles.supportingLink,
            isDesktopHidden ? styles.supportingLinkDesktopMore : '',
            isMobileHidden ? styles.supportingLinkMobileMore : '',
            link.href === '/repairs/laptop/macbook' ? styles.supportingLinkMobilePriority : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <Link
              key={link.href}
              href={link.href}
              className={className}
              tabIndex={isDesktopHidden && !isExpanded ? -1 : undefined}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
      <button
        type="button"
        className={styles.supportingLinksToggle}
        aria-expanded={isExpanded}
        aria-controls={linksId}
        onClick={() => setIsExpanded((current) => !current)}
      >
        {isExpanded ? 'Show fewer devices' : 'More devices'}
      </button>
    </section>
  );
}

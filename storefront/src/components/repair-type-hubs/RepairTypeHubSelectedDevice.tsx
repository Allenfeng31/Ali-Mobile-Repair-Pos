import Link from 'next/link';
import { ArrowRight, CheckCircle2, PhoneCall } from 'lucide-react';
import styles from './RepairTypeHub.module.css';

export interface RepairTypeHubSelectedDeviceViewModel {
  brand: string;
  model: string;
  repairName: string;
  priceLabel: string;
  bookingHref: string;
}

export default function RepairTypeHubSelectedDevice({
  selected,
  changeModelHref,
}: {
  selected: RepairTypeHubSelectedDeviceViewModel;
  changeModelHref: string;
}) {
  return (
    <section id="repair-type-model-finder" data-repair-type-hub-selected-device className={styles.selectedDevice} aria-labelledby="repair-type-selected-device-heading">
      <span className={styles.selectedDeviceEyebrow}>Selected device</span>
      <h2 id="repair-type-selected-device-heading" className={styles.selectedDeviceTitle}>
        {selected.brand} {selected.model}
      </h2>
      <p className={styles.selectedDeviceRepair}>{selected.repairName}</p>
      <p className={styles.selectedDevicePrice}>{selected.priceLabel}</p>
      <div className={styles.selectedDeviceActions}>
        <Link href={selected.bookingHref} className="repair-primary-action">
          Book Repair Now <ArrowRight size={18} strokeWidth={2.6} aria-hidden="true" />
        </Link>
        <a href="tel:0481058514" className="repair-secondary-action">
          <PhoneCall size={18} strokeWidth={2.6} aria-hidden="true" />Call 0481 058 514
        </a>
        <Link href={changeModelHref} className={styles.changeModelLink}>
          <CheckCircle2 size={18} strokeWidth={2.4} aria-hidden="true" />Change model
        </Link>
      </div>
    </section>
  );
}

import Link from "next/link";
import { Languages } from "lucide-react";

import styles from "./ChineseServiceCta.module.css";

type ChineseServiceCtaProps = {
  suburbName: string;
};

export default function ChineseServiceCta({ suburbName }: ChineseServiceCtaProps) {
  return (
    <aside className={styles.card} aria-label={`Chinese-language repair assistance for ${suburbName} customers`}>
      <div className={styles.iconWrap} aria-hidden="true">
        <Languages size={21} strokeWidth={2.5} />
      </div>
      <div className={styles.copy}>
        <h2>Prefer Chinese-language assistance?</h2>
        <p>
          Mandarin and Cantonese communication is available at our Ringwood Square kiosk for repair options,
          parts, pricing and expected timing.
        </p>
      </div>
      <Link href="/zh/phone-repair-melbourne-east" className={styles.link}>
        查看中文维修服务
      </Link>
    </aside>
  );
}

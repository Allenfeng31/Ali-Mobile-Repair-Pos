import Link from "next/link";
import { Languages } from "lucide-react";

import styles from "./ChineseServiceCta.module.css";

type ChineseServiceCtaProps = {
  suburbName: string;
};

export default function ChineseServiceCta({ suburbName }: ChineseServiceCtaProps) {
  return (
    <aside className={styles.card} lang="zh-Hans" aria-label={`Chinese-language repair assistance for ${suburbName} customers`}>
      <div className={styles.iconWrap} aria-hidden="true">
        <Languages size={21} strokeWidth={2.5} />
      </div>
      <div className={styles.copy}>
        <h2>需要普通话或粤语服务？</h2>
        <p>
          Ali Mobile &amp; Repair 位于 Ringwood Square 的 Kiosk C1，可使用普通话或粤语沟通设备故障、维修方案、零件选择、价格和预计时间。
        </p>
      </div>
      <Link href="/zh/phone-repair-melbourne-east" className={styles.link}>
        查看中文维修服务
      </Link>
    </aside>
  );
}

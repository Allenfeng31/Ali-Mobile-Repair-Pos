import Image from "next/image";
import Link from "next/link";
import styles from "./HomeRepairGuides.module.css";

const guides = [
  {
    title: "Why Is My Phone Not Charging?",
    summary:
      "Explore common charging faults, safe first steps and when professional repair may be needed.",
    href: "/blog/why-is-my-phone-not-charging",
    image: "/images/blog/why-is-my-phone-not-charging.webp",
    imageAlt:
      "Phone on a repair bench while a technician inspects a dusty charging port",
  },
  {
    title: "How Much Does iPhone Screen Repair Cost?",
    summary:
      "Compare screen replacement prices and understand LCD, Soft OLED and Original Screen options.",
    href: "/blog/how-much-does-iphone-screen-repair-cost-australia",
    image: "/images/blog/iphone-screen-repair-cost/iphone-screen-comparison.jpg",
    imageAlt:
      "Side-by-side comparison of LCD in-cell, Soft OLED and Original iPhone screens",
  },
  {
    title: "MacBook Screen Repair: Prices & Process",
    summary:
      "See MacBook Air screen prices, complete display assembly replacement details and real repair results.",
    href: "/blog/macbook-screen-repair-ringwood",
    image: "/images/blog/macbook-screen-repair/cover.webp",
    imageAlt:
      "MacBook Air showing a working display after complete screen assembly replacement",
  },
  {
    title: "When Should You Replace Your iPhone Battery?",
    summary:
      "Learn what iPhone Battery Health really means, when battery replacement makes sense and how common battery problems are assessed.",
    href: "/blog/when-should-you-replace-iphone-battery",
    image: "/images/blog/iphone-battery-replacement-repair-assistant.webp",
    imageAlt:
      "iPhone showing Battery Health beside a replacement battery on a repair workbench",
  },
  {
    title: "How Much Does Samsung Screen Replacement Cost?",
    summary:
      "Compare Samsung Galaxy S screen replacement prices and understand Service Pack and aftermarket display options.",
    href: "/blog/how-much-does-samsung-galaxy-s-screen-replacement-cost-australia",
    image:
      "/images/blog/samsung-screen-repair-cost/samsung-galaxy-s-screen-replacement-cost-guide.webp",
    imageAlt:
      "Samsung Galaxy S phones on a repair bench showing a damaged display, working display and screen assembly",
  },
] as const;

export default function HomeRepairGuides() {
  return (
    <section className={styles.section} aria-labelledby="repair-guides-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 id="repair-guides-heading" className={styles.title}>
            Repair Tips &amp; Guides
          </h2>
          <p className={styles.subtitle}>
            Helpful advice from our Ringwood repair team on charging problems,
            screen repair costs and repair options.
          </p>
        </header>

        <div className={styles.list}>
          {guides.map((guide) => (
            <article key={guide.href} className={styles.item}>
              <Link
                href={guide.href}
                prefetch={false}
                className={styles.itemLink}
                aria-label={`Read guide: ${guide.title}`}
              >
                <span className={styles.imageFrame}>
                  <Image
                    src={guide.image}
                    alt={guide.imageAlt}
                    width={320}
                    height={180}
                    sizes="(max-width: 360px) 88px, (max-width: 600px) 104px, 176px"
                    loading="lazy"
                    className={styles.image}
                  />
                </span>
                <span className={styles.copy}>
                  <h3 className={styles.itemTitle}>{guide.title}</h3>
                  <span className={styles.summary}>{guide.summary}</span>
                  <span className={styles.readLink}>Read guide</span>
                </span>
              </Link>
            </article>
          ))}
        </div>

        <div className={styles.ctaRow}>
          <Link href="/blog" prefetch={false} className={styles.cta}>
            View All Repair Guides
          </Link>
        </div>
      </div>
    </section>
  );
}

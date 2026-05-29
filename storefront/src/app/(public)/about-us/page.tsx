import Image from "next/image";
import Link from "next/link";

import styles from "./AboutUs.module.css";

const proofPoints = [
  { value: "10+", label: "Years Experience" },
  { value: "C1", label: "Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134" },
  { value: "0$", label: "No Fix, No Charge" },
];

const principles = [
  {
    label: "Transparent Diagnosis",
    text: "Every repair starts with a clear inspection, a practical quote, and a straight answer before any work begins.",
  },
  {
    label: "Precision Repair",
    text: "Screens, batteries, charging ports, tablets, laptops, and board-level issues are handled with careful bench discipline.",
  },
  {
    label: "Local Accountability",
    text: "You deal with a Ringwood team that lives by repeat customers, word of mouth, and repairs that hold up after you leave.",
  },
];

export default function AboutUsPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <span className={styles.kicker}>Ringwood Repair Lab</span>
            <h1>
              Quietly technical.
              <span>Seriously local.</span>
            </h1>
            <p>
              Ali Mobile & Repair has spent more than a decade helping Ringwood customers get phones,
              tablets, and laptops back to work without drama, hidden costs, or inflated chain-store pricing.
            </p>
            <div className={styles.heroActions}>
              <Link href="/book-repair" className={styles.primaryAction}>
                Book a Repair
              </Link>
              <Link href="/repairs" className={styles.secondaryAction}>
                View Services
              </Link>
            </div>
          </div>

          <div className={styles.visualPanel} aria-label="Ali Mobile & Repair store front">
            <div className={styles.imageShell}>
              <Image
                src="/images/about-us-new.jpg"
                alt="Ali Mobile & Repair store front in Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134"
                width={680}
                height={460}
                priority
                className={styles.storeImage}
              />
            </div>
            <div className={styles.signalCard}>
              <span>Live Bench Status</span>
              <strong>Repairs in motion</strong>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.proofBand} aria-label="Business highlights">
        <div className={styles.proofGrid}>
          {proofPoints.map((item) => (
            <div className={styles.proofItem} key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.storySection}>
        <div className={styles.storyGrid}>
          <div className={styles.storyIntro}>
            <span className={styles.kicker}>Our Story</span>
            <h2>Built for the repair customers actually need.</h2>
          </div>
          <div className={styles.storyText}>
            <p>
              We are a specialist electronics repair shop based at Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134. Our work covers everyday device problems such as cracked screens and tired
              batteries, plus trickier issues like charging faults, water damage, and laptop repairs.
            </p>
            <p>
              The promise is simple: careful diagnosis, fair pricing, high-quality parts, and a result you
              can trust. Our No Fix, No Charge policy keeps the incentives clean, so customers only pay
              when the repair actually solves the problem.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.principles} aria-label="Repair principles">
        <div className={styles.principlesHeader}>
          <span className={styles.kicker}>How We Work</span>
          <h2>Less theatre, more precision.</h2>
        </div>
        <div className={styles.principleGrid}>
          {principles.map((principle, index) => (
            <article className={styles.principleCard} key={principle.label}>
              <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
              <h3>{principle.label}</h3>
              <p>{principle.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <span className={styles.kicker}>Free Quote</span>
          <h2>Bring the device in. We will tell you what is worth fixing.</h2>
          <p>
            Visit Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134 or book online for priority service. Most common screen and battery
            repairs can be handled the same day.
          </p>
          <Link href="/book-repair" className={styles.primaryAction}>
            Book Repair Now
          </Link>
        </div>
      </section>
    </main>
  );
}

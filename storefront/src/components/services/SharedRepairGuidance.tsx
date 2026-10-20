import Link from 'next/link';

import styles from './SharedRepairGuidance.module.css';

export type SharedRepairGuidanceCard = Readonly<{
  title: string;
  body: string;
  link?: Readonly<{ href: string; label: string }>;
}>;

type GuidanceStageKey = 'symptoms' | 'possible-causes' | 'our-checks' | 'next-steps';

const STAGES: ReadonlyArray<Readonly<{
  key: GuidanceStageKey;
  title: string;
  summary: string;
}>> = [
  {
    key: 'symptoms',
    title: 'Symptoms',
    summary: 'Match the symptom before assuming a part has failed.',
  },
  {
    key: 'possible-causes',
    title: 'Possible causes',
    summary: 'Settings, damage or another fault can cause similar signs.',
  },
  {
    key: 'our-checks',
    title: 'Our checks',
    summary: 'Safe checks and diagnosis help identify the suitable repair path.',
  },
  {
    key: 'next-steps',
    title: 'Next steps',
    summary: 'Choose your model, then confirm the repair option, timing and quote.',
  },
];

function classifyGuidanceCard(title: string): GuidanceStageKey {
  const normalized = title.toLowerCase();

  if (/price|timing|warranty|preparation/.test(normalized)) return 'next-steps';
  if (/no power|when it may|when it is not|impact, liquid|hardware problem|safe checks and (other causes|related faults)|checks before a speaker repair/.test(normalized)) return 'possible-causes';
  if (/quick checks|safe checks|checks before|damage and contamination|inspection|diagnosis|what we inspect|what we test|testing after|repair and image/.test(normalized)) return 'our-checks';

  return 'symptoms';
}

export function groupSharedRepairGuidanceCards(cards: readonly SharedRepairGuidanceCard[]) {
  return STAGES.map((stage) => ({
    ...stage,
    cards: cards.filter((card) => classifyGuidanceCard(card.title) === stage.key),
  })).filter((stage) => stage.cards.length > 0);
}

export default function SharedRepairGuidance({
  heading,
  intro,
  cards,
}: Readonly<{
  heading: string;
  intro: string;
  cards: readonly SharedRepairGuidanceCard[];
}>) {
  const stages = groupSharedRepairGuidanceCards(cards);

  return <section className={styles.section} aria-labelledby="repair-guidance-heading">
    <div className="repair-workbench-heading">
      <span>Repair guidance</span>
      <h2 id="repair-guidance-heading" className="scroll-mt-32">{heading}</h2>
      <p>{intro}</p>
    </div>
    <ol className={styles.flow} aria-label="Repair guidance steps" data-shared-repair-guidance>
      {stages.map((stage, index) => <li key={stage.key} className={styles.stage}>
        <details className={styles.disclosure} data-guidance-stage={stage.key}>
          <summary className={styles.summary}>
            <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <span className={styles.summaryCopy}>
              <strong>{stage.title}</strong>
              <span>{stage.summary}</span>
            </span>
            <span className={styles.chevron} aria-hidden="true" />
          </summary>
          <div className={styles.detailsContent}>
            {stage.cards.map((card) => <article key={card.title} className={styles.detailCard}>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
              {card.link ? <Link href={card.link.href} className={styles.link}>{card.link.label}</Link> : null}
            </article>)}
          </div>
        </details>
      </li>)}
    </ol>
  </section>;
}

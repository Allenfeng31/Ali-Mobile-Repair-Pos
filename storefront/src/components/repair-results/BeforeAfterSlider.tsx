"use client";

import Image from 'next/image';
import { useState } from 'react';
import styles from './BeforeAfterSlider.module.css';

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
  aspectRatio: string;
  priority?: boolean;
}

export default function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt,
  afterAlt,
  aspectRatio,
  priority = false,
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);

  return (
    <div className={styles.slider} style={{ aspectRatio }}>
      <div className={`${styles.imageLayer} ${styles.beforeLayer}`}>
        <Image
          src={beforeSrc}
          alt={beforeAlt}
          fill
          className={styles.image}
          sizes="(min-width: 1024px) 720px, 94vw"
          priority={priority}
        />
      </div>

      <div className={styles.afterLayer} style={{ clipPath: `inset(0 0 0 ${position}%)` }}>
        <Image
          src={afterSrc}
          alt={afterAlt}
          fill
          className={styles.image}
          sizes="(min-width: 1024px) 720px, 94vw"
          loading={priority ? 'eager' : 'lazy'}
        />
      </div>

      <span className={`${styles.label} ${styles.labelBefore}`}>Before</span>
      <span className={`${styles.label} ${styles.labelAfter}`}>After</span>

      <input
        className={styles.range}
        type="range"
        min="0"
        max="100"
        value={position}
        aria-label="Compare before and after repair result"
        onChange={(event) => setPosition(Number(event.target.value))}
      />
      <div className={styles.handle} style={{ left: `${position}%` }} aria-hidden="true">
        <span className={styles.handleKnob}>↔</span>
      </div>
    </div>
  );
}

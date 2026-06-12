"use client";

import Image from 'next/image';
import { useState, type CSSProperties } from 'react';
import {
  getRepairResultFrameConfig,
  type RepairResultDeviceCategory,
} from '@/lib/repair-results';
import styles from './BeforeAfterSlider.module.css';

interface BeforeAfterSliderProps {
  deviceCategory: RepairResultDeviceCategory;
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
  priority?: boolean;
}

export default function BeforeAfterSlider({
  deviceCategory,
  beforeSrc,
  afterSrc,
  beforeAlt,
  afterAlt,
  priority = false,
}: BeforeAfterSliderProps) {
  const frameConfig = getRepairResultFrameConfig(deviceCategory);
  const [position, setPosition] = useState(50);
  const sliderStyle = {
    aspectRatio: frameConfig.aspectRatio,
    '--slider-max-width': frameConfig.maxWidth,
    '--slider-max-height': frameConfig.maxHeight,
    '--slider-mobile-max-height': frameConfig.mobileMaxHeight,
  } as CSSProperties;

  return (
    <div
      className={styles.slider}
      data-device={deviceCategory}
      style={sliderStyle}
    >
      <div className={`${styles.imageLayer} ${styles.beforeLayer}`}>
        <Image
          src={beforeSrc}
          alt={beforeAlt}
          fill
          className={styles.image}
          sizes={frameConfig.sizes}
          priority={priority}
        />
      </div>

      <div className={styles.afterLayer} style={{ clipPath: `inset(0 0 0 ${position}%)` }}>
        <Image
          src={afterSrc}
          alt={afterAlt}
          fill
          className={styles.image}
          sizes={frameConfig.sizes}
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
        <span className={styles.handleKnob} />
      </div>
    </div>
  );
}

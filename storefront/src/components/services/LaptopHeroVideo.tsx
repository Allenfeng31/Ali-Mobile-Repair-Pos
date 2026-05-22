'use client';

import { useEffect, useState } from 'react';

const SAFARI_LAPTOP_VIDEO = '/videos/macbook-pro-m3-14-turn-v1.mov?v=safari-laptop-alpha-2';
const CHROME_LAPTOP_VIDEO = '/videos/macbook-pro-m3-14-turn-v1.webm?v=chrome-laptop-alpha-2';

function prefersSafariVideo() {
  const userAgent = navigator.userAgent.toLowerCase();

  return (
    userAgent.includes('safari') &&
    !userAgent.includes('chrome') &&
    !userAgent.includes('chromium') &&
    !userAgent.includes('crios') &&
    !userAgent.includes('edg') &&
    !userAgent.includes('opr') &&
    !userAgent.includes('firefox')
  );
}

export default function LaptopHeroVideo() {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    setSrc(prefersSafariVideo() ? SAFARI_LAPTOP_VIDEO : CHROME_LAPTOP_VIDEO);
  }, []);

  if (!src) {
    return null;
  }

  return (
    <video
      key={src}
      src={src}
      autoPlay
      muted
      playsInline
      preload="auto"
      className="repair-laptop-float-video"
      data-video-src={src}
      style={{
        animationFillMode: 'forwards',
        backgroundColor: 'transparent',
      }}
      aria-hidden="true"
    />
  );
}

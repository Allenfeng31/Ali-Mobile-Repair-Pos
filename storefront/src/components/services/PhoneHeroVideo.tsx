'use client';

import { useEffect, useState } from 'react';

const SAFARI_ALPHA_VIDEO = '/videos/iphone-17-pro-max-v3.mov?v=safari-alpha-2';
const CHROME_ALPHA_VIDEO = '/videos/iphone-17-pro-max-v3.webm?v=chrome-alpha-3';

function prefersSafariAlpha() {
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

export default function PhoneHeroVideo() {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    setSrc(prefersSafariAlpha() ? SAFARI_ALPHA_VIDEO : CHROME_ALPHA_VIDEO);
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
      className="repair-phone-float-video scale-[1.05] translate-x-[-10px]"
      data-video-src={src}
      style={{
        animationFillMode: 'forwards',
        backgroundColor: 'transparent',
      }}
      aria-hidden="true"
    />
  );
}

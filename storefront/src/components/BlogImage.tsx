"use client";

import React, { useState } from 'react';

interface BlogImageProps {
  src?: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function BlogImage({ src, alt, className, priority = false }: BlogImageProps) {
  const [error, setError] = useState(!src);

  if (error) {
    return (
      <div className={`blog-placeholder-img ${className || ''}`} style={{ 
        width: '100%', 
        height: '100%', 
        background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 50%, #e2e8f0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      onError={() => setError(true)}
    />
  );
}

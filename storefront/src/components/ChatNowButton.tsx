'use client';

import React from 'react';

interface ChatNowButtonProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function ChatNowButton({ className, style }: ChatNowButtonProps) {
  return (
    <button 
      onClick={() => document.getElementById('chat-widget-toggle')?.click()}
      className={className}
      style={style}
    >
      Chat Now
    </button>
  );
}

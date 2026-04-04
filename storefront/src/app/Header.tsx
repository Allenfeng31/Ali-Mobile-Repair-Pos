"use client";

import { useState, useEffect } from 'react';

export default function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show navbar if at the very top
      if (currentScrollY < 10) {
        setIsVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      // Scrolling Down
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } 
      // Scrolling Up
      else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <nav className={`navbar ${!isVisible ? 'navbar--hidden' : ''}`}>
      <div className="nav-container">
        <a href="/" className="nav-logo">
          <picture style={{ height: '100%', display: 'block' }}>
            <source srcSet="/images/logo-dark.png" media="(prefers-color-scheme: dark)" />
            <img src="/images/logo.png" alt="Ali Mobile Repairs" style={{ height: '100%', width: 'auto' }} />
          </picture>
        </a>
        <div className="nav-links">
          <a href="/">HOME</a>
          <a href="/services">SERVICES</a>
          <a href="/book-repair">BOOK REPAIR</a>
          <a href="/about-us">ABOUT US</a>
          <a href="/blog">BLOG</a>
          <a href="/track-status">TRACK STATUS</a>
        </div>
        <a href="tel:+61481058514" className="call-now-btn" title="Call Us Now">
          <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
          </svg>
        </a>
      </div>
    </nav>
  );
}

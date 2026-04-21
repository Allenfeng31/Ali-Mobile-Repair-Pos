"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const { devices } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="navbar">
      {/* Mobile Top Bar */}
      <div className="mobile-top-bar">
        <a href="tel:0481058514" className="mobile-top-call">
          <svg fill="currentColor" viewBox="0 0 24 24" style={{ width: '16px', height: '16px' }}>
            <path d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" />
          </svg>
          CALL NOW: 0481 058 514
        </a>
      </div>

      <div className="nav-container">
        <Link href="/" className="nav-logo">
          <Image 
            src="/images/logo.png" 
            alt="Ali Mobile & Repair Ringwood" 
            width={180} 
            height={60} 
            priority
            style={{ width: 'auto', height: '100%', objectFit: 'contain' }}
          />
        </Link>

        {/* Desktop nav links */}
        <nav className="nav-links nav-links--desktop">
          <Link href="/repairs" prefetch={true}>Service &amp; Repairs</Link>
          <Link href="/about-us" prefetch={true}>About Us</Link>
          <Link href="/blog" prefetch={true}>Blog</Link>
        </nav>

        {/* Right side: Book Repair + Hamburger */}
        <div className="nav-actions">
          {/* Theme Toggle - Desktop */}
          {mounted && (
            <div className="theme-toggle-container desktop-only-theme">
              <label className="theme-switch">
                <input 
                  type="checkbox" 
                  checked={theme === 'light'} 
                  onChange={toggleTheme} 
                  aria-label="Toggle theme" 
                />
                <span className="toggle-slider">
                  <div className="toggle-icons">
                    <svg className="icon-moon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    <svg className="icon-sun" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </span>
              </label>
            </div>
          )}

          <Link 
            href="/book-repair" 
            prefetch={true}
            className="primary-btn"
            style={{ padding: '0.6rem 1.4rem', whiteSpace: 'nowrap', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            Book Repair {devices.length > 0 && <span style={{ background: '#fff', color: 'var(--primary)', padding: '0.1rem 0.4rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800 }}>{devices.length}</span>}
          </Link>

          {/* Hamburger button – mobile only */}
          <button 
            className="hamburger-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span className={`hamburger-icon ${isMobileMenuOpen ? 'hamburger-icon--open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {isMobileMenuOpen && (
        <nav className="mobile-nav">
          <Link href="/repairs" onClick={() => setIsMobileMenuOpen(false)} prefetch={true}>Service &amp; Repairs</Link>
          <Link href="/about-us" onClick={() => setIsMobileMenuOpen(false)} prefetch={true}>About Us</Link>
          <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)} prefetch={true}>Blog</Link>
          <Link href="/book-repair" onClick={() => setIsMobileMenuOpen(false)} className="mobile-nav-cta" prefetch={true}>
            Book Repair Now {devices.length > 0 && `(${devices.length})`}
          </Link>
          
          {mounted && (
            <div 
              className="mobile-theme-toggle" 
              onClick={toggleTheme} 
              style={{ padding: '0.9rem 2rem', display: 'flex', alignItems: 'center', justifyItems: 'space-between', gap: '1rem', borderTop: '1px solid var(--layer-border)', cursor: 'pointer' }}
            >
              <span style={{ fontWeight: 600, fontSize: '1rem', flex: 1 }}>
                {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              </span>
              <label className="theme-switch" onClick={(e) => e.stopPropagation()}>
                <input type="checkbox" checked={theme === 'light'} onChange={toggleTheme} />
                <span className="toggle-slider">
                  <div className="toggle-icons">
                    <svg className="icon-moon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    <svg className="icon-sun" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </span>
              </label>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}

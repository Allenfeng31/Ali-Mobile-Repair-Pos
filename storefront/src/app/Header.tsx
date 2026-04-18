"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="navbar">
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
          <Link href="/repairs">Service &amp; Repairs</Link>
          <Link href="/about-us">About Us</Link>
          <Link href="/blog">Blog</Link>
        </nav>

        {/* Right side: Book Repair + Hamburger */}
        <div className="nav-actions">
          <Link 
            href="/book-repair" 
            className="primary-btn"
            style={{ padding: '0.6rem 1.4rem', whiteSpace: 'nowrap', fontSize: '0.85rem' }}
          >
            Book Repair
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
          <Link href="/repairs" onClick={() => setIsMobileMenuOpen(false)}>Service &amp; Repairs</Link>
          <Link href="/about-us" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
          <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)}>Blog</Link>
          <Link href="/book-repair" onClick={() => setIsMobileMenuOpen(false)} className="mobile-nav-cta">
            Book Repair Now
          </Link>
        </nav>
      )}
    </header>
  );
}

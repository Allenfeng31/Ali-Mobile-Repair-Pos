"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { analytics } from '@/lib/analytics';
import { Menu, X } from 'lucide-react';

type ThemeMode = 'light' | 'dark';

function getInitialTheme(): ThemeMode {
  return 'light'; // Forced light mode MVP
}

export default function Header() {
  const { devices } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  // Lock to light mode, ignore toggles
  const toggleTheme = () => {
    setTheme('light');
  };

  return (
    <header className="navbar">
      {/* Mobile Top Bar */}
      <div className="mobile-top-bar">
        <a 
          href="tel:0481058514" 
          className="mobile-top-call"
          onClick={() => analytics.trackCallNow()}
        >
          <svg fill="currentColor" viewBox="0 0 24 24" style={{ width: '16px', height: '16px' }}>
            <path d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" />
          </svg>
          CALL NOW: 0481 058 514
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 items-center w-full max-w-[1200px] mx-auto px-4 md:px-8 py-1 lg:py-[0.35rem]">
        <div className="flex justify-start">
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
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex justify-center">
          <nav className="nav-links nav-links--desktop">
            <Link href="/repairs" prefetch={true}>Service &amp; Repairs</Link>
            <Link href="/about-us" prefetch={true}>About Us</Link>
            <Link href="/blog" prefetch={true}>Blog</Link>
          </nav>
        </div>

        {/* Right side: Book Repair + Hamburger */}
        <div className="flex justify-end items-center gap-3">
          <Link 
            href="/book-repair" 
            prefetch={true}
            className="primary-btn hidden sm:flex"
            style={{ padding: '0.6rem 1.4rem', whiteSpace: 'nowrap', fontSize: '0.85rem', alignItems: 'center', gap: '0.5rem' }}
          >
            Book Repair {devices.length > 0 && <span style={{ background: '#fff', color: 'var(--primary)', padding: '0.1rem 0.4rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800 }}>{devices.length}</span>}
          </Link>

          {/* Hamburger button – mobile only */}
          <button 
            className="md:hidden flex items-center justify-center p-2 text-slate-800"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={28} />
          </button>
        </div>
      </div>

      {/* Full-screen Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
            <span className="font-bold text-xl text-slate-900">Menu</span>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-slate-800"
              aria-label="Close menu"
            >
              <X size={28} />
            </button>
          </div>
          
          <nav className="flex flex-col pt-2 overflow-y-auto">
            <Link href="/repairs" onClick={() => setIsMobileMenuOpen(false)} className="px-6 py-4 text-lg font-semibold border-b border-gray-100 text-slate-800">Services &amp; Repairs</Link>
            <Link href="/about-us" onClick={() => setIsMobileMenuOpen(false)} className="px-6 py-4 text-lg font-semibold border-b border-gray-100 text-slate-800">About Us</Link>
            <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="px-6 py-4 text-lg font-semibold border-b border-gray-100 text-slate-800">Shop</Link>
            <Link href="/track-status" onClick={() => setIsMobileMenuOpen(false)} className="px-6 py-4 text-lg font-semibold border-b border-gray-100 text-slate-800">Track Status</Link>
            <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)} className="px-6 py-4 text-lg font-semibold border-b border-gray-100 text-slate-800">Blog</Link>
            
            <div className="px-6 py-8">
              <Link href="/book-repair" onClick={() => setIsMobileMenuOpen(false)} className="primary-btn w-full flex justify-center items-center gap-2 text-[1rem] py-3">
                Book Repair Now {devices.length > 0 && <span style={{ background: '#fff', color: 'var(--primary)', padding: '0.1rem 0.5rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800 }}>{devices.length}</span>}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

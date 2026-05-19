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

      <div className="grid grid-cols-3 items-center w-full max-w-[1200px] mx-auto px-4 md:px-8 py-2 lg:py-[0.35rem]">
        {/* Left: Logo */}
        <div className="justify-self-start flex items-center">
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

        {/* Center: Desktop nav links */}
        <div className="hidden md:flex justify-self-center">
          <nav className="nav-links nav-links--desktop">
            <Link href="/repairs" prefetch={true}>Service &amp; Repairs</Link>
            <Link href="/about-us" prefetch={true}>About Us</Link>
            <Link href="/blog" prefetch={true}>Blog</Link>
          </nav>
        </div>

        {/* Right: Book Repair + Hamburger */}
        <div className="flex justify-self-end items-center gap-2 md:gap-3 col-span-2 md:col-span-1 justify-end">
          {/* Desktop Book Repair */}
          <Link 
            href="/book-repair" 
            prefetch={true}
            className="primary-btn hidden md:flex"
            style={{ padding: '0.6rem 1.4rem', whiteSpace: 'nowrap', fontSize: '0.85rem', alignItems: 'center', gap: '0.5rem' }}
          >
            Book Repair {devices.length > 0 && <span style={{ background: '#fff', color: 'var(--primary)', padding: '0.1rem 0.4rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800 }}>{devices.length}</span>}
          </Link>

          {/* Mobile-only condensed Book Now */}
          <Link 
            href="/book-repair" 
            prefetch={true}
            className="md:hidden flex bg-blue-600 text-white rounded-full font-bold shadow-sm hover:bg-blue-700 transition-colors"
            style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
          >
            BOOK NOW {devices.length > 0 && <span style={{ background: '#fff', color: 'var(--primary)', padding: '0.1rem 0.35rem', borderRadius: '8px', fontSize: '0.65rem' }}>{devices.length}</span>}
          </Link>

          {/* Hamburger button – mobile only */}
          <button 
            className="md:hidden flex items-center justify-center p-1 text-slate-800 ml-1"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={28} />
          </button>
        </div>
      </div>

      {/* Full-screen Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[9999] bg-white/95 backdrop-blur-sm flex flex-col">
          <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200/50">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center h-10">
              <Image 
                src="/images/logo.png" 
                alt="Ali Mobile & Repair Ringwood" 
                width={120} 
                height={40} 
                priority
                style={{ width: 'auto', height: '100%', objectFit: 'contain' }}
              />
            </Link>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-slate-800 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
              aria-label="Close menu"
            >
              <X size={26} />
            </button>
          </div>
          
          <nav className="flex flex-col pt-8 px-8 overflow-y-auto gap-8">
            <Link href="/repairs" onClick={() => setIsMobileMenuOpen(false)} className="text-[1.35rem] font-medium tracking-tight text-slate-800 hover:text-blue-600 transition-colors">Services &amp; Repairs</Link>
            <Link href="/about-us" onClick={() => setIsMobileMenuOpen(false)} className="text-[1.35rem] font-medium tracking-tight text-slate-800 hover:text-blue-600 transition-colors">About Us</Link>
            <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="text-[1.35rem] font-medium tracking-tight text-slate-800 hover:text-blue-600 transition-colors">Shop</Link>
            <Link href="/track-status" onClick={() => setIsMobileMenuOpen(false)} className="text-[1.35rem] font-medium tracking-tight text-slate-800 hover:text-blue-600 transition-colors">Track Status</Link>
            <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)} className="text-[1.35rem] font-medium tracking-tight text-slate-800 hover:text-blue-600 transition-colors">Blog</Link>
            
            <div className="pt-6 mt-4 border-t border-slate-200/50">
              <Link href="/book-repair" onClick={() => setIsMobileMenuOpen(false)} className="flex justify-center items-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-full font-semibold tracking-wide hover:bg-blue-700 transition-all shadow-md">
                Book Repair Now {devices.length > 0 && <span style={{ background: '#fff', color: 'var(--primary)', padding: '0.15rem 0.5rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 800 }}>{devices.length}</span>}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

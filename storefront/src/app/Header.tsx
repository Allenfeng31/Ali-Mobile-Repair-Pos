"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { analytics } from '@/lib/analytics';
import { ChevronDown, Menu, X } from 'lucide-react';
import { REPAIR_CATEGORY_NAV_ITEMS } from '@/lib/repairCategoryNavigation';

type ThemeMode = 'light' | 'dark';

const repairMenuItems = [
  { label: 'iPhone Repairs', href: '/repairs/phone/iphone' },
  { label: 'Samsung Repairs', href: '/repairs/phone/samsung' },
  { label: 'Other Phone Repairs', href: '/repairs/phone' },
  { label: 'iPad Repairs', href: '/repairs/tablet/ipad' },
  { label: 'MacBook Repairs', href: '/repairs/laptop/macbook' },
  { label: 'Apple Watch Repairs', href: '/repairs/watch/apple' },
];

const mobileDeviceMenuItems = [
  { label: 'Phone Repair', href: '/repairs/phone' },
  { label: 'iPhone Repair', href: '/repairs/phone/iphone' },
  { label: 'Samsung Repair', href: '/repairs/phone/samsung' },
  { label: 'Tablet Repair', href: '/repairs/tablet' },
  { label: 'MacBook Repair', href: '/repairs/laptop/macbook' },
  { label: 'Apple Watch Repair', href: '/repairs/watch/apple' },
  { label: 'More Brand Repairs', href: '/repairs/phone' },
];

const mobileProblemMenuItems = [
  { label: 'Screen Replacement', href: '/repairs/screen-replacement' },
  { label: 'Battery Replacement', href: '/repairs/battery-replacement' },
  { label: 'Charging Port Repair', href: '/repairs/charging-port-replacement' },
  { label: 'Back Glass / Back Housing', href: '/repairs/back-glass-replacement' },
  { label: 'Water Damage Assessment', href: '/repairs/water-damage' },
];

function getInitialTheme(): ThemeMode {
  return 'light'; // Forced light mode MVP
}

export default function Header() {
  const { devices } = useCart();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileGroup, setOpenMobileGroup] = useState<'service' | 'repair-categories' | null>(null);
  const [isServiceRepairsMenuOpen, setIsServiceRepairsMenuOpen] = useState(false);
  const [isRepairCategoriesMenuOpen, setIsRepairCategoriesMenuOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const serviceRepairsMenuRef = useRef<HTMLDivElement | null>(null);
  const repairCategoriesMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!isServiceRepairsMenuOpen && !isRepairCategoriesMenuOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (
        serviceRepairsMenuRef.current?.contains(target) ||
        repairCategoriesMenuRef.current?.contains(target)
      ) {
        return;
      }

      setIsServiceRepairsMenuOpen(false);
      setIsRepairCategoriesMenuOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsServiceRepairsMenuOpen(false);
        setIsRepairCategoriesMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isServiceRepairsMenuOpen, isRepairCategoriesMenuOpen]);

  // Lock to light mode, ignore toggles
  const toggleTheme = () => {
    setTheme('light');
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setOpenMobileGroup(null);
  };

  const closeServiceRepairsMenu = () => {
    setIsServiceRepairsMenuOpen(false);
  };

  const closeRepairCategoriesMenu = () => {
    setIsRepairCategoriesMenuOpen(false);
  };

  const closeAllNavigationMenus = () => {
    closeServiceRepairsMenu();
    closeRepairCategoriesMenu();
    closeMobileMenu();
  };

  const openServiceRepairsMenu = () => {
    setIsRepairCategoriesMenuOpen(false);
    setIsServiceRepairsMenuOpen(true);
  };

  const openRepairCategoriesMenu = () => {
    setIsServiceRepairsMenuOpen(false);
    setIsRepairCategoriesMenuOpen(true);
  };

  const toggleRepairCategoriesMenu = () => {
    setIsRepairCategoriesMenuOpen((current) => {
      const nextValue = !current;
      if (nextValue) {
        setIsServiceRepairsMenuOpen(false);
      }
      return nextValue;
    });
  };

  const handleServiceRepairSelection = () => {
    closeAllNavigationMenus();
  };

  const handleRepairCategorySelection = () => {
    closeAllNavigationMenus();
  };

  const handleLogoClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    closeAllNavigationMenus();

    if (pathname !== '/') {
      return;
    }

    event.preventDefault();

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  const toggleMobileGroup = (group: 'service' | 'repair-categories') => {
    setOpenMobileGroup((current) => (current === group ? null : group));
  };

  useEffect(() => {
    closeAllNavigationMenus();
  }, [pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [isMobileMenuOpen]);

  return (
    <>
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

        <div className="flex items-center justify-between relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-2 lg:py-[0.35rem]">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link href="/" onClick={handleLogoClick} aria-label="Ali Mobile home" className="nav-logo">
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

          {/* Center: Desktop nav links (Absolute Center) */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <nav className="nav-links nav-links--desktop">
              <div
                ref={serviceRepairsMenuRef}
                className={`nav-dropdown nav-dropdown--controlled ${isServiceRepairsMenuOpen ? 'nav-dropdown--open' : ''}`}
                onMouseEnter={openServiceRepairsMenu}
                onMouseLeave={closeServiceRepairsMenu}
                onFocusCapture={openServiceRepairsMenu}
                onBlurCapture={(event) => {
                  if (!serviceRepairsMenuRef.current?.contains(event.relatedTarget as Node | null)) {
                    closeServiceRepairsMenu();
                  }
                }}
              >
                <Link href="/repairs" prefetch={true} className="nav-dropdown-trigger" onClick={closeAllNavigationMenus}>
                  Service &amp; Repairs
                </Link>
                <div className="nav-dropdown-menu" aria-label="Service and repair categories">
                  {repairMenuItems.map((item) => (
                    <Link key={item.href} href={item.href} prefetch={true} onClick={handleServiceRepairSelection}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div
                ref={repairCategoriesMenuRef}
                className={`nav-dropdown nav-dropdown--controlled ${isRepairCategoriesMenuOpen ? 'nav-dropdown--open' : ''}`}
                onMouseEnter={openRepairCategoriesMenu}
                onMouseLeave={closeRepairCategoriesMenu}
                onFocusCapture={openRepairCategoriesMenu}
                onBlurCapture={(event) => {
                  if (!repairCategoriesMenuRef.current?.contains(event.relatedTarget as Node | null)) {
                    closeRepairCategoriesMenu();
                  }
                }}
              >
                <button
                  type="button"
                  className="nav-dropdown-trigger nav-dropdown-trigger--button"
                  aria-expanded={isRepairCategoriesMenuOpen}
                  aria-controls="desktop-repair-categories-menu"
                  onClick={toggleRepairCategoriesMenu}
                >
                  Repair Categories
                </button>
                <div
                  id="desktop-repair-categories-menu"
                  className="nav-dropdown-menu nav-dropdown-menu--repair-categories"
                  aria-label="Repair categories"
                  aria-hidden={!isRepairCategoriesMenuOpen}
                >
                  {REPAIR_CATEGORY_NAV_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={true}
                      className="nav-dropdown-card"
                      onClick={handleRepairCategorySelection}
                    >
                      <span className="nav-dropdown-card-label">{item.label}</span>
                      <span className="nav-dropdown-card-note">{item.description}</span>
                    </Link>
                  ))}
                </div>
              </div>
              <Link href="/about-us" prefetch={true}>About Us</Link>
              <Link href="/blog" prefetch={true}>Blog</Link>
              <Link href="/track-status" prefetch={true}>Track Status</Link>
            </nav>
          </div>

          {/* Right: Book Repair + Hamburger */}
          <div className="flex items-center gap-2 md:gap-3">
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
              style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap', color: '#ffffff' }}
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
      </header>

      {/* Full-screen Mobile Menu Overlay — MUST be outside <header> because
          .navbar's backdrop-filter creates a containing block that traps
          position:fixed children to the header's box instead of the viewport. */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu}>
          <div className="mobile-menu-panel" onClick={(event) => event.stopPropagation()}>
            <div className="mobile-menu-header">
              <Link href="/" onClick={handleLogoClick} aria-label="Ali Mobile home" className="mobile-menu-logo">
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
                onClick={closeMobileMenu}
                className="mobile-menu-close"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            <nav className="mobile-menu-nav" aria-label="Mobile navigation">
              <div className="mobile-nav-group">
                <button
                  type="button"
                  className="mobile-nav-group-trigger"
                  aria-expanded={openMobileGroup === 'service'}
                  aria-controls="mobile-service-repairs-panel"
                  onClick={() => toggleMobileGroup('service')}
                >
                  <span>By Device</span>
                  <ChevronDown size={18} className={openMobileGroup === 'service' ? 'mobile-nav-group-icon mobile-nav-group-icon--open' : 'mobile-nav-group-icon'} />
                </button>
                <div
                  id="mobile-service-repairs-panel"
                  className={openMobileGroup === 'service' ? 'mobile-nav-group-panel mobile-nav-group-panel--open' : 'mobile-nav-group-panel'}
                >
                  <div className="mobile-nav-group-panel-inner">
                    <Link href="/repairs" onClick={closeAllNavigationMenus} className="mobile-nav-group-link mobile-nav-group-link--overview">
                      All Service &amp; Repairs
                    </Link>
                    <div className="mobile-repair-links" aria-label="Device repair categories">
                      {mobileDeviceMenuItems.map((item) => (
                        <Link key={`${item.label}-${item.href}`} href={item.href} onClick={handleServiceRepairSelection}>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mobile-nav-group">
                <button
                  type="button"
                  className="mobile-nav-group-trigger"
                  aria-expanded={openMobileGroup === 'repair-categories'}
                  aria-controls="mobile-repair-categories-panel"
                  onClick={() => toggleMobileGroup('repair-categories')}
                >
                  <span>By Problem</span>
                  <ChevronDown size={18} className={openMobileGroup === 'repair-categories' ? 'mobile-nav-group-icon mobile-nav-group-icon--open' : 'mobile-nav-group-icon'} />
                </button>
                <div
                  id="mobile-repair-categories-panel"
                  className={openMobileGroup === 'repair-categories' ? 'mobile-nav-group-panel mobile-nav-group-panel--open' : 'mobile-nav-group-panel'}
                >
                  <div className="mobile-nav-group-panel-inner">
                    <div className="mobile-repair-links" aria-label="Repair problem categories">
                      {mobileProblemMenuItems.map((item) => (
                        <Link key={item.href} href={item.href} onClick={handleRepairCategorySelection}>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mobile-menu-link-grid">
                <Link href="/book-repair" onClick={closeAllNavigationMenus} className="mobile-menu-link">Get a Quote</Link>
                <Link href="/locations/ringwood" onClick={closeAllNavigationMenus} className="mobile-menu-link">Visit Ringwood Square</Link>
                <Link href="/about-us" onClick={closeAllNavigationMenus} className="mobile-menu-link">About Us</Link>
                <Link href="/blog" onClick={closeAllNavigationMenus} className="mobile-menu-link">Blog</Link>
                <Link href="/track-status" onClick={closeAllNavigationMenus} className="mobile-menu-link">Track Status</Link>
              </div>
            </nav>

            <div className="mobile-menu-cta">
              <Link href="/book-repair" onClick={closeAllNavigationMenus} className="mobile-menu-primary-action">
                Book Repair Now {devices.length > 0 && <span>{devices.length}</span>}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

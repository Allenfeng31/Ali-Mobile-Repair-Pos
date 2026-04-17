import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="navbar">
      <div className="nav-container">
        <Link href="/" className="nav-logo">
          <Image 
            src="/logo-clean.jpg" 
            alt="Ali Mobile & Repair Ringwood" 
            width={180} 
            height={50} 
            priority
            style={{ width: 'auto', height: '100%', objectFit: 'contain' }}
          />
        </Link>

        <nav className="nav-links">
          <Link href="/repairs">Repairs</Link>
          <Link href="/about-us">About Us</Link>
          <Link href="/blog">Blog</Link>
        </nav>

        <div style={{ gridColumn: '2', gridRow: '1', justifySelf: 'end', display: 'flex', alignItems: 'center' }}>
          <Link 
            href="/book-repair" 
            className="primary-btn"
            style={{ padding: '0.6rem 1.4rem', whiteSpace: 'nowrap' }}
          >
            Book Repair
          </Link>
        </div>
      </div>
    </header>
  );
}

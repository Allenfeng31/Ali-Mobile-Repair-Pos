import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image 
            src="/logo-clean.jpg" 
            alt="Ali Mobile & Repair Ringwood" 
            width={180} 
            height={48} 
            priority
            className="h-10 w-auto"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-slate-600 font-medium">
          <Link href="/repairs" className="hover:text-blue-600 transition">Repairs</Link>
          <Link href="/services" className="hover:text-blue-600 transition">Services</Link>
          <Link href="/about-us" className="hover:text-blue-600 transition">About Us</Link>
          <Link href="/blog" className="hover:text-blue-600 transition">Blog</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link 
            href="/book-repair" 
            className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition"
          >
            Book Repair
          </Link>
          <a 
            href="tel:0481058514" 
            className="hidden lg:block text-slate-900 font-bold"
          >
            📞 0481 058 514
          </a>
        </div>
      </div>
    </header>
  );
}

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ChatWidget from "./ChatWidget";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Phone & iPad Repair | Ali Mobile Repair | System Recovery",
  description: "Expert phone and iPad repair in Melbourne. We also do system recovery, data backup and water damage fixing. No FIX no CHARGE.",
  openGraph: {
    title: "Phone Repair | Ali Mobile Repair",
    description: "Expert phone and iPad repair in Melbourne.",
    url: "https://www.alimobile.com.au",
    siteName: "Ali Mobile Repair",
    locale: "en_AU",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU" className={`${inter.variable}`}>
      <head>
        <link rel="canonical" href="https://www.alimobile.com.au" />
        <meta name="geo.region" content="AU-VIC" />
        <meta name="geo.placename" content="Ringwood, Melbourne" />
        <meta name="geo.position" content="-37.813637;145.228892" />
        <meta name="ICBM" content="-37.813637, 145.228892" />
      </head>
      <body>
        <nav className="navbar">
          <div className="nav-container">
            <a href="/" className="nav-logo">Ali Mobile</a>
            <div className="nav-links">
              <a href="/">HOME</a>
              <a href="/services">SERVICES</a>
              <a href="/book-repair">BOOK REPAIR</a>
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
        <main>{children}</main>
        <ChatWidget />
        <footer className="footer">
          <div className="footer-links" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
            <a href="https://ali-mobile-repair-pos-g2by.vercel.app/login">POS System Login</a>
            <a href="/privacy-policy">Privacy Policy</a>
          </div>
          <p>Contact Number: 0481 058 514</p>
          <p>Address: Kiosk c1 Ringwood Square Shopping Centre, Ringwood 3134</p>
          <p>&copy; {new Date().getFullYear()} Ali Mobile Repair. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}

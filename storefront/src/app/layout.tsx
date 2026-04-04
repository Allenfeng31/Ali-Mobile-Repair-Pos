import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ChatWidget from "./ChatWidget";
import Header from "./Header";

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
  icons: {
    icon: "/favicon.png",
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
        <Header />
        <main>{children}</main>
        <ChatWidget />
        <footer className="footer">
          <div className="footer-links" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
            <a href="https://ali-mobile-repair-pos-g2by.vercel.app/login">POS System Login</a>
            <a href="/privacy-policy">Privacy Policy</a>
            <a href="/about-us">About Us</a>
          </div>
          <p>Contact Number: 0481 058 514</p>
          <p>Address: Kiosk c1 Ringwood Square Shopping Centre, Ringwood 3134</p>
          <p>&copy; {new Date().getFullYear()} Ali Mobile Repair. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}

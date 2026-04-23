import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import Header from "../Header";
import { CartProvider } from "@/context/CartContext";
import PageTransition from "@/components/PageTransition";

const ChatWidget = dynamic(() => import("../ChatWidget"));

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Phone & Tablet Repair in Ringwood, Melbourne | Ali Mobile & Repair",
  description: "Expert phone and tablet repair in Ringwood, Melbourne. We specialize in iPhone, iPad, Samsung, and Google Pixel screen replacements and battery fixing. No FIX no CHARGE.",
  openGraph: {
    title: "Phone & Tablet Repair Melbourne | Ali Mobile Repair",
    description: "Expert phone and tablet repair in Ringwood, Melbourne.",
    url: "https://www.alimobile.com.au",
    siteName: "Ali Mobile Repair",
    locale: "en_AU",
    type: "website",
  },
  icons: {
    icon: "/favicon.png",
  },
};

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <CartProvider>
        <Header />
        <main>
          <PageTransition>
            {children}
          </PageTransition>
        </main>
        <ChatWidget />
        <footer className="footer">
          <div className="footer-links" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
            <a href="/privacy-policy">Privacy Policy</a>
            <a href="/about-us">About Us</a>
          </div>
          <p>Contact Number: 0481 058 514</p>
          <p>Address: Kiosk c1 Ringwood Square Shopping Centre, Ringwood 3134</p>
          <p>&copy; {new Date().getFullYear()} Ali Mobile Repair. All rights reserved.</p>
        </footer>
      </CartProvider>
    </>
  );
}

import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import Header from "../Header";
import { CartProvider } from "@/context/CartContext";
import PageTransition from "@/components/PageTransition";
import { Clock3, MapPin, Navigation, PhoneCall, ShieldCheck, Wrench } from "lucide-react";

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
          <div className="footer-shell">
            <div className="footer-cta-panel">
              <div>
                <span className="footer-kicker">Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134 repair desk</span>
                <h2>Need a clear repair price before you visit?</h2>
                <p>
                  Book online for priority service, call for part availability, or drop into Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134 for a practical device check.
                </p>
              </div>
              <div className="footer-cta-actions">
                <Link href="/book-repair" prefetch={true} className="footer-primary-action">
                  Book Repair
                </Link>
                <a href="tel:0481058514" className="footer-secondary-action">
                  Call 0481 058 514
                </a>
              </div>
            </div>

            <div className="footer-main">
              <div className="footer-brand-block">
                <Link href="/" className="footer-logo-link" aria-label="Ali Mobile & Repair homepage">
                  <Image
                    src="/images/logo.png"
                    alt="Ali Mobile & Repair"
                    width={180}
                    height={60}
                    className="footer-logo"
                  />
                </Link>
                <p>
                  Local phone, tablet, laptop, and Apple Watch repairs from Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134.
                  Clear diagnosis first, practical pricing, and warranty-backed workmanship.
                </p>
                <div className="footer-trust-strip" aria-label="Repair promises">
                  <span>
                    <ShieldCheck size={15} strokeWidth={2.5} aria-hidden="true" />
                    180-Day Warranty
                  </span>
                  <span>
                    <Wrench size={15} strokeWidth={2.5} aria-hidden="true" />
                    No Fix, No Charge
                  </span>
                </div>
              </div>

              <div className="footer-contact-cards" aria-label="Store contact details">
                <a href="tel:0481058514" className="footer-contact-card">
                  <PhoneCall size={19} strokeWidth={2.4} aria-hidden="true" />
                  <span>Call the repair desk</span>
                  <strong>0481 058 514</strong>
                  <small>Ask about parts, timing, and live quote support.</small>
                </a>
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=Ringwood+Square+Shopping+Centre+Kiosk+C1,+Seymour+St,+Ringwood+VIC+3134"
                  className="footer-contact-card"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin size={19} strokeWidth={2.4} aria-hidden="true" />
                  <span>Visit us in store</span>
                  <strong>Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134</strong>
                </a>
                <div className="footer-contact-card">
                  <Clock3 size={19} strokeWidth={2.4} aria-hidden="true" />
                  <span>Opening hours</span>
                  <strong>Mon-Sat, 10am-5pm</strong>
                  <small>Walk-ins welcome. Online bookings get priority.</small>
                </div>
              </div>

              <nav className="footer-link-grid" aria-label="Footer navigation">
                <div>
                  <h3>Repair Services</h3>
                  <Link href="/repairs/phone" prefetch={true}>Phone Repair</Link>
                  <Link href="/repairs/tablet" prefetch={true}>Tablet & iPad Repair</Link>
                  <Link href="/repairs/laptop" prefetch={true}>Laptop & MacBook Repair</Link>
                  <Link href="/repairs/watch" prefetch={true}>Apple Watch Repair</Link>
                </div>
                <div>
                  <h3>Support</h3>
                  <Link href="/book-repair" prefetch={true}>Book Repair</Link>
                  <Link href="/track-status" prefetch={true}>Track Repair Status</Link>
                  <Link href="/about-us" prefetch={true}>About Us</Link>
                  <Link href="/privacy-policy" prefetch={true}>Privacy Policy</Link>
                </div>
                <div>
                  <h3>Local Areas</h3>
                  <Link href="/locations/ringwood" prefetch={true}>Ringwood</Link>
                  <Link href="/locations/croydon" prefetch={true}>Croydon</Link>
                  <Link href="/locations/mitcham" prefetch={true}>Mitcham</Link>
                  <Link href="/locations/heathmont" prefetch={true}>Heathmont</Link>
                </div>
              </nav>
            </div>

            <div className="footer-bottom">
              <p>
                &copy; 2026 Ali Mobile & Repair. All rights reserved.{" "}
                <Link href="/disclaimer" className="text-gray-400 hover:text-gray-600 text-xs ml-2">
                  [Disclaimer]
                </Link>
              </p>
              <div>
                <span>Local Melbourne electronics repair business</span>
                <span>
                  <Navigation size={14} strokeWidth={2.4} aria-hidden="true" />
                  Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134
                </span>
              </div>
            </div>
          </div>
        </footer>
      </CartProvider>
    </>
  );
}

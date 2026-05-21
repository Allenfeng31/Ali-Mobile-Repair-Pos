import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock, MapPin, Navigation, PhoneCall, ShieldCheck, Wrench } from "lucide-react";
import { SERVICE_AREAS, getServiceAreaBySlug } from "@/data/serviceAreas";

type LocationPageProps = {
  params: Promise<{
    suburb: string;
  }>;
};

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.alimobile.com.au";
const suburbTransitGuide: Record<string, string[]> = {
  vermont: [
    " Catch Bus 742 directly from Vermont to Ringwood Station, followed by a short 5-minute walk to Ringwood Square Shopping Centre.",
    " Board Bus 736 towards Mitcham Station, transfer to the Lilydale/Belgrave line train, and exit at Ringwood Station."
  ],
  boxhill: [
    " Take the Lilydale or Belgrave line express train directly from Box Hill Station to Ringwood Station (approx. 12 minutes).",
    " For driving/bus commuters, head straight down Maroondah Highway directly into the Ringwood Square corridor."
  ]
};

export function generateStaticParams() {
  return SERVICE_AREAS.map((area) => ({
    suburb: area.slug,
  }));
}

export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
  const { suburb } = await params;
  const area = getServiceAreaBySlug(suburb);

  if (!area) {
    return {
      title: "Service Area Not Found | Ali Mobile & Repair",
    };
  }

  return {
    title: `Device Repair near ${area.name} | Ali Mobile & Repair Ringwood`,
    description: `Phone, tablet, laptop, and watch repairs for ${area.name} residents. Visit Ali Mobile & Repair at Ringwood Square for expert diagnostics, No Fix No Charge, and warranty-backed repairs.`,
    alternates: {
      canonical: `${baseUrl}/locations/${area.slug}`,
    },
    openGraph: {
      title: `Expert Device Repair for ${area.name} Residents`,
      description: `A practical ${area.driveTime.toLowerCase()} trip to Ringwood Square for professional device repairs.`,
      url: `${baseUrl}/locations/${area.slug}`,
      type: "website",
      locale: "en_AU",
      siteName: "Ali Mobile & Repair",
    },
  };
}

export default async function LocationPage({ params }: LocationPageProps) {
  const { suburb } = await params;
  const area = getServiceAreaBySlug(suburb);

  if (!area) notFound();

  const routeOrigin = `${area.name}, Victoria, Australia`;
  const routeDestination = "Ringwood Square Shopping Centre, 171-175 Maroondah Hwy, Ringwood VIC 3134";
  const encodedOrigin = encodeURIComponent(routeOrigin);
  const encodedDestination = encodeURIComponent(routeDestination);
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const transitMapSrc = googleMapsApiKey
    ? `https://www.google.com/maps/embed/v1/directions?key=${googleMapsApiKey}&origin=${encodedOrigin}&destination=${encodedDestination}&mode=transit`
    : `https://www.google.com/maps?output=embed&saddr=${encodedOrigin}&daddr=${encodedDestination}&dirflg=r`;
  const currentSuburb = suburb.toLowerCase();
  const transitSteps = suburbTransitGuide[currentSuburb] ?? [
    " Get direct transit routes to Ringwood via local train or Maroondah Hwy bus corridors."
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${baseUrl}/#localbusiness`,
    name: "Ali Mobile & Repair",
    url: baseUrl,
    telephone: "+61481058514",
    priceRange: "$$",
    image: `${baseUrl}/images/logo.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Kiosk C1, Ringwood Square Shopping Centre, 59-65 Maroondah Hwy",
      addressLocality: "Ringwood",
      addressRegion: "VIC",
      postalCode: "3134",
      addressCountry: "AU",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -37.81534,
      longitude: 145.22851,
    },
    areaServed: {
      "@type": "Place",
      name: `${area.name}, Victoria`,
    },
    makesOffer: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: `Phone and device repair for ${area.name} residents`,
          areaServed: area.name,
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <main className="location-page-shell">
        <section className="location-hero" aria-labelledby="location-heading">
          <div className="location-hero-copy">
            <span className="location-kicker">
              <MapPin size={16} strokeWidth={2.5} aria-hidden="true" />
              Service area
            </span>
            <h1 id="location-heading">Expert Device Repair for {area.name} Residents</h1>
            <p>
              A practical {area.driveTime.toLowerCase()} trip to Ringwood Square for careful diagnostics,
              transparent quotes, and warranty-backed repairs from a specialist local bench.
            </p>

            <div className="location-hero-actions">
              <Link href="/book-repair" className="repair-primary-action">
                Book Repair
                <ArrowRight size={18} strokeWidth={2.7} aria-hidden="true" />
              </Link>
              <a href="tel:0481058514" className="repair-secondary-action">
                <PhoneCall size={17} strokeWidth={2.6} aria-hidden="true" />
                Call Now
              </a>
            </div>
          </div>

          <aside className="location-route-card location-map-card" aria-label={`Transit route from ${area.name} to Ringwood Square`}>
            <iframe
              src={transitMapSrc}
              title={`Public transport directions from ${area.name} to Ali Mobile & Repair Ringwood`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen={false}
            />
            <div className="location-map-caption">
              <Clock size={18} strokeWidth={2.5} aria-hidden="true" />
              <div>
                <strong>{area.name} to Ringwood Square</strong>
                <span>Transit route preview</span>
              </div>
            </div>
          </aside>
        </section>

        <section className="location-content-grid">
          <article className="location-story-card">
            <span className="location-kicker location-kicker-muted">Why make the trip</span>
            <h2>Why {area.name} customers visit Ali Mobile & Repair</h2>
            <p>
              {area.localReason} We do not try to turn every issue into a repair. Our team checks the
              fault first, explains the likely repair path, and applies No Fix No Charge to eligible
              diagnostics when the device cannot be repaired as quoted.
            </p>
            <p>
              For common iPhone, Samsung, iPad, MacBook, and Apple Watch issues, the short trip to
              Ringwood Square can save the uncertainty of mailing a device away or accepting a vague
              quote before anyone has inspected the hardware.
            </p>
          </article>

          <article className="location-story-card location-route-details">
            <span className="location-kicker location-kicker-muted">Local route</span>
            <h2>Getting here from {area.name}</h2>
            <p>{area.route}</p>
            <p>{area.transitAdvice}</p>
            <div className="location-landmarks">
              {area.landmarks.map((landmark) => (
                <span key={landmark}>{landmark}</span>
              ))}
            </div>
            <div className="location-inline-map">
              <iframe
                src={transitMapSrc}
                title={`Transit map from ${area.name} to Ringwood Square Shopping Centre`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen={false}
              />
            </div>
            <div className="location-transit-guide">
              <h3>Public transport options from {area.name}</h3>
              <ul>
                {transitSteps.map((step) => (
                  <li key={step}>{step.trim()}</li>
                ))}
              </ul>
            </div>
          </article>
        </section>

        <section className="location-service-grid" aria-label="Repair services available from Ringwood Square">
          <Link href="/repairs/phone" className="location-service-card">
            <Wrench size={22} strokeWidth={2.5} aria-hidden="true" />
            <strong>Phone Repair</strong>
            <span>Screen, battery, charging, camera</span>
          </Link>
          <Link href="/repairs/tablet" className="location-service-card">
            <Wrench size={22} strokeWidth={2.5} aria-hidden="true" />
            <strong>Tablet Repair</strong>
            <span>iPad and Samsung Tab support</span>
          </Link>
          <Link href="/repairs/laptop" className="location-service-card">
            <Wrench size={22} strokeWidth={2.5} aria-hidden="true" />
            <strong>Laptop Repair</strong>
            <span>MacBook and Windows diagnostics</span>
          </Link>
          <Link href="/repairs/watch" className="location-service-card">
            <ShieldCheck size={22} strokeWidth={2.5} aria-hidden="true" />
            <strong>Watch Repair</strong>
            <span>Screen and battery options</span>
          </Link>
        </section>

        <section className="location-final-cta">
          <div>
            <span className="location-kicker location-kicker-muted">Before you drive</span>
            <h2>Call first if you want pricing or stock checked</h2>
            <p>
              Tell us your device model and symptom. If a pickup or timing option makes more sense
              for your situation, we can talk through the best next step before you leave {area.name}.
            </p>
          </div>
          <a href="tel:0481058514" className="repair-primary-action">
            <PhoneCall size={18} strokeWidth={2.7} aria-hidden="true" />
            0481 058 514
          </a>
        </section>
      </main>
    </>
  );
}

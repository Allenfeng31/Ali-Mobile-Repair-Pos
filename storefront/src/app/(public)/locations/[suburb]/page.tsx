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
  ringwood: [
    " Walk or catch any local service into Ringwood Station, then continue about 5-10 minutes to Ringwood Square Shopping Centre.",
    " Drive directly to Ringwood Square Shopping Centre on Maroondah Highway and park near the centre entry for Kiosk C1."
  ],
  ringwoodnorth: [
    " Catch a local Ringwood-bound bus from the Warrandyte Road corridor towards Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre.",
    " Drive south via Warrandyte Road into Ringwood, then enter Ringwood Square Shopping Centre from the Maroondah Highway side."
  ],
  croydon: [
    " Catch the Lilydale line train towards Flinders Street from Croydon Station and depart at Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre.",
    " Drive west via Maroondah Highway or Mt Dandenong Road into Ringwood, park at Ringwood Square Shopping Centre, and walk directly to Kiosk C1."
  ],
  boxhill: [
    " Catch the Lilydale or Belgrave line train towards Lilydale/Belgrave from Box Hill Station and depart at Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre.",
    " Drive east along Whitehorse Road and Maroondah Highway directly into the Ringwood Square corridor, then park inside Ringwood Square Shopping Centre."
  ],
  mitcham: [
    " Catch the Lilydale or Belgrave line train towards Lilydale/Belgrave from Mitcham Station and depart at Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre.",
    " Drive east along Maroondah Highway from Mitcham into Ringwood, turn into Ringwood Square Shopping Centre, and walk to Kiosk C1."
  ],
  glenwaverley: [
    " Catch Bus 742 from Glen Waverley Station towards Ringwood Station and depart at Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre.",
    " Drive via Springvale Road, Canterbury Road, and Wantirna Road toward Ringwood, then park at Ringwood Square Shopping Centre."
  ],
  heathmont: [
    " Catch the Belgrave line train towards the City from Heathmont Station and depart at Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre.",
    " Drive north via Canterbury Road and Heathmont Road toward Ringwood, then enter Ringwood Square Shopping Centre from the Maroondah Highway side."
  ],
  wantirna: [
    " Catch SmartBus 901 towards Ringwood Station from the Wantirna Road or Canterbury Road corridor and depart at Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre.",
    " Drive north via Wantirna Road or EastLink toward Ringwood, then park at Ringwood Square Shopping Centre for direct access to Kiosk C1."
  ],
  doncaster: [
    " Catch SmartBus 907 from Doncaster Road towards Mitcham Station, then transfer to the Lilydale/Belgrave line or SmartBus 901 towards Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre.",
    " Drive via Doncaster Road, Springvale Road, and Maroondah Highway, or use EastLink toward Ringwood, then park at Ringwood Square Shopping Centre."
  ],
  bayswater: [
    " Catch the Belgrave line train towards the City from Bayswater Station and depart at Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre.",
    " Drive west via Mountain Highway toward Ringwood, continue into the Ringwood Square corridor, and park at Ringwood Square Shopping Centre."
  ],
  boronia: [
    " Catch the Belgrave line train towards the City from Boronia Station and depart at Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre.",
    " Drive via Boronia Road, Dorset Road, or Mountain Highway toward Ringwood, then use Ringwood Square Shopping Centre parking."
  ],
  burwood: [
    " Catch Tram 75 towards Vermont South, then transfer to Bus 742 towards Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre.",
    " Drive east along Burwood Highway, connect through Vermont South and Wantirna Road toward Ringwood, then park at Ringwood Square Shopping Centre."
  ],
  nunawading: [
    " Catch the Lilydale or Belgrave line train towards Lilydale/Belgrave from Nunawading Station and depart at Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre.",
    " Drive east along Maroondah Highway from Nunawading through Mitcham into Ringwood, then park at Ringwood Square Shopping Centre."
  ],
  balwyn: [
    " Catch Bus 302 or 304 towards Box Hill, then transfer at Box Hill Station to the Lilydale/Belgrave line towards Ringwood. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre.",
    " Drive east via Whitehorse Road and Maroondah Highway through Box Hill and Mitcham into Ringwood Square Shopping Centre."
  ],
  vermont: [
    " Catch Bus 742 directly from Vermont towards Ringwood Station and depart at Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre.",
    " Drive east via Canterbury Road, Heatherdale Road, or Wantirna Road toward Ringwood, then park at Ringwood Square Shopping Centre."
  ],
  ringwoodeast: [
    " Catch the Lilydale line train towards the City from Ringwood East Station and depart at Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre.",
    " Drive west via Dublin Road or Maroondah Highway into Ringwood, then park at Ringwood Square Shopping Centre."
  ],
  springvale: [
    " Catch SmartBus 902 from Springvale Station towards Nunawading Station, then transfer to the Lilydale/Belgrave line towards Ringwood. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre.",
    " Drive north via Springvale Road and EastLink toward Ringwood, then park at Ringwood Square Shopping Centre."
  ],
  kilsyth: [
    " Catch Bus 690 towards Croydon Station, then transfer to the Lilydale line towards the City. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre.",
    " Drive west via Mt Dandenong Road and Maroondah Highway into Ringwood, then park at Ringwood Square Shopping Centre."
  ],
  mooroolbark: [
    " Catch the Lilydale line train towards the City from Mooroolbark Station and depart at Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre.",
    " Drive via Manchester Road, Canterbury Road, or Maroondah Highway toward Ringwood, then park at Ringwood Square Shopping Centre."
  ],
  clayton: [
    " Catch the Cranbourne/Pakenham line train from Clayton Station to Richmond, then transfer to the Lilydale/Belgrave line towards Ringwood. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre.",
    " Drive via Ferntree Gully Road and EastLink toward Ringwood, then park at Ringwood Square Shopping Centre."
  ],
  lilydale: [
    " Catch the Lilydale line train towards the City from Lilydale Station and depart at Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre.",
    " Drive west along Maroondah Highway from Lilydale through Chirnside Park and Croydon into Ringwood Square Shopping Centre."
  ],
  chirnsidepark: [
    " Catch Bus 670 from Chirnside Park Shopping Centre towards Ringwood Station and depart at Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre.",
    " Drive west along Maroondah Highway through Croydon into Ringwood, then park at Ringwood Square Shopping Centre."
  ],
  ferntreegully: [
    " Catch the Belgrave line train towards the City from Ferntree Gully Station and depart at Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre.",
    " Drive north via Burwood Highway, Dorset Road, or Mountain Highway toward Ringwood, then park at Ringwood Square Shopping Centre."
  ],
  knoxfield: [
    " Catch SmartBus 901 from the Stud Road or Burwood Highway corridor towards Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre.",
    " Drive north via Stud Road and Boronia Road or use EastLink toward Ringwood, then park at Ringwood Square Shopping Centre."
  ],
  rowville: [
    " Catch SmartBus 901 from Stud Park Shopping Centre towards Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre.",
    " Drive via Stud Road, Ferntree Gully Road, or EastLink toward Ringwood, then park at Ringwood Square Shopping Centre."
  ],
  donvale: [
    " Catch SmartBus 902 from the Springvale Road corridor towards Nunawading Station, then transfer to the Lilydale/Belgrave line towards Ringwood. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre.",
    " Drive via Springvale Road and Maroondah Highway or use EastLink toward Ringwood, then park at Ringwood Square Shopping Centre."
  ],
  parkorchards: [
    " Catch Bus 364 from the Ringwood-Warrandyte Road corridor towards Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre.",
    " Drive south via Park Road or Ringwood-Warrandyte Road into Ringwood, then park at Ringwood Square Shopping Centre."
  ],
  warrandyte: [
    " Catch Bus 364 from Warrandyte towards Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre.",
    " Drive via Ringwood-Warrandyte Road directly into Ringwood, then park at Ringwood Square Shopping Centre."
  ],
  blackburn: [
    " Catch the Lilydale or Belgrave line train towards Lilydale/Belgrave from Blackburn Station and depart at Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre.",
    " Drive east along Whitehorse Road and Maroondah Highway through Nunawading and Mitcham into Ringwood Square Shopping Centre."
  ],
  warranwood: [
    " Catch a Ringwood-bound local bus from the Wonga Road or Ringwood-Warrandyte Road corridor towards Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre.",
    " Drive south along Wonga Road, connect through Ringwood North, and park at Ringwood Square Shopping Centre."
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

  const currentSuburb = suburb.toLowerCase().replace(/-/g, "");
  const transitSteps = suburbTransitGuide[currentSuburb] ?? [
    " Get direct transit routes to Ringwood via local train or Maroondah Hwy bus corridors."
  ];
  const routeOrigin = `${area.name}, Victoria, Australia`;
  const routeDestination = "Ringwood Square Shopping Centre, Ringwood VIC 3134";
  const encodedOrigin = encodeURIComponent(routeOrigin);
  const encodedDestination = encodeURIComponent(routeDestination);
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const transitMapSrc = googleMapsApiKey
    ? `https://www.google.com/maps/embed/v1/directions?key=${googleMapsApiKey}&origin=${encodedOrigin}&destination=${encodedDestination}&mode=transit`
    : `https://www.google.com/maps?output=embed&saddr=${encodedOrigin}&daddr=${encodedDestination}&dirflg=r`;

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
            <div className="location-map-frame">
              <iframe
                src={transitMapSrc}
                title={`Transit directions from ${area.name} to Ringwood Square Shopping Centre`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen={false}
              />
            </div>
            <div className="location-map-panel">
              <div className="location-route-stat">
                <Clock size={20} strokeWidth={2.5} aria-hidden="true" />
                <div>
                  <strong>{area.driveTime}</strong>
                  <span>Typical local trip</span>
                </div>
              </div>
              <div className="location-route-stat">
                <Navigation size={20} strokeWidth={2.5} aria-hidden="true" />
                <div>
                  <strong>{area.name} to Ringwood Square</strong>
                  <span>Live Google route preview</span>
                </div>
              </div>
              <div className="location-transit-preview">
                <strong>Fastest practical route</strong>
                <p>{transitSteps[0].trim()}</p>
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

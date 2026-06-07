import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Battery, Camera, CheckCircle2, Clock, MapPin, Navigation, PhoneCall, PlugZap, ShieldCheck, Smartphone, TabletSmartphone, Wrench } from "lucide-react";
import { SERVICE_AREAS, getServiceAreaBySlug } from "@/data/serviceAreas";
import LocationAnalyticsTracker from "@/components/analytics/LocationAnalyticsTracker";

type LocationPageProps = {
  params: Promise<{
    suburb: string;
  }>;
};

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.alimobile.com.au";

const popularRepairLinks: Array<{
  title: string;
  description: string;
  href: string;
  timing: string;
  Icon: LucideIcon;
}> = [
  {
    title: "iPhone Screen Replacement",
    description: "Cracked glass, display lines, touch faults, and frame-fit checks before quoting.",
    href: "/repairs/phone/iphone/iphone-15-pro-max/screen-replacement",
    timing: "Quote and parts check first",
    Icon: Smartphone,
  },
  {
    title: "Phone Battery Replacement",
    description: "Battery health, swelling risk, shutdown symptoms, and charging behaviour checked in-store.",
    href: "/repairs/phone/iphone/iphone-13/battery-replacement",
    timing: "Common same-visit repair",
    Icon: Battery,
  },
  {
    title: "Charging Port Repair",
    description: "USB-C or Lightning port wear, lint, cable seating, microphone routing, and charge draw checks.",
    href: "/repairs/phone/samsung/galaxy-s22/charging-port-replacement",
    timing: "Inspection confirms scope",
    Icon: PlugZap,
  },
  {
    title: "Back Glass Repair",
    description: "Rear glass, frame condition, camera ring fit, and wireless charging alignment reviewed first.",
    href: "/repairs/phone/iphone/iphone-15/back-glass-replacement",
    timing: "Model-dependent quote",
    Icon: ShieldCheck,
  },
  {
    title: "Camera Repair",
    description: "Front and rear camera focus, lens glass, dust spots, and impact symptoms checked before repair.",
    href: "/repairs/phone/iphone/iphone-13/back-camera-replacement",
    timing: "Function test included",
    Icon: Camera,
  },
  {
    title: "iPad and Tablet Repair",
    description: "Screen, charging, battery, and model-specific tablet repair options from the Ringwood bench.",
    href: "/repairs/tablet/ipad/ipad-9th-generation/screen-replacement",
    timing: "Parts availability checked",
    Icon: TabletSmartphone,
  },
];

const popularModelLinks = [
  { name: "iPhone 15 Pro Max", href: "/repairs/phone/iphone/iphone-15-pro-max", detail: "Screen, battery, camera, back glass" },
  { name: "iPhone 13", href: "/repairs/phone/iphone/iphone-13", detail: "Screen, battery, charging, housing" },
  { name: "Galaxy S24 Ultra", href: "/repairs/phone/samsung/galaxy-s24-ultra", detail: "AMOLED, battery, USB-C, camera" },
  { name: "Galaxy S23 Ultra", href: "/repairs/phone/samsung/galaxy-s23-ultra", detail: "Screen, back housing, charging" },
  { name: "iPad 9th Generation", href: "/repairs/tablet/ipad/ipad-9th-generation", detail: "Glass, display, charging port" },
  { name: "MacBook Pro 13 M1 2020", href: "/repairs/laptop/macbook/macbook-pro-13-m1-2020", detail: "Screen, battery, keyboard checks" },
];

function getNearbyServiceAreas(currentSlug: string) {
  const currentIndex = SERVICE_AREAS.findIndex((area) => area.slug === currentSlug);
  if (currentIndex < 0) return SERVICE_AREAS.filter((area) => area.slug !== currentSlug).slice(0, 6);

  const before = SERVICE_AREAS.slice(Math.max(0, currentIndex - 3), currentIndex);
  const after = SERVICE_AREAS.slice(currentIndex + 1, currentIndex + 4);
  const nearby = [...before, ...after].filter((area) => area.slug !== currentSlug);

  if (nearby.length >= 6) return nearby.slice(0, 6);

  const fill = SERVICE_AREAS.filter(
    (area) => area.slug !== currentSlug && !nearby.some((nearbyArea) => nearbyArea.slug === area.slug)
  );

  return [...nearby, ...fill].slice(0, 6);
}

const suburbTransitGuide: Record<string, string[]> = {
  ringwood: [
    " Walk or catch any local service into Ringwood Station, then continue about 5-10 minutes to Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134.",
    " Drive directly to Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134 on Maroondah Highway and park near the centre entry for Kiosk C1."
  ],
  ringwoodnorth: [
    " Catch a local Ringwood-bound bus from the Warrandyte Road corridor towards Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134.",
    " Drive south via Warrandyte Road into Ringwood, then enter Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134 from the Maroondah Highway side."
  ],
  croydon: [
    " Catch the Lilydale line train towards Flinders Street from Croydon Station and depart at Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134.",
    " Drive west via Maroondah Highway or Mt Dandenong Road into Ringwood, park at Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134, and walk directly to Kiosk C1."
  ],
  boxhill: [
    " Catch the Lilydale or Belgrave line train towards Lilydale/Belgrave from Box Hill Station and depart at Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134.",
    " Drive east along Whitehorse Road and Maroondah Highway directly into the Ringwood Square corridor, then park inside Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134."
  ],
  mitcham: [
    " Catch the Lilydale or Belgrave line train towards Lilydale/Belgrave from Mitcham Station and depart at Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134.",
    " Drive east along Maroondah Highway from Mitcham into Ringwood, turn into Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134, and walk to Kiosk C1."
  ],
  glenwaverley: [
    " Catch Bus 742 from Glen Waverley Station towards Ringwood Station and depart at Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134.",
    " Drive via Springvale Road, Canterbury Road, and Wantirna Road toward Ringwood, then park at Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134."
  ],
  heathmont: [
    " Catch the Belgrave line train towards the City from Heathmont Station and depart at Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134.",
    " Drive north via Canterbury Road and Heathmont Road toward Ringwood, then enter Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134 from the Maroondah Highway side."
  ],
  wantirna: [
    " Catch SmartBus 901 towards Ringwood Station from the Wantirna Road or Canterbury Road corridor and depart at Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134.",
    " Drive north via Wantirna Road or EastLink toward Ringwood, then park at Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134 for direct access to Kiosk C1."
  ],
  doncaster: [
    " Catch SmartBus 907 from Doncaster Road towards Mitcham Station, then transfer to the Lilydale/Belgrave line or SmartBus 901 towards Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134.",
    " Drive via Doncaster Road, Springvale Road, and Maroondah Highway, or use EastLink toward Ringwood, then park at Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134."
  ],
  bayswater: [
    " Catch the Belgrave line train towards the City from Bayswater Station and depart at Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134.",
    " Drive west via Mountain Highway toward Ringwood, continue into the Ringwood Square corridor, and park at Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134."
  ],
  boronia: [
    " Catch the Belgrave line train towards the City from Boronia Station and depart at Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134.",
    " Drive via Boronia Road, Dorset Road, or Mountain Highway toward Ringwood, then use Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134 parking."
  ],
  burwood: [
    " Catch Tram 75 towards Vermont South, then transfer to Bus 742 towards Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134.",
    " Drive east along Burwood Highway, connect through Vermont South and Wantirna Road toward Ringwood, then park at Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134."
  ],
  nunawading: [
    " Catch the Lilydale or Belgrave line train towards Lilydale/Belgrave from Nunawading Station and depart at Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134.",
    " Drive east along Maroondah Highway from Nunawading through Mitcham into Ringwood, then park at Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134."
  ],
  balwyn: [
    " Catch Bus 302 or 304 towards Box Hill, then transfer at Box Hill Station to the Lilydale/Belgrave line towards Ringwood. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134.",
    " Drive east via Whitehorse Road and Maroondah Highway through Box Hill and Mitcham into Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134."
  ],
  vermont: [
    " Catch Bus 742 directly from Vermont towards Ringwood Station and depart at Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134.",
    " Drive east via Canterbury Road, Heatherdale Road, or Wantirna Road toward Ringwood, then park at Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134."
  ],
  ringwoodeast: [
    " Catch the Lilydale line train towards the City from Ringwood East Station and depart at Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134.",
    " Drive west via Dublin Road or Maroondah Highway into Ringwood, then park at Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134."
  ],
  springvale: [
    " Catch SmartBus 902 from Springvale Station towards Nunawading Station, then transfer to the Lilydale/Belgrave line towards Ringwood. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134.",
    " Drive north via Springvale Road and EastLink toward Ringwood, then park at Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134."
  ],
  kilsyth: [
    " Catch Bus 690 towards Croydon Station, then transfer to the Lilydale line towards the City. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134.",
    " Drive west via Mt Dandenong Road and Maroondah Highway into Ringwood, then park at Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134."
  ],
  mooroolbark: [
    " Catch the Lilydale line train towards the City from Mooroolbark Station and depart at Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134.",
    " Drive via Manchester Road, Canterbury Road, or Maroondah Highway toward Ringwood, then park at Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134."
  ],
  clayton: [
    " Catch the Cranbourne/Pakenham line train from Clayton Station to Richmond, then transfer to the Lilydale/Belgrave line towards Ringwood. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134.",
    " Drive via Ferntree Gully Road and EastLink toward Ringwood, then park at Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134."
  ],
  lilydale: [
    " Catch the Lilydale line train towards the City from Lilydale Station and depart at Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134.",
    " Drive west along Maroondah Highway from Lilydale through Chirnside Park and Croydon into Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134."
  ],
  chirnsidepark: [
    " Catch Bus 670 from Chirnside Park Shopping Centre towards Ringwood Station and depart at Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134.",
    " Drive west along Maroondah Highway through Croydon into Ringwood, then park at Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134."
  ],
  ferntreegully: [
    " Catch the Belgrave line train towards the City from Ferntree Gully Station and depart at Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134.",
    " Drive north via Burwood Highway, Dorset Road, or Mountain Highway toward Ringwood, then park at Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134."
  ],
  knoxfield: [
    " Catch SmartBus 901 from the Stud Road or Burwood Highway corridor towards Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134.",
    " Drive north via Stud Road and Boronia Road or use EastLink toward Ringwood, then park at Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134."
  ],
  rowville: [
    " Catch SmartBus 901 from Stud Park Shopping Centre towards Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134.",
    " Drive via Stud Road, Ferntree Gully Road, or EastLink toward Ringwood, then park at Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134."
  ],
  donvale: [
    " Catch SmartBus 902 from the Springvale Road corridor towards Nunawading Station, then transfer to the Lilydale/Belgrave line towards Ringwood. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134.",
    " Drive via Springvale Road and Maroondah Highway or use EastLink toward Ringwood, then park at Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134."
  ],
  parkorchards: [
    " Catch Bus 364 from the Ringwood-Warrandyte Road corridor towards Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134.",
    " Drive south via Park Road or Ringwood-Warrandyte Road into Ringwood, then park at Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134."
  ],
  warrandyte: [
    " Catch Bus 364 from Warrandyte towards Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134.",
    " Drive via Ringwood-Warrandyte Road directly into Ringwood, then park at Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134."
  ],
  blackburn: [
    " Catch the Lilydale or Belgrave line train towards Lilydale/Belgrave from Blackburn Station and depart at Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134.",
    " Drive east along Whitehorse Road and Maroondah Highway through Nunawading and Mitcham into Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134."
  ],
  warranwood: [
    " Catch a Ringwood-bound local bus from the Wonga Road or Ringwood-Warrandyte Road corridor towards Ringwood Station. After getting off, walk about 5-10 minutes to Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134.",
    " Drive south along Wonga Road, connect through Ringwood North, and park at Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134."
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
  const routeDestination = "Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134";
  const encodedOrigin = encodeURIComponent(routeOrigin);
  const encodedDestination = encodeURIComponent(routeDestination);
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const transitMapSrc = googleMapsApiKey
    ? `https://www.google.com/maps/embed/v1/directions?key=${googleMapsApiKey}&origin=${encodedOrigin}&destination=${encodedDestination}&mode=transit`
    : `https://www.google.com/maps?output=embed&saddr=${encodedOrigin}&daddr=${encodedDestination}&dirflg=r`;
  const directionsHref = `https://www.google.com/maps/dir/?api=1&origin=${encodedOrigin}&destination=${encodedDestination}`;
  const nearbyAreas = getNearbyServiceAreas(area.slug);
  const locationTrustPoints = [
    {
      title: `Short trip from ${area.name}`,
      description: area.driveTime === "Local store"
        ? "Visit us directly inside Ringwood Square Shopping Centre at Kiosk C1."
        : `${area.route} Most customers use the visit to confirm the fault, quote, and parts path in one stop.`,
    },
    {
      title: "Quote before repair",
      description: "We inspect the device first, explain the likely repair path, and confirm pricing before starting work.",
    },
    {
      title: "Warranty-backed repairs",
      description: "Standard repairs include warranty support on parts and labour, with practical checks before handover.",
    },
    {
      title: "Walk-ins and bookings",
      description: "Walk-ins are welcome, and online bookings help us prepare parts and timing before you arrive.",
    },
    {
      title: "No Fix No Charge guidance",
      description: "Eligible diagnostic jobs are handled with clear expectations when the device cannot be repaired as quoted.",
    },
    {
      title: "One Ringwood repair bench",
      description: "Customers from nearby suburbs get the same Ringwood pricing, quoting process, and repair desk support.",
    },
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
      streetAddress: "Ringwood Square Shopping Centre Kiosk C1, Seymour St",
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
      <LocationAnalyticsTracker suburb={area.name} />
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

        <section className="location-trust-panel" aria-labelledby="location-trust-heading">
          <div className="location-section-heading">
            <span className="location-kicker location-kicker-muted">Local repair support</span>
            <h2 id="location-trust-heading">Why {area.name} residents choose our Ringwood repair desk</h2>
            <p>
              We keep the visit practical: check the model, confirm the fault, explain parts availability,
              and quote before repair. That matters when you are travelling from {area.name}.
            </p>
          </div>
          <div className="location-reason-grid">
            {locationTrustPoints.map((item) => (
              <div key={item.title} className="location-reason-item">
                <CheckCircle2 size={18} strokeWidth={2.7} aria-hidden="true" />
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
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

        <section className="location-repair-section" aria-labelledby="location-popular-repairs-heading">
          <div className="location-section-heading">
            <span className="location-kicker location-kicker-muted">Popular repair paths</span>
            <h2 id="location-popular-repairs-heading">Common repairs customers ask about near {area.name}</h2>
            <p>
              These are the repair categories customers often check before visiting from {area.name}.
              Each page explains symptoms, quote context, and booking options.
            </p>
          </div>
          <div className="location-popular-grid">
            {popularRepairLinks.map(({ title, description, href, timing, Icon }) => (
              <Link key={title} href={href} className="location-popular-card">
                <Icon size={21} strokeWidth={2.5} aria-hidden="true" />
                <strong>{title}</strong>
                <span>{description}</span>
                <small>
                  {timing}
                  <ArrowRight size={14} strokeWidth={2.7} aria-hidden="true" />
                </small>
              </Link>
            ))}
          </div>
        </section>

        <section className="location-model-section" aria-labelledby="location-models-heading">
          <div className="location-section-heading">
            <span className="location-kicker location-kicker-muted">Model shortcuts</span>
            <h2 id="location-models-heading">Popular device models we repair for {area.name} customers</h2>
            <p>
              Start with a model page if you want the most relevant repair types, pricing context,
              and booking options before travelling to Ringwood Square.
            </p>
          </div>
          <div className="location-model-grid">
            {popularModelLinks.map((model) => (
              <Link key={model.href} href={model.href} className="location-model-card">
                <strong>{model.name}</strong>
                <span>{model.detail}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="location-content-grid" aria-label={`Common repair pages for ${area.name} customers`}>
          <article className="location-story-card">
            <span className="location-kicker location-kicker-muted">Common repair pages</span>
            <h2>Popular repairs customers ask about near {area.name}</h2>
            <p>
              Customers often ask about these repair pages before they visit. You can check symptoms,
              quote context, and booking details on each model-specific page.
            </p>
            <div className="location-transit-guide">
              <ul>
                <li>
                  <Link href="/repairs/phone/iphone/iphone-15-pro-max/screen-replacement">
                    iPhone 15 Pro Max screen replacement
                  </Link>
                </li>
                <li>
                  <Link href="/repairs/phone/samsung/galaxy-s24-ultra/screen-replacement">
                    Galaxy S24 Ultra screen replacement
                  </Link>
                </li>
                <li>
                  <Link href="/repairs/tablet/ipad/ipad-9th-generation/screen-replacement">
                    iPad 9th Generation screen replacement
                  </Link>
                </li>
              </ul>
            </div>
          </article>
        </section>

        <section className="location-nearby-section" aria-labelledby="location-nearby-heading">
          <div className="location-section-heading">
            <span className="location-kicker location-kicker-muted">Nearby areas</span>
            <h2 id="location-nearby-heading">Nearby suburbs we also serve</h2>
            <p>
              Customers visit our Ringwood Square repair bench from surrounding suburbs for the same
              quote-first repair process and clear route information.
            </p>
          </div>
          <div className="location-nearby-grid">
            {nearbyAreas.map((nearbyArea) => (
              <Link key={nearbyArea.slug} href={`/locations/${nearbyArea.slug}`} className="location-nearby-link">
                <span>{nearbyArea.name}</span>
                <small>{nearbyArea.driveTime}</small>
              </Link>
            ))}
          </div>
        </section>

        <section className="location-faq-section" aria-labelledby="location-faq-heading">
          <div className="location-section-heading">
            <span className="location-kicker location-kicker-muted">Local questions</span>
            <h2 id="location-faq-heading">Frequently asked questions for {area.name} customers</h2>
          </div>
          <div className="location-faq-list">
            <details>
              <summary>Do you service customers from {area.name}?</summary>
              <p>
                Yes. We regularly help customers travelling from {area.name} to Ringwood Square
                for phone, tablet, laptop, and watch repair assessment.
              </p>
            </details>
            <details>
              <summary>How far is Ali Mobile & Repair from {area.name}?</summary>
              <p>
                The typical trip is {area.driveTime.toLowerCase()}. {area.route} You can call first
                if you want us to check parts or likely timing before you leave.
              </p>
            </details>
            <details>
              <summary>Do I need an appointment before coming in?</summary>
              <p>
                Walk-ins are welcome. Booking online can help us prepare the right model notes and
                gives your visit clearer priority at the repair desk.
              </p>
            </details>
            <details>
              <summary>Can I get a quote before repair starts?</summary>
              <p>
                Yes. We inspect the device, explain the likely cause, and confirm the repair scope
                and quote before starting paid repair work.
              </p>
            </details>
            <details>
              <summary>How long does a common repair usually take?</summary>
              <p>
                Many common repairs can be completed in around 15 minutes, especially straightforward
                screen or battery jobs. Final timing depends on the device model, repair type, parts
                availability, and what we find during inspection.
              </p>
            </details>
            <details>
              <summary>Should I call before travelling from {area.name}?</summary>
              <p>
                It is a good idea if you know your model or symptom. We can check likely parts,
                quote range, and timing before you make the {area.driveTime.toLowerCase()} trip.
              </p>
            </details>
            <details>
              <summary>Do you repair iPhone, Samsung, iPad, MacBook, and Apple Watch devices?</summary>
              <p>
                Yes. We handle phone, tablet, laptop, and watch repair enquiries at Ringwood Square,
                including common screen, battery, charging, camera, and diagnostic repair paths.
              </p>
            </details>
            <details>
              <summary>Will you check parts availability before I arrive?</summary>
              <p>
                Yes. If you call with the model and issue, we can check whether the likely part is
                available or whether a booking is the better option.
              </p>
            </details>
            <details>
              <summary>Can you inspect water damage or no-power faults?</summary>
              <p>
                Yes. We can inspect water damage, no-power faults, charging issues, and board-level
                symptoms. These jobs need assessment first because the safest repair path depends on
                what is damaged internally.
              </p>
            </details>
            <details>
              <summary>Do customers from {area.name} pay different prices?</summary>
              <p>
                No. Customers from {area.name} receive the same Ringwood repair desk pricing and quote
                process. We confirm the final price after checking the device and repair scope.
              </p>
            </details>
            <details>
              <summary>What are your opening hours?</summary>
              <p>
                We are open from 10am to 5pm, Monday to Saturday. If you are travelling from {area.name},
                you can call ahead to check timing, parts availability, or whether booking is recommended.
              </p>
            </details>
          </div>
        </section>

        <section className="location-final-cta">
          <div>
            <span className="location-kicker location-kicker-muted">Before you drive</span>
            <h2>Device repair near {area.name}, handled from Ringwood Square</h2>
            <p>
              Tell us your device model and symptom before you leave {area.name}. We can check the
              likely repair path, parts availability, and whether booking or walking in makes more sense.
            </p>
          </div>
          <div className="location-final-actions">
            <a href="tel:0481058514" className="repair-primary-action">
              <PhoneCall size={18} strokeWidth={2.7} aria-hidden="true" />
              0481 058 514
            </a>
            <a href={directionsHref} className="repair-secondary-action" target="_blank" rel="noopener noreferrer">
              <Navigation size={18} strokeWidth={2.7} aria-hidden="true" />
              Get Directions
            </a>
          </div>
        </section>
      </main>
    </>
  );
}

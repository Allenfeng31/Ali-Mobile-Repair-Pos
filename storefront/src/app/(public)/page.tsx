import Link from "next/link";
import dynamic from "next/dynamic";
import { LocalBusinessSchema } from "@/components/seo/SchemaOrg";

const ReviewsSection = dynamic(() => import("@/components/ReviewsSection"));
const HomeFAQ = dynamic(() => import("@/components/HomeFAQ"));
const ServiceAreas = dynamic(() => import("@/components/seo/ServiceAreas"));

export default function Home() {
  return (
    <main>
      <LocalBusinessSchema />
      <header className="w-full bg-white px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center w-full max-w-5xl mx-auto pt-16 pb-12">
          <div className="h-32 md:h-40" aria-hidden="true" />

          <h1 className="text-[3.5rem] md:text-[6rem] font-black tracking-tighter leading-[1.05] text-slate-950">
            Expert Mobile Phone &amp; Tablet Repair
            <span className="block mt-2 text-[2rem] md:text-[3.5rem] font-extrabold text-slate-500 tracking-tight">
              in Ringwood Square
            </span>
          </h1>

          <div className="flex flex-wrap justify-center items-center gap-3 mb-12 w-full mt-12">
            <div className="px-4 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 whitespace-nowrap">
              No Fix, No Charge
            </div>
            <div className="px-4 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 whitespace-nowrap">
              6-Month Warranty on All Repairs
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 w-full mb-8">
            <Link href="/book-repair" className="px-12 py-5 bg-blue-600 hover:bg-blue-700 text-white text-xl font-extrabold rounded-full shadow-lg transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98] tracking-wide">
              Book Repair Now
            </Link>
            <Link href="/track-status" className="px-12 py-5 bg-white border-2 border-slate-200 text-slate-800 text-xl font-bold rounded-full hover:border-slate-300 hover:bg-slate-50 transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] tracking-wide">
              Track Status
            </Link>
          </div>
        </div>
      </header>

      <section className="servicesGrid" aria-labelledby="services-heading">
        <h2 className="sr-only" id="services-heading">Our Repair Services</h2>
        <Link href="/repairs/phone" className="serviceCard">
          <div className="card-bg" style={{ backgroundImage: "url('/images/services/phone-repair.jpg')" }} />
          <div className="card-gradient" />
          <div className="card-content">
            <h3>Phone Repair</h3>
            <p>Broken screen? Battery draining fast? We fix all brands including iPhone, Samsung, Oppo & Pixel.</p>
            <span className="card-link">View Pricing →</span>
          </div>
        </Link>
        <Link href="/repairs/tablet" className="serviceCard">
          <div className="card-bg" style={{ backgroundImage: "url('/images/services/tablet-repair.jpg')" }} />
          <div className="card-gradient" />
          <div className="card-content">
            <h3>Tablet & iPad Repair</h3>
            <p>Fast, reliable repairs for all iPad and Samsung tablet models. Most fixed in under 1 hour.</p>
            <span className="card-link">View Pricing →</span>
          </div>
        </Link>
        <Link href="/repairs/laptop" className="serviceCard">
          <div className="card-bg" style={{ backgroundImage: "url('/images/services/laptop-repair.jpg')" }} />
          <div className="card-gradient" />
          <div className="card-content">
            <h3>Laptop & MacBook Repair</h3>
            <p>Screen, battery, and logic board repairs for all MacBook and laptop models.</p>
            <span className="card-link">View Pricing →</span>
          </div>
        </Link>
        <Link href="/repairs/watch" className="serviceCard">
          <div className="card-bg" style={{ backgroundImage: "url('/images/services/watch-repair.jpg')" }} />
          <div className="card-gradient" />
          <div className="card-content">
            <h3>Smart Watch Repair</h3>
            <p>Apple Watch screen and battery repairs. Professional service for all series.</p>
            <span className="card-link">View Pricing →</span>
          </div>
        </Link>
      </section>


      <ReviewsSection />
      
      <HomeFAQ />

      <ServiceAreas />

      <section className="map-section">
        <h2>Visit Us in Melbourne</h2>
        <div className="map-wrapper">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6303.831349042814!2d145.222375!3d-37.8154441!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad63bd4323d01bd%3A0x1b936dbf4a8db011!2sAli%20Mobile%20%26%20Repair!5e0!3m2!1sen!2sau!4v1775003205754!5m2!1sen!2sau" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={false} 
            loading="lazy" 
            title="Ali Mobile Repair Location - Ringwood Melbourne"
          ></iframe>
        </div>
      </section>

    </main>
  );
}

import LiveQuoteCalculator from "@/components/LiveQuoteCalculator";
import Script from "next/script";

export const metadata = {
  title: "Book Repair | Ali Mobile Repair Melbourne",
  description: "Book an appointment to repair your phone, tablet, or computer at Ali Mobile Repair in Ringwood, Melbourne.",
};

export default function BookRepairPage() {
  return (
    <>
      <Script
        id="schema-booking"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Book a Repair",
            "description": "Book a phone, tablet, or computer repair at Ali Mobile Repair.",
          })
        }}
      />
      <div style={{ paddingTop: '100px', minHeight: '80vh' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>Book Your Repair</h1>
        <p style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 2rem', opacity: 0.8 }}>
          Get a real-time quote and schedule your repair with our experts. Walk-ins are also welcome!
        </p>

        {/* Live price quote from backend */}
        <LiveQuoteCalculator />

        {/* Booking form */}
        <div className="form-container" style={{ marginTop: '2rem' }}>
          <h2 style={{ marginBottom: "1.5rem", textAlign: "center" }}>Schedule Drop-off</h2>
          <form action="/api/appointments" method="POST">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="name" className="form-control" placeholder="John Smith" required />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" name="phone" className="form-control" placeholder="04xx xxx xxx" required />
            </div>
            <div className="form-group">
              <label>Preferred Date &amp; Time</label>
              <input type="datetime-local" name="datetime" className="form-control" required />
            </div>
            <div className="form-group">
              <label>Device / Issue (optional)</label>
              <textarea
                name="notes"
                className="form-control"
                placeholder="e.g. iPhone 15 Pro cracked screen, Samsung Galaxy S24 battery replacement..."
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>
            <button type="submit" className="primary-btn" style={{ width: "100%", marginTop: "1rem" }}>
              Confirm Booking
            </button>
            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', opacity: 0.6 }}>
              We&apos;ll confirm your appointment via SMS. No fix, no charge.
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

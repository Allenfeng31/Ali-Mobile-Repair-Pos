import LiveQuoteCalculator from "@/components/LiveQuoteCalculator";
import Script from "next/script";

export const metadata = {
  title: "Book Repair | Ali Mobile Repair Melbourne",
  description: "Book an appointment to repair your phone, tablet, or drone at Ali Mobile Repair in Ringwood, Melbourne.",
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
            "description": "Book a phone, tablet, or drone repair at Ali Mobile Repair.",
          })
        }}
      />
      <div style={{ paddingTop: '100px', minHeight: '80vh' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>Book Your Repair</h1>
        <p style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 2rem', opacity: 0.8 }}>
          Get a real-time quote and schedule your repair with our experts. Walk-ins are also welcome!
        </p>
        
        <LiveQuoteCalculator />
        
        {/* Full Booking Form can go here, POSTing to /api/proxy/appointments */}
        <div className="form-container" style={{ marginTop: '2rem' }}>
          <h2 style={{ marginBottom: "1.5rem", textAlign: "center" }}>Schedule Drop-off</h2>
          <form action="/api/proxy/appointments" method="POST">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" className="form-control" placeholder="John Doe" required />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" className="form-control" placeholder="04xx xxx xxx" required />
            </div>
            <div className="form-group">
              <label>Preferred Date & Time</label>
              <input type="datetime-local" className="form-control" required />
            </div>
            <button type="submit" className="primary-btn" style={{ width: "100%", marginTop: "1rem" }}>
              Confirm Booking
            </button>
            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', opacity: 0.6 }}>
              Data will be securely sent to our internal POS system.
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

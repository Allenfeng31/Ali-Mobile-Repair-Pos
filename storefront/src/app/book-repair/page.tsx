"use client";

import { useState } from "react";
import LiveQuoteCalculator from "@/components/LiveQuoteCalculator";
import Script from "next/script";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateICS(booking: any) {
  const { name, brand, model, service, datetime } = booking;
  const start = new Date(datetime);
  const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration

  const formatDate = (date: Date) => 
    date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ali Mobile Repair//Booking System//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@alimobile.com.au`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(start)}`,
    `DTEND:${formatDate(end)}`,
    `SUMMARY:Repair Appointment: ${brand} ${model} - ${service}`,
    `DESCRIPTION:Repair for ${name}\\nService: ${service}\\nDevice: ${brand} ${model}\\n\\nAli Mobile Repair Ringwood`,
    "LOCATION:Kiosk C1, Ringwood Square Shopping Centre, Ringwood VIC 3134",
    "END:VEVENT",
    "END:VCALENDAR"
  ];

  const blob = new Blob([icsLines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute("download", `Repair_Appointment_${brand}_${model}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ─── Components ───────────────────────────────────────────────────────────────

function SuccessView({ booking, onReset }: { booking: any; onReset: () => void }) {
  return (
    <div className="form-container" style={{ textAlign: "center", padding: "3rem 2rem", animation: "fadeIn 0.5s ease" }}>
      <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>🎉</div>
      <h1 style={{ marginBottom: "1rem" }}>Booking Confirmed!</h1>
      <p style={{ opacity: 0.8, marginBottom: "2rem" }}>
        Thank you, <strong>{booking.name}</strong>. We've received your request for <strong>{booking.brand} {booking.model}</strong>.
      </p>

      <div style={{ 
        background: "rgba(255,255,255,0.05)", 
        borderRadius: "16px", 
        padding: "1.5rem", 
        textAlign: "left",
        marginBottom: "2rem",
        border: "1px solid rgba(255,255,255,0.1)"
      }}>
        <h3 style={{ fontSize: "1rem", marginBottom: "1rem", color: "var(--primary)" }}>Appointment Details</h3>
        <p style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>📅 <strong>Time:</strong> {booking.displayDate}</p>
        <p style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>🔧 <strong>Service:</strong> {booking.service}</p>
        <p style={{ fontSize: "0.9rem" }}>📍 <strong>Location:</strong> Kiosk C1, Ringwood Square Shopping Centre</p>
      </div>

      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
        <button 
          onClick={() => generateICS(booking)} 
          className="primary-btn"
          style={{ padding: "0.8rem 1.5rem" }}
        >
          📅 Add to Calendar
        </button>
        <button 
          onClick={onReset} 
          className="secondary-btn"
          style={{ padding: "0.8rem 1.5rem" }}
        >
          Book Another Repair
        </button>
      </div>

      <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <h4 style={{ marginBottom: "0.5rem" }}>Ali Mobile Repair Ringwood</h4>
        <p style={{ fontSize: "0.85rem", opacity: 0.6 }}>📞 0481 058 514</p>
        <p style={{ fontSize: "0.85rem", opacity: 0.6 }}>✉️ alimobileshop32@gmail.com</p>
      </div>
    </div>
  );
}

export default function BookRepairPage() {
  const [selection, setSelection] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", phone: "", datetime: "", notes: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBooking, setSuccessBooking] = useState<any>(null);
  
  // Date/Time Selection
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");

  const TIME_SLOTS = [
    "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selection) return alert("Please select a device and service first!");
    if (!selectedDay || !selectedSlot) return alert("Please choose a date and time!");
    
    setIsSubmitting(true);
    try {
      // Create a date object in local time
      const datetime = `${selectedDay}T${selectedSlot}:00`;
      const dateObj = new Date(datetime);
      
      // Format as DD/MM/YYYY HH:mm for display
      const displayDate = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()} ${selectedSlot}`;
      
      const payload = {
        customer_name: formData.name,
        phone: formData.phone,
        brand: selection.brand,
        model: selection.model,
        service: selection.service,
        datetime: dateObj.toISOString(),
        displayDate: displayDate,
        notes: formData.notes,
        session_token: typeof window !== 'undefined' ? localStorage.getItem('chat_session_token') : null 
      };

      const res = await fetch("/api/proxy/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to book");
      
      setSuccessBooking({
        ...payload,
        name: formData.name
      });
    } catch (err) {
      alert("Something went wrong. Please try again or call us.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successBooking) {
    return <SuccessView booking={successBooking} onReset={() => setSuccessBooking(null)} />;
  }

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
      
      <div style={{ paddingTop: '100px', paddingBottom: '100px', minHeight: '80vh' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>Book Your Repair</h1>
        <p style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 2rem', opacity: 0.8 }}>
          Get a real-time quote and schedule your repair with our experts. Walk-ins are also welcome!
        </p>

        {/* 1. Selection Step */}
        <LiveQuoteCalculator onSelectionChange={setSelection} />

        {/* 2. Action Step */}
        <div className={`form-container ${!selection ? 'opacity-40 pointer-events-none' : ''}`} style={{ marginTop: '2rem', transition: 'all 0.3s ease' }}>
          <h2 style={{ marginBottom: "1.5rem", textAlign: "center" }}>Schedule Your Visit</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="John Smith" 
                required 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input 
                type="tel" 
                className="form-control" 
                placeholder="04xx xxx xxx" 
                required 
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>1. Select Date</label>
              <div style={{ 
                display: "flex", 
                gap: "0.6rem", 
                overflowX: "auto", 
                padding: "0.5rem 0",
                msOverflowStyle: "none",
                scrollbarWidth: "none"
              }} className="no-scrollbar">
                {Array.from({ length: 14 }).map((_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() + i);
                  const isSunday = d.getDay() === 0;
                  const dayStr = d.toISOString().split('T')[0];
                  const isSelected = selectedDay === dayStr;
                  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                  const dateNum = d.getDate();
                  const monthName = d.toLocaleDateString('en-US', { month: 'short' });

                  return (
                    <button
                      key={dayStr}
                      type="button"
                      disabled={isSunday}
                      onClick={() => { setSelectedDay(dayStr); setSelectedSlot(""); }}
                      style={{
                        flex: "0 0 70px",
                        padding: "0.8rem 0.5rem",
                        borderRadius: "12px",
                        border: isSelected ? "2px solid var(--primary)" : "1px solid var(--layer-border)",
                        background: isSunday ? "transparent" : (isSelected ? "var(--primary)" : "var(--layer)"),
                        color: isSelected ? "white" : "var(--foreground)",
                        textAlign: "center",
                        cursor: isSunday ? "not-allowed" : "pointer",
                        transition: "all 0.2s ease",
                        opacity: isSunday ? 0.3 : 1
                      }}
                    >
                      <div style={{ fontSize: "0.7rem", opacity: isSunday ? 0.3 : 0.6, textTransform: "uppercase" }}>{dayName}</div>
                      <div style={{ fontSize: "1.2rem", fontWeight: 700, margin: "0.2rem 0" }}>{dateNum}</div>
                      <div style={{ fontSize: "0.7rem", opacity: isSunday ? 0.3 : 0.6 }}>{monthName}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDay && (
              <div className="form-group" style={{ animation: "fadeIn 0.3s ease" }}>
                <label>2. Select Time ({new Date(selectedDay).toLocaleDateString('en-US', { day: 'numeric', month: 'long' })})</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: "0.6rem", marginTop: "0.8rem" }}>
                  {TIME_SLOTS.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      style={{
                        padding: "0.7rem",
                        borderRadius: "10px",
                        border: selectedSlot === slot ? "2px solid var(--primary)" : "1px solid var(--layer-border)",
                        background: selectedSlot === slot ? "var(--primary)" : "var(--layer)",
                        color: selectedSlot === slot ? "white" : "var(--foreground)",
                        fontSize: "0.91rem",
                        fontWeight: selectedSlot === slot ? 700 : 500,
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="form-group">
              <label>Device / Issue (Confirmation)</label>
              <div 
                className="form-control" 
                style={{ background: "var(--layer)", height: "auto", minHeight: "2.8rem", color: "var(--primary)", fontWeight: 700, border: "1px solid var(--layer-border)" }}
              >
                {selection ? `${selection.brand} ${selection.model} - ${selection.service}` : "Please select above..."}
              </div>
            </div>
            <div className="form-group">
              <label>Additional Notes (optional)</label>
              <textarea
                className="form-control"
                placeholder="Anything else we should know?"
                rows={2}
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                style={{ resize: 'vertical' }}
              />
            </div>
            <button 
              type="submit" 
              className="primary-btn" 
              style={{ width: "100%", marginTop: "1rem" }}
              disabled={isSubmitting || !selection}
            >
              {isSubmitting ? "Processing..." : "Confirm Booking"}
            </button>
            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', opacity: 0.6 }}>
              We'll confirm your appointment via internal system. No fix, no charge.
            </p>
          </form>
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}

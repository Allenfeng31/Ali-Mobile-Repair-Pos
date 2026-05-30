"use client";

import { useCallback, useEffect, useState } from "react";
import GlobalRepairCart from "@/components/GlobalRepairCart";
import { useCart } from "@/context/CartContext";
import { formatDeviceTitle } from "@/lib/inventoryUtils";
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CalendarPlus,
  CheckCircle2,
  Clock3,
  Info,
  MapPin,
  PhoneCall,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";

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
    `SUMMARY:Repair Appointment: ${formatDeviceTitle(brand, model)} - ${service}`,
    `DESCRIPTION:Repair for ${name}\\nService: ${service}\\nDevice: ${formatDeviceTitle(brand, model)}\\n\\nAli Mobile Repair Ringwood`,
    "LOCATION:Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134",
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
    <div className="booking-page-shell booking-success-shell">
      <section className="booking-success-card">
        <div className="booking-success-icon">
          <CheckCircle2 size={40} strokeWidth={2.4} aria-hidden="true" />
        </div>
        <span className="booking-kicker">Appointment received</span>
        <h1>Booking Confirmed</h1>
        <p>
          Thank you, <strong>{booking.name}</strong>. We have received your request for{" "}
          <strong>{formatDeviceTitle(booking.brand, booking.model)}</strong> and will prepare the repair desk for your visit.
        </p>

        <div className="booking-success-grid">
          <div className="booking-confirmation-item">
            <Clock3 size={18} strokeWidth={2.4} aria-hidden="true" />
            <span>Appointment time</span>
            <strong>{booking.displayDate}</strong>
          </div>
          <div className="booking-confirmation-item">
            <Wrench size={18} strokeWidth={2.4} aria-hidden="true" />
            <span>Repair request</span>
            <strong>{booking.service}</strong>
          </div>
          <div className="booking-confirmation-item">
            <MapPin size={18} strokeWidth={2.4} aria-hidden="true" />
            <span>Store location</span>
            <strong>Ringwood Square Shopping Centre Kiosk C1, Seymour St, Ringwood VIC 3134</strong>
          </div>
        </div>

        <div className="booking-next-steps">
          <h2>Before you arrive</h2>
          <ul>
            <li>Bring the device and passcode if a test after repair is needed.</li>
            <li>No upfront payment is required. You pay in store after the repair path is confirmed.</li>
            <li>If parts need ordering, our team will contact you before your visit.</li>
          </ul>
        </div>

        <div className="booking-success-actions">
          <button
            onClick={() => generateICS(booking)}
            className="booking-primary-action"
          >
            <CalendarPlus size={17} strokeWidth={2.5} aria-hidden="true" />
            Add to Calendar
          </button>
          <button
            onClick={onReset}
            className="booking-secondary-action"
          >
            <RotateCcw size={17} strokeWidth={2.5} aria-hidden="true" />
            Book Another Repair
          </button>
        </div>

        <div className="booking-success-contact">
          <strong>Ali Mobile & Repair Ringwood</strong>
          <a href="tel:0481058514">
            <PhoneCall size={15} strokeWidth={2.4} aria-hidden="true" />
            0481 058 514
          </a>
          <span>alimobileshop32@gmail.com</span>
        </div>
      </section>
    </div>
  );
}

export default function BookRepairPage() {
  const {
    devices,
    totalPrice,
    subtotalPrice,
    discountRate,
    discountAmount,
    qualifyingRepairItemCount,
    hasConfirmedDevices,
    hasCustomQuote,
    clearCart,
  } = useCart();
  const confirmedDevices = devices.filter(d => d.isConfirmed);
  const [formData, setFormData] = useState({ name: "", phone: "", notes: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBooking, setSuccessBooking] = useState<any>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  // Date/Time Selection
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");

  const TIME_SLOTS = [
    "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"
  ];

  // ── VIC Public Holidays 2026/2027 ─────────────────────────────────────────
  const VIC_PUBLIC_HOLIDAYS = [
    // 2026
    "2026-01-01", "2026-01-26", "2026-03-09", "2026-04-03", "2026-04-04",
    "2026-04-05", "2026-04-06", "2026-04-25", "2026-06-08", "2026-09-25",
    "2026-11-03", "2026-12-25", "2026-12-26", "2026-12-28",
    // 2027
    "2027-01-01", "2027-01-26", "2027-03-08", "2027-03-26", "2027-03-27",
    "2027-03-28", "2027-03-29", "2027-04-26", "2027-06-14", "2027-10-01",
    "2027-11-02", "2027-12-25", "2027-12-27", "2027-12-28"
  ];

  const resetBookingFlow = useCallback(() => {
    setSuccessBooking(null);
    setShowDisclaimer(false);
    setSelectedDay("");
    setSelectedSlot("");
    setIsSubmitting(false);
    setFormData({ name: "", phone: "", notes: "" });
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    if (!successBooking) return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [successBooking]);

  useEffect(() => {
    const handleBookRepairLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href) return;

      const path = href.startsWith("http")
        ? new URL(href, window.location.origin).pathname
        : href.split("?")[0];

      if (path !== "/book-repair" || !successBooking) return;

      event.preventDefault();
      resetBookingFlow();
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };

    document.addEventListener("click", handleBookRepairLinkClick, true);
    return () => document.removeEventListener("click", handleBookRepairLinkClick, true);
  }, [resetBookingFlow, successBooking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasConfirmedDevices) return alert("Your cart is empty! Please select a device and service first, and click 'Confirm'.");
    if (!selectedDay || !selectedSlot) return alert("Please choose a date and time!");
    setShowDisclaimer(true);
  };

  const handleFinalSubmit = async () => {
    setShowDisclaimer(false);
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
        devices: confirmedDevices.map(d => ({
          brand: d.brand,
          model: d.model,
          category: d.category,
          services: d.services
        })),
        total: totalPrice,
        hasCustomQuote,
        pricing: {
          subtotal: subtotalPrice,
          discountRate,
          discountAmount,
          qualifyingRepairItemCount,
          total: totalPrice,
        },
        datetime: dateObj.toISOString(),
        displayDate: displayDate,
        notes: formData.notes,
        session_token: typeof window !== 'undefined' ? localStorage.getItem('chat_session_token') : null
      };

      const res = await fetch("/api/proxy/book-repair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to book");

      setSuccessBooking({
        ...payload,
        name: formData.name,
        // Legacy fields for SuccessView compatibility
        brand: confirmedDevices[0].brand,
        model: confirmedDevices[0].model,
        service: confirmedDevices.length > 1 ? `${confirmedDevices[0].services[0]?.name || 'Repair'} + more` : (confirmedDevices[0].services[0]?.name || 'Repair')
      });
      clearCart();
    } catch (err) {
      alert("Something went wrong. Please try again or call us.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successBooking) {
    return <SuccessView booking={successBooking} onReset={resetBookingFlow} />;
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

      <div className="booking-page-shell">
        <section className="booking-hero-panel">
          <div className="booking-hero-copy">
            <span className="booking-kicker">
              <Sparkles size={15} strokeWidth={2.5} aria-hidden="true" />
              Quick repair booking
            </span>
            <h1>Book your repair in minutes.</h1>
            <p>
              Choose the repair, add your details, and pick a visit time. Clear pricing, short form, and payment only in store.
            </p>
            <div className="booking-trust-row" aria-label="Booking trust points">
              <span>
                <ShieldCheck size={16} strokeWidth={2.5} aria-hidden="true" />
                No Fix, No Charge
              </span>
              <span>
                <Clock3 size={16} strokeWidth={2.5} aria-hidden="true" />
                Fast booking flow
              </span>
              <span>
                <PhoneCall size={16} strokeWidth={2.5} aria-hidden="true" />
                0481 058 514
              </span>
            </div>
          </div>
          <aside className="booking-hero-cart" aria-label="Repair cart">
            <GlobalRepairCart />
          </aside>
        </section>

        <section className="booking-workspace" aria-label="Repair booking form">
          <div className={`booking-panel ${!hasConfirmedDevices ? 'booking-panel-disabled' : ''}`}>
            <div className="booking-panel-header">
              <span className="booking-kicker">Schedule</span>
              <h2>Schedule Your Visit</h2>
              <p>Once your repair cart is confirmed, add your contact details and select the best time to visit.</p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="booking-field-grid form-group">
                <div>
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
                <div>
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
              </div>
              <div className="form-group">
                <label>1. Select Date</label>
                <div className="booking-date-strip no-scrollbar">
                  {Array.from({ length: 14 }).map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() + i);
                    const isSunday = d.getDay() === 0;
                    const dayStr = d.toISOString().split('T')[0];
                    const isHoliday = VIC_PUBLIC_HOLIDAYS.includes(dayStr);
                    const isDisabled = isSunday || isHoliday;

                    const isSelected = selectedDay === dayStr;
                    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                    const dateNum = d.getDate();
                    const monthName = d.toLocaleDateString('en-US', { month: 'short' });

                    return (
                      <button
                        key={dayStr}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => { setSelectedDay(dayStr); setSelectedSlot(""); }}
                        className={`booking-date-card ${isSelected ? "is-selected" : ""} ${isDisabled ? "is-disabled" : ""}`}
                        aria-pressed={isSelected}
                      >
                        <span>{dayName}</span>
                        <strong>{dateNum}</strong>
                        <small>{isHoliday ? "Holiday" : monthName}</small>
                      </button>
                    );
                  })}
                </div>
              </div>

            {selectedDay && (
              <div className="form-group booking-time-group">
                <label>2. Select Time ({new Date(selectedDay).toLocaleDateString('en-US', { day: 'numeric', month: 'long' })})</label>
                <div className="booking-time-grid">
                  {TIME_SLOTS.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`booking-time-slot ${selectedSlot === slot ? "is-selected" : ""}`}
                      aria-pressed={selectedSlot === slot}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="form-group">
              <label>Confirmation - Estimated Cost (Pay In-Store)</label>
              <div className="booking-summary-box">
                {confirmedDevices.length > 0 ? (
                  <div>
                    {confirmedDevices.map((d, i) => (
                      <div key={i} className="booking-summary-line">
                        <strong>{formatDeviceTitle(d.brand, d.model)}</strong>: {d.services.map(s => s.name).join(', ')}
                      </div>
                    ))}
                    <div className="booking-total-row">
                      <span>Estimated Total</span>
                      <strong>
                        {totalPrice > 0 ? (
                          discountRate > 0 ? (
                            <span className="booking-discount-total">
                              <small className="booking-original-total">${subtotalPrice.toFixed(2)}</small>
                              <small className="booking-discount-chip">-{Math.round(discountRate * 100)}% Multi-Device</small>
                              <span>${totalPrice.toFixed(2)}</span>
                              {hasCustomQuote && <small> + Custom Quote</small>}
                            </span>
                          ) : (
                            <>
                              ${totalPrice.toFixed(2)}
                              {hasCustomQuote && <small> + Custom Quote</small>}
                            </>
                          )
                        ) : (
                          hasCustomQuote ? "Custom Quote" : "$0.00"
                        )}
                      </strong>
                    </div>
                    {discountRate > 0 && (
                      <div className="booking-discount-note">
                        Multi-device saving: -${discountAmount.toFixed(2)} across {qualifyingRepairItemCount} repair items.
                      </div>
                    )}
                    <p>
                      <Info size={15} strokeWidth={2.4} aria-hidden="true" />
                      No upfront payment required. You only pay in store after your device is successfully repaired.
                    </p>
                  </div>
                ) : "No items in cart..."}
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
                />
              </div>
              <button
                type="submit"
                className="booking-submit-button"
                disabled={isSubmitting || !hasConfirmedDevices}
              >
                {isSubmitting ? "Processing..." : "Confirm Appointment"}
                {!isSubmitting && <ArrowRight size={18} strokeWidth={2.6} aria-hidden="true" />}
              </button>
              <p className="booking-payment-note">
                No fix, no charge. Balance paid in-store only.
              </p>
            </form>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {showDisclaimer && (
          <div className="booking-modal-shell" role="dialog" aria-modal="true" aria-labelledby="booking-disclaimer-title">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDisclaimer(false)}
              className="booking-modal-backdrop"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="booking-modal-card"
            >
              <div className="booking-modal-content">
                <div className="booking-modal-icon">
                  <Info size={28} strokeWidth={2.4} aria-hidden="true" />
                </div>
                <span className="booking-kicker">Before we confirm</span>
                <h3 id="booking-disclaimer-title">Important Booking Note</h3>
                <p>
                  Please be advised that certain device parts and accessories may not be immediately in stock and can take 1-2 business days to arrive.
                  <br /><br />
                  You may still proceed with this booking; our technicians will notify you promptly if any items need to be ordered.
                  <br /><br />
                  If your device is damaged and unable to receive calls, please reach out via the chat support in the bottom-right corner. Thank you for your understanding.
                </p>
              </div>

              <div className="booking-modal-actions">
                <button
                  onClick={() => setShowDisclaimer(false)}
                  className="booking-secondary-action"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFinalSubmit}
                  className="booking-primary-action"
                >
                  Confirm & Book
                  <ArrowRight size={17} strokeWidth={2.6} aria-hidden="true" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

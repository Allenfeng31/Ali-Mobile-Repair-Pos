"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface QuoteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceModel: string;
  repairType: string;
}

export default function QuoteRequestModal({ 
  isOpen, 
  onClose, 
  deviceModel, 
  repairType 
}: QuoteRequestModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/quote-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, deviceModel, repairType }),
      });

      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          onClose();
          setSubmitted(false);
          setName('');
          setPhone('');
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to submit quote request', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        <div className="modal-header">
          <h2>Get a Quick Quote</h2>
          <p>We'll provide an instant price for your {deviceModel} {repairType}.</p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Request Sent!</h3>
            <p style={{ opacity: 0.7 }}>We will contact you shortly with the best pricing.</p>
          </div>
        ) : (
          <form className="modal-form" onSubmit={handleSubmit}>
            <div className="modal-input-group">
              <label htmlFor="quote-name">Full Name</label>
              <input
                id="quote-name"
                type="text"
                className="modal-input"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="modal-input-group">
              <label htmlFor="quote-phone">Phone Number</label>
              <input
                id="quote-phone"
                type="tel"
                className="modal-input"
                placeholder="0400 000 000"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              className="modal-submit"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Request Quote →'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

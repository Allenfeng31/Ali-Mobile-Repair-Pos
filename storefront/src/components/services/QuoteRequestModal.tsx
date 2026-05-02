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
        // --- Route "Quick Quote" directly into POS Chat ---
        try {
          const SESSION_KEY = 'ali_chat_token';
          let token = window.localStorage.getItem(SESSION_KEY);
          if (!token) {
             token = crypto.randomUUID();
             window.localStorage.setItem(SESSION_KEY, token);
             window.localStorage.setItem('ali_chat_token_expiry', String(Date.now() + 7 * 24 * 60 * 60 * 1000));
          }

          // Ensure session exists
          await fetch('/api/proxy/chat/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          }).catch(() => {});

          // Send Customer Intro if not sent
          const introSent = window.localStorage.getItem('ali_chat_intro_sent');
          if (!introSent) {
            const introContent = `[CUSTOMER_INFO]\nName: ${name}\nPhone: ${phone}`;
            await fetch(`/api/proxy/chat/session/${token}/message`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ content: introContent }),
            }).catch(() => {});
            
            window.localStorage.setItem('ali_chat_name', name);
            window.localStorage.setItem('ali_chat_phone', phone);
            window.localStorage.setItem('ali_chat_intro_sent', '1');
          }

          // Send the Quote Message into Chat
          const quoteContent = `Hi, I would like to request a quote for my ${deviceModel}. Service needed: ${repairType}.`;
          await fetch(`/api/proxy/chat/session/${token}/message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: quoteContent }),
          }).catch(() => {});
        } catch (chatError) {
          console.error("Failed to sync quote to POS chat", chatError);
        }
        // ---------------------------------------------------

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

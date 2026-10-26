"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';

const SESSION_KEY = 'ali_chat_token';
const SESSION_EXPIRY_KEY = 'ali_chat_token_expiry';
const INTRO_SENT_KEY = 'ali_chat_intro_sent';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

interface QuoteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceModel: string;
  repairType: string;
}

function hasPersistedChatMessage(value: unknown): value is { id: string | number } {
  return Boolean(
    value
    && typeof value === 'object'
    && 'id' in value
    && (typeof value.id === 'string' || typeof value.id === 'number')
    && String(value.id).trim(),
  );
}

async function responseJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export default function QuoteRequestModal({
  isOpen,
  onClose,
  deviceModel,
  repairType,
}: QuoteRequestModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function sendSmsNotification() {
    try {
      const response = await fetch('/api/quote-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, deviceModel, repairType }),
      });
      const body = await responseJson(response);
      return response.ok && body?.success === true && body.delivery === 'sms';
    } catch {
      return false;
    }
  }

  async function persistQuoteInChat() {
    try {
      let token = window.localStorage.getItem(SESSION_KEY);
      if (!token) {
        token = crypto.randomUUID();
        window.localStorage.setItem(SESSION_KEY, token);
        window.localStorage.setItem(SESSION_EXPIRY_KEY, String(Date.now() + SEVEN_DAYS_MS));
      }

      const sessionResponse = await fetch('/api/proxy/chat/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!sessionResponse.ok) return false;

      if (!window.localStorage.getItem(INTRO_SENT_KEY)) {
        const introResponse = await fetch(`/api/proxy/chat/session/${token}/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: `[CUSTOMER_INFO]\nName: ${name}\nPhone: ${phone}` }),
        });
        if (!introResponse.ok || !hasPersistedChatMessage(await responseJson(introResponse))) return false;

        window.localStorage.setItem('ali_chat_name', name);
        window.localStorage.setItem('ali_chat_phone', phone);
        window.localStorage.setItem(INTRO_SENT_KEY, '1');
      }

      const quoteResponse = await fetch(`/api/proxy/chat/session/${token}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `Hi, I would like to request a quote for my ${deviceModel}. Service needed: ${repairType}.`,
        }),
      });
      return quoteResponse.ok && hasPersistedChatMessage(await responseJson(quoteResponse));
    } catch {
      return false;
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError('');

    const [smsDelivered, chatPersisted] = await Promise.all([
      sendSmsNotification(),
      persistQuoteInChat(),
    ]);

    if (!smsDelivered && !chatPersisted) {
      setError('We could not send your request. Please try again or call us on 0481 058 514.');
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setName('');
      setPhone('');
    }, 3000);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        <div className="modal-header">
          <h2>Request a Quote</h2>
          <p>We&apos;ll confirm available repair options and a quote for your {deviceModel} {repairType}.</p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Request Sent!</h3>
            <p style={{ opacity: 0.7 }}>We&apos;ll contact you to confirm repair options and pricing.</p>
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
                onChange={(event) => setName(event.target.value)}
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
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>

            {error ? (
              <p role="alert">
                {error} <a href="tel:0481058514">Call 0481 058 514</a>
              </p>
            ) : null}

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

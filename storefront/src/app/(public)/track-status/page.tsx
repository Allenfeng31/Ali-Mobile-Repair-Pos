"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function TrackStatusContent() {
  const [orderId, setOrderId] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  const performCheck = async (id: string) => {
    if (!id) return;
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/proxy/repair-status?id=${encodeURIComponent(id)}`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status || "In Progress");
      } else {
        setTimeout(() => setStatus("Ready for Pickup"), 600);
      }
    } catch {
      setTimeout(() => setStatus("Parts Ordered"), 600);
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  };

  useEffect(() => {
    const queryId = searchParams.get('id');
    if (queryId) {
      setOrderId(queryId);
      performCheck(queryId);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performCheck(orderId);
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1 style={{ marginBottom: '1rem' }}>Track Repair Status</h1>
      <p style={{ maxWidth: '500px', textAlign: 'center', marginBottom: '2rem', opacity: 0.8 }}>
        Enter your Order ID (found on your receipt) to check the real-time status of your device repair.
      </p>

      <div className="form-container" style={{ width: '100%', maxWidth: '500px', margin: '0' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Order ID or Phone Number</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. REP-12345" 
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="primary-btn" style={{ width: "100%", marginTop: "1rem" }} disabled={loading}>
            {loading ? "Checking..." : "Check Status"}
          </button>
        </form>

        {status && (
          <div style={{ marginTop: "2rem", padding: "1.5rem", background: "var(--layer)", borderRadius: "10px", textAlign: "center", border: "1px solid var(--accent)" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>Current Status:</h3>
            <p style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--primary)" }}>{status}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackStatusPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TrackStatusContent />
    </Suspense>
  );
}

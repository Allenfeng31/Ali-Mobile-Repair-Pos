"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function TrackStatusContent() {
  const [orderId, setOrderId] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();

  const performCheck = async (id: string) => {
    if (!id) return;
    setLoading(true);
    setStatus(null);
    setCustomerName(null);
    setError("");

    try {
      const res = await fetch(`/api/proxy/repairs/track/${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error("Repair not found. Please check your ID.");
      const data = await res.json();

      const repairInfo = data.repair || data;
      const extractedName = data.customerName || data.name || repairInfo.customerName || repairInfo.name || repairInfo.customer_name || null;

      setStatus(repairInfo.status || "In Processing");
      if (extractedName) setCustomerName(extractedName);

    } catch (err: any) {
      setError(err.message || "Cannot connect to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const queryId = searchParams.get('id');
    if (queryId) {
      setOrderId(queryId);
      performCheck(queryId);
    }
  }, [searchParams]);

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* 🧱 物理千斤顶：强制撑开顶部距离 */}
      <div style={{ height: '140px', width: '100%' }}></div>

      <h1 style={{ marginBottom: '1rem' }}>Track Repair Status</h1>
      <p style={{ maxWidth: '500px', textAlign: 'center', marginBottom: '2rem', opacity: 0.8 }}>
        Enter your Order ID (found on your receipt) to check the real-time status of your device repair.
      </p>

      <div className="form-container" style={{ width: '100%', maxWidth: '500px', margin: '0' }}>
        <form onSubmit={(e) => { e.preventDefault(); performCheck(orderId); }}>
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

          {error && (
            <p style={{ color: '#ef4444', textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
              {error}
            </p>
          )}
        </form>

        {status && (
          <div style={{ marginTop: "2rem", padding: "1.5rem", background: "var(--layer)", borderRadius: "10px", textAlign: "center", border: "1px solid var(--accent)" }}>
            {customerName && (
              <h2 style={{ fontSize: "1.4rem", marginBottom: "1rem", color: "var(--foreground)" }}>
                Hello, {customerName}!
              </h2>
            )}
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
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '5rem' }}>Loading...</div>}>
      <TrackStatusContent />
    </Suspense>
  );
}
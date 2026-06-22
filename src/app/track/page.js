"use client";
import { useState } from "react";
import "./page.css";

export default function TrackPage() {
  const [awb, setAwb] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [trackingData, setTrackingData] = useState(null);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!awb.trim()) return;

    setLoading(true);
    setError("");
    setTrackingData(null);

    try {
      const res = await fetch('/api/shipping/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ awb: awb.trim() })
      });
      const data = await res.json();
      
      if (data.success) {
        setTrackingData(data.tracking);
      } else {
        setError(data.error || "Unable to track this AWB.");
      }
    } catch (err) {
      setError("Failed to fetch tracking data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="track-page">
      <div className="container">
        <h1 className="track-title">TRACK YOUR ORDER</h1>
        <p className="track-subtitle">Enter your AWB to see real-time delivery updates.</p>

        <form onSubmit={handleTrack} className="track-form vintage-border">
          <input
            type="text"
            placeholder="Enter AWB Number"
            value={awb}
            onChange={(e) => setAwb(e.target.value)}
            className="track-input"
            required
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Tracking..." : "TRACK"}
          </button>
        </form>

        {error && <p className="track-error">{error}</p>}

        {trackingData && (
          <div className="tracking-results vintage-border">
            <h2>Shipment Status: <span className="status-badge">{trackingData.status.toUpperCase()}</span></h2>
            <div className="tracking-meta">
              <p><strong>AWB:</strong> {trackingData.awb_number}</p>
              <p><strong>Order ID:</strong> {trackingData.order_number}</p>
              <p><strong>Courier:</strong> {trackingData.courier_name || "Nimbuspost Partner"}</p>
            </div>

            <div className="timeline-container">
              {trackingData.history && trackingData.history.length > 0 ? (
                trackingData.history.map((event, index) => (
                  <div key={index} className="timeline-event">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <h3>{event.status_code} - {event.message}</h3>
                      <p>{event.location}</p>
                      <span className="timeline-date">{event.event_time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p>No tracking history available yet. The courier might still be picking it up.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

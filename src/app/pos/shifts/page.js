'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, ClipboardList, DollarSign, Clock } from 'lucide-react';
import '../pos.css';

export default function PosShifts() {
  const router = useRouter();
  const [outlet, setOutlet] = useState(null);
  const [currentShift, setCurrentShift] = useState(null);
  const [shiftHistory, setShiftHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [openingCash, setOpeningCash] = useState('0');
  const [closingCash, setClosingCash] = useState('0');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('pos_outlet');
    if (!stored) {
      router.push('/pos');
      return;
    }
    setOutlet(JSON.parse(stored));
  }, [router]);

  useEffect(() => {
    if (!outlet) return;

    const fetchShifts = async () => {
      try {
        const [currentRes, historyRes] = await Promise.allSettled([
          fetch(`/api/pos/shifts/current?outletId=${outlet.id}`),
          fetch(`/api/pos/shifts?outletId=${outlet.id}`),
        ]);

        if (currentRes.status === 'fulfilled' && currentRes.value.ok) {
          const body = await currentRes.value.json();
          setCurrentShift(body.data || null);
        }

        if (historyRes.status === 'fulfilled' && historyRes.value.ok) {
          const body = await historyRes.value.json();
          setShiftHistory(body.data || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShifts();

    const channel = supabase.channel('pos-shifts');
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pos_shifts',
          filter: `outlet_id=eq.${outlet.id}`,
        },
        () => {
          fetch(`/api/pos/shifts/current?outletId=${outlet.id}`)
            .then((r) => r.json())
            .then((b) => setCurrentShift(b.data || null))
            .catch(() => {});
          fetch(`/api/pos/shifts?outletId=${outlet.id}`)
            .then((r) => r.json())
            .then((b) => setShiftHistory(b.data || []))
            .catch(() => {});
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [outlet]);

  const handleOpenShift = async (e) => {
    e.preventDefault();
    if (!outlet) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/pos/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outlet_id: outlet.id,
          opening_cash: parseFloat(openingCash) || 0,
          notes: notes || null,
        }),
      });
      if (!res.ok) {
        const errBody = await res.json();
        throw new Error(errBody.error || 'Failed to open shift');
      }
      const body = await res.json();
      setCurrentShift(body.data || body);
      setOpeningCash('0');
      setNotes('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseShift = async (e) => {
    e.preventDefault();
    if (!currentShift || !outlet) return;
    setSubmitting(true);
    setError(null);
    try {
      const closing = parseFloat(closingCash) || 0;
      const expected = (currentShift.expected_cash || 0) + (currentShift.opening_cash || 0);
      const difference = closing - expected;

      const res = await fetch(`/api/pos/shifts/${currentShift.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          closing_cash: closing,
          expected_cash: expected,
          difference,
          notes: notes || null,
          status: 'closed',
          closed_at: new Date().toISOString(),
        }),
      });
      if (!res.ok) {
        const errBody = await res.json();
        throw new Error(errBody.error || 'Failed to close shift');
      }
      setCurrentShift(null);
      setClosingCash('0');
      setNotes('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="pos-fullscreen">
        <div className="pos-top-bar">
          <h1>Shifts</h1>
        </div>
        <div className="pos-loading">Loading shifts...</div>
      </div>
    );
  }

  const expectedCash = currentShift
    ? parseFloat(currentShift.expected_cash || 0) + parseFloat(currentShift.opening_cash || 0)
    : 0;

  return (
    <div className="pos-fullscreen">
      <div className="pos-top-bar">
        <button onClick={() => router.push('/pos/dashboard')}>
          <ArrowLeft size={16} /> Back
        </button>
        <h1>Shift Management</h1>
        <div />
      </div>

      <div className="pos-shifts-container" style={{ overflow: 'auto', flex: 1 }}>
        {error && (
          <div
            style={{
              padding: 8,
              background: '#ffebee',
              color: '#c62828',
              fontSize: 13,
              borderRadius: 6,
              marginBottom: 16,
            }}
          >
            {error}
            <button
              style={{
                marginLeft: 8,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
              }}
              onClick={() => setError(null)}
            >
              ✕
            </button>
          </div>
        )}

        <div className={`pos-shift-status ${currentShift ? 'open' : 'closed'}`}>
          {currentShift ? (
            <div>
              <ClipboardList size={24} style={{ marginBottom: 4 }} />
              <div>Shift Open</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>
                Opened: {new Date(currentShift.opened_at).toLocaleString()}
              </div>
              <div style={{ fontSize: 13 }}>
                Opening Cash: ₹{parseFloat(currentShift.opening_cash || 0).toFixed(2)}
              </div>
            </div>
          ) : (
            <div>
              <Clock size={24} style={{ marginBottom: 4 }} />
              <div>No Open Shift</div>
            </div>
          )}
        </div>

        {currentShift ? (
          <form className="pos-form" onSubmit={handleCloseShift}>
            <h3>Close Shift</h3>
            <div
              style={{
                fontSize: 14,
                marginBottom: 12,
                padding: 8,
                background: 'var(--bg-color)',
                borderRadius: 4,
              }}
            >
              Expected Cash: <strong>₹{expectedCash.toFixed(2)}</strong>
            </div>
            <div className="pos-pay-input-group">
              <label>Actual Closing Cash</label>
              <input
                type="number"
                step="0.01"
                value={closingCash}
                onChange={(e) => setClosingCash(e.target.value)}
                required
              />
            </div>
            {parseFloat(closingCash) > 0 && (
              <div
                style={{
                  fontSize: 14,
                  marginBottom: 12,
                  padding: 8,
                  borderRadius: 4,
                  background: expectedCash !== parseFloat(closingCash) ? '#fff3e0' : '#e8f5e9',
                }}
              >
                {expectedCash !== parseFloat(closingCash) ? (
                  <span>
                    Difference:{' '}
                    <strong>₹{(parseFloat(closingCash) - expectedCash).toFixed(2)}</strong>
                  </span>
                ) : (
                  <span style={{ color: '#2e7d32' }}>✓ Cash matches expected</span>
                )}
              </div>
            )}
            <div className="pos-pay-input-group">
              <label>Closing Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any notes..."
              />
            </div>
            <button
              type="submit"
              className="pos-btn danger"
              style={{ width: '100%' }}
              disabled={submitting}
            >
              {submitting ? 'Closing...' : 'Close Shift'}
            </button>
          </form>
        ) : (
          <form className="pos-form" onSubmit={handleOpenShift}>
            <h3>Open New Shift</h3>
            <div className="pos-pay-input-group">
              <label>Opening Cash Amount</label>
              <input
                type="number"
                step="0.01"
                value={openingCash}
                onChange={(e) => setOpeningCash(e.target.value)}
                required
              />
            </div>
            <div className="pos-pay-input-group">
              <label>Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes..."
              />
            </div>
            <button
              type="submit"
              className="pos-btn primary"
              style={{ width: '100%' }}
              disabled={submitting}
            >
              {submitting ? 'Opening...' : 'Open Shift'}
            </button>
          </form>
        )}

        <div className="pos-panel">
          <h2>Shift History</h2>
          {shiftHistory.length === 0 ? (
            <div className="pos-empty">No shift history</div>
          ) : (
            <div>
              {shiftHistory.map((shift) => (
                <div
                  key={shift.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: '1px solid var(--border-color)',
                    fontSize: 13,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {new Date(shift.opened_at).toLocaleDateString()}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                      Open: {new Date(shift.opened_at).toLocaleTimeString()}
                      {shift.closed_at &&
                        ` · Close: ${new Date(shift.closed_at).toLocaleTimeString()}`}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600 }}>
                      ₹{parseFloat(shift.expected_cash || 0).toFixed(2)}
                    </div>
                    {shift.difference !== undefined && shift.difference !== null && (
                      <div
                        style={{
                          fontSize: 12,
                          color: parseFloat(shift.difference) !== 0 ? '#c62828' : '#2e7d32',
                        }}
                      >
                        {parseFloat(shift.difference) >= 0 ? '+' : ''}₹
                        {parseFloat(shift.difference).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

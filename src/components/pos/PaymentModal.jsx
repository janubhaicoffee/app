"use client";
import { useState } from "react";
import { X, Banknote, CreditCard, Smartphone, Users, Printer, Tag } from "lucide-react";
import { printReceipt, printLabel } from "@/lib/printing";

export default function PaymentModal({ isOpen, onClose, total, onPaymentComplete, order }) {
  const [method, setMethod] = useState("cash");
  const [amountTendered, setAmountTendered] = useState(total.toFixed(2));
  const [cardRef, setCardRef] = useState("");
  const [upiRef, setUpiRef] = useState("");
  const [tipAmount, setTipAmount] = useState("0");
  const [splitPayments, setSplitPayments] = useState([{ method: "cash", amount: total.toFixed(2) }]);
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

  if (!isOpen) return null;

  const tendered = parseFloat(amountTendered) || 0;
  const change = tendered - total - parseFloat(tipAmount || 0);

  const handleConfirm = async () => {
    setProcessing(true);
    try {
      const payload = {
        total: total,
        tip: parseFloat(tipAmount || 0),
        method,
      };

      if (method === "cash") {
        payload.tendered = tendered;
        payload.change = Math.max(0, change);
      } else if (method === "card") {
        payload.reference = cardRef;
      } else if (method === "upi") {
        payload.reference = upiRef;
      } else if (method === "split") {
        payload.payments = splitPayments;
      }

      await onPaymentComplete(payload);
      setCompleted(true);
    } catch (err) {
      console.error("Payment failed:", err);
    } finally {
      setProcessing(false);
    }
  };

  const handlePrintReceipt = () => {
    if (order) printReceipt(order);
  };

  const handlePrintLabel = () => {
    if (order && order.items?.length) {
      printLabel(order.items[0]);
    }
  };

  const handleClose = () => {
    setCompleted(false);
    onClose();
  };

  const addSplit = () => {
    setSplitPayments([...splitPayments, { method: "cash", amount: "0" }]);
  };

  const updateSplit = (idx, field, value) => {
    const updated = [...splitPayments];
    updated[idx] = { ...updated[idx], [field]: value };
    setSplitPayments(updated);
  };

  const removeSplit = (idx) => {
    setSplitPayments(splitPayments.filter((_, i) => i !== idx));
  };

  const methods = [
    { key: "cash", label: "Cash", icon: Banknote },
    { key: "card", label: "Card", icon: CreditCard },
    { key: "upi", label: "UPI", icon: Smartphone },
    { key: "split", label: "Split", icon: Users },
  ];

  return (
    <div className="pos-modal-overlay" onClick={completed ? undefined : handleClose}>
      <div className="pos-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pos-modal-header">
          <span>{completed ? "Payment Complete" : "Collect Payment"}</span>
          <button onClick={handleClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        <div className="pos-modal-body">
          {completed ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#38a169", marginBottom: 16 }}>
                Payment Successful
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 24 }}>
                ₹{total.toFixed(2)}
              </div>
              {order && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button className="pos-confirm-pay" onClick={handlePrintReceipt} style={{ background: "#3182ce" }}>
                    <Printer size={18} style={{ verticalAlign: "middle", marginRight: 6 }} />
                    Print Receipt
                  </button>
                  {order.items?.length > 0 && (
                    <button className="pos-confirm-pay" onClick={handlePrintLabel} style={{ background: "#dd6b20" }}>
                      <Tag size={18} style={{ verticalAlign: "middle", marginRight: 6 }} />
                      Print Label
                    </button>
                  )}
                  <button className="pos-confirm-pay" onClick={handleClose} style={{ background: "#4a5568", marginTop: 8 }}>
                    Close
                  </button>
                </div>
              )}
              {!order && (
                <button className="pos-confirm-pay" onClick={handleClose} style={{ background: "#4a5568" }}>
                  Close
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="pos-pay-amount">₹{total.toFixed(2)}</div>

              <div className="pos-pay-methods">
                {methods.map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.key}
                      className={`pos-pay-method ${method === m.key ? "active" : ""}`}
                      onClick={() => setMethod(m.key)}
                    >
                      <Icon size={20} />
                      {m.label}
                    </button>
                  );
                })}
              </div>

              {method === "cash" && (
                <>
                  <div className="pos-pay-input-group">
                    <label>Amount Tendered</label>
                    <input
                      type="number"
                      step="0.01"
                      value={amountTendered}
                      onChange={(e) => setAmountTendered(e.target.value)}
                    />
                  </div>
                  {tendered >= total + parseFloat(tipAmount || 0) && (
                    <div className="pos-change-display">
                      <div>Change Due</div>
                      <div className="change-amount">₹{change.toFixed(2)}</div>
                    </div>
                  )}
                </>
              )}

              {method === "card" && (
                <div className="pos-pay-input-group">
                  <label>Card Reference / Last 4 digits</label>
                  <input
                    type="text"
                    placeholder="e.g., AUTH12345"
                    value={cardRef}
                    onChange={(e) => setCardRef(e.target.value)}
                  />
                </div>
              )}

              {method === "upi" && (
                <>
                  <div style={{ textAlign: "center", marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>UPI ID:</div>
                    <div style={{ fontSize: 18, color: "var(--text-primary)" }}>pay@janubhaicoffee</div>
                  </div>
                  <div className="pos-pay-input-group">
                    <label>UPI Transaction Ref</label>
                    <input
                      type="text"
                      placeholder="e.g., UPI12345678"
                      value={upiRef}
                      onChange={(e) => setUpiRef(e.target.value)}
                    />
                  </div>
                </>
              )}

              {method === "split" && (
                <div>
                  {splitPayments.map((sp, idx) => (
                    <div key={idx} className="pos-split-entry">
                      <select
                        value={sp.method}
                        onChange={(e) => updateSplit(idx, "method", e.target.value)}
                      >
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="upi">UPI</option>
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        value={sp.amount}
                        onChange={(e) => updateSplit(idx, "amount", e.target.value)}
                      />
                      {splitPayments.length > 1 && (
                        <button
                          onClick={() => removeSplit(idx)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#c62828" }}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button className="pos-add-split" onClick={addSplit}>
                    + Add Split Payment
                  </button>
                  <div className="pos-total-row" style={{ padding: "8px 0" }}>
                    <span>Allocated:</span>
                    <span>
                      ₹{splitPayments.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <div className="pos-pay-input-group">
                <label>Tip</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                />
              </div>

              <button className="pos-confirm-pay" onClick={handleConfirm} disabled={processing}>
                {processing ? "Processing..." : `Confirm Payment • ₹${(total + parseFloat(tipAmount || 0)).toFixed(2)}`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

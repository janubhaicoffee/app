"use client";
import { useState, useEffect } from "react";
import { Truck, Save } from "lucide-react";

export default function DeliveryIntegrations({ outletId, refreshTrigger }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Orders and tabs states
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("swiggy"); // Default to swiggy as expected by credentials tests

  // Credentials form states
  const [clientId, setClientId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [active, setActive] = useState(false);
  const [credentialsList, setCredentialsList] = useState([]);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [toggleInFlight, setToggleInFlight] = useState(false);

  const fetchData = async () => {
    try {
      // Fetch orders
      const partnerParam = tab && tab !== "all" ? `&partner=${tab}` : "";
      const ordersRes = await fetch(`/api/integrations/orders?outletId=${outletId || ""}${partnerParam}`);
      if (!ordersRes.ok) throw new Error("Failed to fetch delivery orders");
      const ordersData = await ordersRes.json();
      setOrders(Array.isArray(ordersData.data) ? ordersData.data : []);

      // Fetch credentials
      const credsRes = await fetch("/api/outlet/delivery");
      if (!credsRes.ok) throw new Error("Failed to fetch delivery credentials");
      const credsData = await credsRes.json();
      const list = Array.isArray(credsData.data) ? credsData.data : [];
      setCredentialsList(list);

      // Load form values for currently active tab
      const currentCred = list.find((c) => c.id === tab);
      if (currentCred) {
        setClientId(currentCred.client_id || "");
        setApiKey(currentCred.api_key || "");
        setActive(currentCred.active || false);
      } else {
        setClientId("");
        setApiKey("");
        setActive(false);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tab, outletId, refreshTrigger]);

  const handleToggleActive = async (checked) => {
    setToggleInFlight(true);
    setActive(checked);
    try {
      await fetch("/api/outlet/delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partner: tab,
          client_id: clientId,
          client_secret: "dummy-secret",
          api_key: apiKey,
          active: checked,
        }),
      });
    } catch (err) {
      // revert on error
      setActive(!checked);
    } finally {
      setToggleInFlight(false);
    }
  };

  const handleSaveCredentials = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!apiKey) {
      setFormError("API Key is required");
      return;
    }

    try {
      const res = await fetch("/api/outlet/delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partner: tab,
          client_id: clientId,
          client_secret: "dummy-secret",
          api_key: apiKey,
          active,
        }),
      });

      if (!res.ok) throw new Error("Failed to save credentials");

      setFormSuccess("Credentials saved");
      
      // Update local state list
      setCredentialsList((prev) => {
        const itemIdx = prev.findIndex((c) => c.id === tab);
        const updated = { id: tab, client_id: clientId, api_key: apiKey, active };
        if (itemIdx > -1) {
          const newList = [...prev];
          newList[itemIdx] = updated;
          return newList;
        } else {
          return [...prev, updated];
        }
      });
    } catch (err) {
      setFormError(err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "delivered": return "outlet-badge green";
      case "preparing": return "outlet-badge yellow";
      case "declined": return "outlet-badge red";
      default: return "outlet-badge gray";
    }
  };

  const formatStatus = (s) => {
    if (!s) return "Pending";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  if (loading) {
    return (
      <div className="panel" data-testid="delivery-panel">
        <h2>Delivery Integrations</h2>
        <div className="loading-screen">
          <div className="loading-spinner" />
          <p>Loading delivery module...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel" data-testid="delivery-panel">
        <h2>Delivery Integrations</h2>
        <div className="offline-banner error-text" style={{ padding: "8px 12px", background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: "4px", color: "#c53030", fontSize: "13px" }}>
          Offline Mode: {error}
        </div>
      </div>
    );
  }

  // Cap orders count at 50
  const displayedOrders = orders.slice(0, 50);

  return (
    <div className="panel" data-testid="delivery-panel">
      <h2>Delivery Integrations</h2>

      {/* Tabs */}
      <div className="delivery-tabs" style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
        <button
          className={`delivery-tab-btn ${tab === "swiggy" ? "active" : ""}`}
          data-testid="tab-swiggy"
          onClick={() => setTab("swiggy")}
          style={{ padding: "8px 16px", cursor: "pointer" }}
        >
          Swiggy
        </button>
        <button
          className={`delivery-tab-btn ${tab === "zomato" ? "active" : ""}`}
          data-testid="tab-zomato"
          onClick={() => setTab("zomato")}
          style={{ padding: "8px 16px", cursor: "pointer" }}
        >
          Zomato
        </button>
      </div>

      {/* Settings credentials form for currently active tab */}
      {tab && (
        <div className="outlet-card" style={{ marginBottom: 16 }}>
          <h3 style={{ textTransform: "capitalize" }}>{tab} Configuration</h3>
          <form
            onSubmit={handleSaveCredentials}
            data-testid="delivery-credentials-form"
            className="outlet-form"
          >
            {formError && (
              <div className="error-text" style={{ color: "red", fontSize: 12, marginBottom: 8 }}>
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="success-text" style={{ color: "green", fontSize: 12, marginBottom: 8 }}>
                {formSuccess}
              </div>
            )}
            <div className="form-group" style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="checkbox"
                id="toggle-delivery-status"
                data-testid="toggle-delivery-status"
                checked={active}
                disabled={toggleInFlight}
                onChange={(e) => handleToggleActive(e.target.checked)}
              />
              <label htmlFor="toggle-delivery-status">Enable Integration</label>
            </div>
            <div className="form-group" style={{ marginBottom: 10 }}>
              <label>Client ID</label>
              <input
                type="text"
                className="form-control"
                data-testid="field-delivery-client-id"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder={`Enter ${tab} Client ID`}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label>API Key</label>
              <input
                type="text"
                className="form-control"
                data-testid="field-delivery-api-key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Enter ${tab} API Key`}
              />
            </div>
            <button type="submit" className="outlet-btn primary sm" data-testid="btn-save-delivery">
              Save Credentials
            </button>
          </form>
        </div>
      )}

      {/* Order Feed */}
      <h3>Live Order Feed ({orders.length})</h3>
      {orders.length === 0 ? (
        <div className="empty-placeholder" data-testid="delivery-order-feed" style={{ padding: "20px 0" }}>
          <Truck size={32} style={{ margin: "0 auto 8px", display: "block", opacity: 0.4 }} />
          <p>No delivery orders</p>
        </div>
      ) : (
        <div className="delivery-order-feed" data-testid="delivery-order-feed">
          {displayedOrders.map((order) => {
            const items = Array.isArray(order.items) ? order.items : [];
            let itemSummary = "Empty Order";
            if (items.length > 0) {
              itemSummary = items
                .slice(0, 3)
                .map((i) => i.name || i.item_name || "Item")
                .join(", ");
              if (items.length > 3) itemSummary += ` +${items.length - 3} more`;
            }

            return (
              <div
                key={order.id}
                className="delivery-order-item"
                data-testid="delivery-order-item"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 12px",
                  borderBottom: "1px solid #edf2f7",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="delivery-order-partner" data-testid="delivery-order-partner" style={{ fontWeight: 600 }}>
                    {order.partner ? order.partner.charAt(0).toUpperCase() + order.partner.slice(1) : ""}
                  </div>
                  <div className="order-items" style={{ fontSize: 12, color: "#4a5568", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {itemSummary}
                  </div>
                  <div style={{ fontSize: 10, color: "#a0aec0", marginTop: 2 }}>
                    {new Date(order.created_at).toLocaleTimeString("en-IN")}
                    {order.customer_name ? ` · ${order.customer_name}` : ""}
                  </div>
                </div>
                <div style={{ textAlign: "right", marginLeft: 12 }}>
                  <div style={{ fontWeight: 700 }}>₹{Number(order.total || 0).toFixed(2)}</div>
                  <span className={getStatusBadge(order.status)} style={{ marginTop: 2, display: "inline-block" }}>
                    {formatStatus(order.status)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

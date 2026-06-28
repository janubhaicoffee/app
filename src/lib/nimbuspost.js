const NIMBUSPOST_BASE_URL = "https://api.nimbuspost.com/v1";

// Simple in-memory cache for the token
let cachedToken = null;
let tokenExpiry = null;

export async function getAuthToken() {
  // If we have a valid cached token, return it
  if (cachedToken && tokenExpiry && new Date() < tokenExpiry) {
    return cachedToken;
  }

  const email = process.env.NIMBUSPOST_EMAIL;
  const password = process.env.NIMBUSPOST_PASSWORD;

  if (!email || !password) {
    throw new Error("Nimbuspost credentials (NIMBUSPOST_EMAIL, NIMBUSPOST_PASSWORD) are not set in environment variables.");
  }

  const response = await fetch(`${NIMBUSPOST_BASE_URL}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!data.status) {
    throw new Error(`Nimbuspost Auth Failed: ${data.message}`);
  }

  // Token is valid for some time. We'll cache it for 1 hour.
  cachedToken = data.data;
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + 1);
  tokenExpiry = expiryDate;

  return cachedToken;
}

export async function getShippingRates({ destination, payment_type = "prepaid", order_amount, weight = 500 }) {
  const token = await getAuthToken();
  const origin = process.env.NIMBUSPOST_WAREHOUSE_PINCODE || "110001"; // Defaulting to a central pin

  const response = await fetch(`${NIMBUSPOST_BASE_URL}/courier/serviceability`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      origin,
      destination,
      payment_type,
      order_amount,
      weight,
      length: "10",
      breadth: "10",
      height: "10"
    }),
  });

  const data = await response.json();
  
  if (!data.status) {
    throw new Error(`Nimbuspost Serviceability Failed: ${data.message || "Unknown error"}`);
  }

  return data.data; // Returns array of couriers with their rates and SLAs
}

export async function createShipment(orderData) {
  const token = await getAuthToken();
  
  const response = await fetch(`${NIMBUSPOST_BASE_URL}/shipments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(orderData),
  });

  const data = await response.json();

  if (!data.status) {
    throw new Error(`Nimbuspost Create Shipment Failed: ${data.message || "Unknown error"}`);
  }

  return data.data;
}

export async function trackShipment(awb) {
  const token = await getAuthToken();

  const response = await fetch(`${NIMBUSPOST_BASE_URL}/shipments/track/${awb}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!data.status) {
    throw new Error(`Nimbuspost Track Failed: ${data.message || "Unknown error"}`);
  }

  return data.data;
}

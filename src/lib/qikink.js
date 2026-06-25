export async function createQikinkOrder({ orderNumber, finalTotal, formData, merchItems }) {
  const clientId = process.env.QIKINK_CLIENT_ID;
  const clientSecret = process.env.QIKINK_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error("Qikink credentials not found in environment variables");
  }

  // Use sandbox by default unless explicitly set to live
  const baseUrl = process.env.QIKINK_ENV === 'live' 
    ? 'https://api.qikink.com' 
    : 'https://sandbox.qikink.com';

  // 1. Get Access Token
  const tokenParams = new URLSearchParams();
  tokenParams.append('ClientId', clientId);
  tokenParams.append('client_secret', clientSecret);

  const tokenRes = await fetch(`${baseUrl}/api/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: tokenParams
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.Accesstoken) {
    throw new Error(`Qikink auth failed: ${JSON.stringify(tokenData)}`);
  }

  const accessToken = tokenData.Accesstoken;

  // 2. Prepare Order Payload
  const orderPayload = {
    order_number: orderNumber,
    qikink_shipping: "1",
    gateway: "Prepaid",
    total_order_value: finalTotal.toString(),
    line_items: merchItems.map(item => ({
      search_from_my_products: 1, // Assume products are already created in Qikink dashboard
      quantity: item.quantity.toString(),
      price: item.price.toString(),
      sku: item.id // Assuming our Supabase ID matches Qikink SKU
    })),
    shipping_address: {
      first_name: formData.name,
      address1: formData.address,
      phone: formData.phone,
      email: formData.email,
      city: formData.city,
      zip: formData.pincode,
      province: formData.state,
      country_code: "IN" // Defaulting to IN based on Postman docs
    }
  };

  // 3. Create Order
  const orderRes = await fetch(`${baseUrl}/api/order/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ClientId': clientId,
      'Accesstoken': accessToken
    },
    body: JSON.stringify(orderPayload)
  });

  const orderData = await orderRes.json();
  
  // Checking typical success status codes (e.g., 200)
  if (orderData.status_code !== "200" && orderData.status_code !== 200) {
     console.error("Qikink Order Creation Failed:", orderData);
     throw new Error(`Qikink Order Creation Failed: ${orderData.message || 'Unknown error'}`);
  }

  return orderData;
}

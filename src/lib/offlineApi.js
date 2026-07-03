import {
  cacheProducts, getCachedProducts,
  cacheCategories, getCachedCategories,
  cacheTables, getCachedTables,
  cacheOutlets, getCachedOutlets,
  cacheOrder, getCachedOrder, getCachedOrders,
  addToSyncQueue,
} from "./db";

export function isOnline() {
  return navigator.onLine;
}

async function safeFetch(url, options = {}) {
  try {
    return await fetch(url, options);
  } catch {
    return null;
  }
}

async function fetchWithTimeout(url, options = {}, timeout = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

async function fetchAndCache(url, cacheFn) {
  try {
    const res = await fetchWithTimeout(url);
    if (res.ok) {
      const body = await res.json();
      const data = body.data || [];
      if (cacheFn) await cacheFn(data);
      return { data, offline: false };
    }
  } catch {}
  return null;
}

async function fetchFallback(url, cacheFn) {
  try {
    const res = await safeFetch(url);
    if (res && res.ok) {
      const body = await res.json();
      const data = body.data || [];
      if (cacheFn) await cacheFn(data);
      return { data, offline: false };
    }
  } catch {}
  return null;
}

export async function fetchOutlets(userId) {
  const result = await fetchAndCache(`/api/pos/outlets?userId=${userId}`, cacheOutlets);
  if (result) return result;
  const cached = await getCachedOutlets();
  if (cached.length > 0) return { data: cached, offline: true };
  const fallback = await fetchFallback(`/api/pos/outlets?userId=${userId}`, cacheOutlets);
  if (fallback) return fallback;
  return { data: null, error: "No outlets available offline", offline: true };
}

export async function fetchProducts(outletId) {
  const result = await fetchAndCache(`/api/pos/products?outletId=${outletId}`, (data) => cacheProducts(outletId, data));
  if (result) return result;
  const cached = await getCachedProducts(outletId);
  if (cached.length > 0) return { data: cached, offline: true };
  const fallback = await fetchFallback(`/api/pos/products?outletId=${outletId}`, (data) => cacheProducts(outletId, data));
  if (fallback) return fallback;
  return { data: [], offline: true };
}

export async function fetchCategories(outletId) {
  const result = await fetchAndCache(`/api/pos/categories?outletId=${outletId}`, (data) => cacheCategories(outletId, data));
  if (result) return result;
  const cached = await getCachedCategories(outletId);
  if (cached.length > 0) return { data: cached, offline: true };
  const fallback = await fetchFallback(`/api/pos/categories?outletId=${outletId}`, (data) => cacheCategories(outletId, data));
  if (fallback) return fallback;
  return { data: [], offline: true };
}

export async function fetchTables(outletId) {
  const result = await fetchAndCache(`/api/pos/tables?outletId=${outletId}`, (data) => cacheTables(outletId, data));
  if (result) return result;
  const cached = await getCachedTables(outletId);
  if (cached.length > 0) return { data: cached, offline: true };
  const fallback = await fetchFallback(`/api/pos/tables?outletId=${outletId}`, (data) => cacheTables(outletId, data));
  if (fallback) return fallback;
  return { data: [], offline: true };
}

export async function createOrder(payload) {
  try {
    const res = await fetchWithTimeout("/api/pos/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }, 10000);
    if (res.ok) {
      const body = await res.json();
      const order = body.data || body;
      await cacheOrder(order);
      return { data: order, offline: false };
    }
  } catch {}

  const tempId = `offline_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const offlineOrder = {
    id: tempId,
    ...payload,
    status: "pending_sync",
    created_at: new Date().toISOString(),
    _offline: true,
  };
  await cacheOrder(offlineOrder);
  await addToSyncQueue({
    type: "create_order",
    endpoint: "/api/pos/orders",
    method: "POST",
    body: payload,
    tempId,
  });
  return { data: offlineOrder, offline: true };
}

export async function updateOrderStatus(orderId, updates) {
  try {
    const res = await fetchWithTimeout(`/api/pos/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }, 8000);
    if (res.ok) return { data: updates, offline: false };
  } catch {}

  await addToSyncQueue({
    type: "update_order",
    endpoint: `/api/pos/orders/${orderId}`,
    method: "PATCH",
    body: updates,
    orderId,
    tempId: `update_${Date.now()}`,
  });
  return { data: updates, offline: true };
}

export async function processPayment(payload) {
  try {
    const res = await fetchWithTimeout("/api/pos/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }, 10000);
    if (res.ok) return { data: payload, offline: false };
  } catch {}

  await addToSyncQueue({
    type: "payment",
    endpoint: "/api/pos/payments",
    method: "POST",
    body: payload,
  });
  return { data: { ...payload, _offline: true }, offline: true };
}

export async function fetchOrderById(orderId) {
  const result = await fetchAndCache(`/api/pos/orders/${orderId}`, (data) => cacheOrder(data));
  if (result) return result;
  const cached = await getCachedOrder(orderId);
  if (cached) return { data: cached, offline: true };
  const fallback = await fetchFallback(`/api/pos/orders/${orderId}`, (data) => cacheOrder(data));
  if (fallback) return fallback;
  return { data: null, error: "Order not found offline", offline: true };
}

export async function fetchOrders(outletId, params = {}) {
  const qs = new URLSearchParams({ outletId, ...params }).toString();
  const result = await fetchAndCache(`/api/pos/orders?${qs}`, (data) => Promise.all(data.map((o) => cacheOrder(o))));
  if (result) return result;
  const cached = await getCachedOrders(outletId);
  return { data: cached, offline: true };
}

export async function fetchShiftStatus(outletId) {
  try {
    const res = await fetchWithTimeout(`/api/pos/shifts/current?outletId=${outletId}`);
    if (res.ok) {
      const body = await res.json();
      return { data: body.data || null, offline: false };
    }
  } catch {}
  return { data: null, offline: true };
}

export async function prefetchOutletData(outletId) {
  if (!isOnline()) return;
  await Promise.allSettled([
    fetchProducts(outletId),
    fetchCategories(outletId),
    fetchTables(outletId),
  ]);
}

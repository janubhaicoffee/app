import {
  getPendingSyncItems,
  updateSyncItem,
  removeSyncItem,
  getSyncQueueCount,
  del,
  cacheOrder,
} from "./db";

let syncing = false;
let listeners = [];

export function onSyncChange(fn) {
  listeners.push(fn);
  return () => { listeners = listeners.filter((l) => l !== fn); };
}

function notify(count) {
  listeners.forEach((fn) => fn(count));
}

export async function processSyncQueue() {
  if (syncing) return;
  syncing = true;
  try {
    const items = await getPendingSyncItems();
    if (items.length === 0) {
      notify(0);
      syncing = false;
      return;
    }

    for (const item of items) {
      try {
        const res = await fetch(item.endpoint, {
          method: item.method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item.body),
        });

        if (res.ok) {
          if (item.tempId) {
            const body = await res.json();
            const serverOrder = body.data || body;
            if (serverOrder && serverOrder.id) {
              await del("orders", item.tempId).catch(() => {});
              if (serverOrder.id !== item.tempId) {
                await cacheOrder(serverOrder).catch(() => {});
              }
            }
          }
          await removeSyncItem(item.id);
        } else {
          const errBody = await res.json().catch(() => ({}));
          if (res.status >= 400 && res.status < 500) {
            await updateSyncItem(item.id, { status: "failed", error: errBody.error || "HTTP " + res.status });
          } else {
            await updateSyncItem(item.id, {
              status: "retry",
              retryCount: (item.retryCount || 0) + 1,
              lastError: errBody.error || "HTTP " + res.status,
            });
            if ((item.retryCount || 0) >= 5) {
              await updateSyncItem(item.id, { status: "failed" });
            }
          }
        }
      } catch (err) {
        await updateSyncItem(item.id, {
          status: "retry",
          retryCount: (item.retryCount || 0) + 1,
          lastError: err.message,
        });
        if ((item.retryCount || 0) >= 5) {
          await updateSyncItem(item.id, { status: "failed" });
        }
      }
    }
  } finally {
    const remaining = await getSyncQueueCount();
    notify(remaining);
    syncing = false;
  }
}

export async function startSyncEngine() {
  const process = async () => {
    if (navigator.onLine) {
      await processSyncQueue();
    }
  };

  window.addEventListener("online", process);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && navigator.onLine) {
      process();
    }
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data?.type === "trigger-sync") {
        process();
      }
    });
  }

  const initialCount = await getSyncQueueCount();
  notify(initialCount);

  if (navigator.onLine) {
    setTimeout(process, 2000);
  }

  setInterval(() => {
    if (navigator.onLine) {
      process();
    }
  }, 30000);

  return () => {
    window.removeEventListener("online", process);
  };
}

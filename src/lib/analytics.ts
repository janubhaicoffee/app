// src/lib/analytics.ts
// Lightweight event tracking engine for Janu Bhai Coffee.
// Wraps any backend (PostHog, GA, custom endpoint) behind a single API.

type AnalyticsBackend = {
  track: (event: string, properties?: Record<string, unknown>) => void;
  identify: (userId: string, traits?: Record<string, unknown>) => void;
  page: (name: string) => void;
};

let backend: AnalyticsBackend | null = null;

export function initAnalytics() {
  // In production, replace this with PostHog, Mixpanel, etc.
  // For now, we use a console-based dev backend.
  backend = {
    track: (event, properties) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[JB Analytics] TRACK: ${event}`, properties);
      }
      // Production: posthog.capture(event, properties);
    },
    identify: (userId, traits) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[JB Analytics] IDENTIFY: ${userId}`, traits);
      }
    },
    page: (name) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[JB Analytics] PAGE: ${name}`);
      }
    },
  };
}

function getBackend(): AnalyticsBackend {
  if (!backend) {
    initAnalytics();
  }
  return backend!;
}

// ─── Business Event Trackers ────────────────────────────────────

export function trackPoshtikOrder(
  source: 'POS' | 'ZOMATO' | 'SWIGGY' | 'APP',
  item: 'hot' | 'cold',
  timeOfDay: string
) {
  getBackend().track('poshtik_order', { source, item, timeOfDay });
}

export function trackMascotInteraction(state: 'idle' | 'loading' | 'success' | 'hover' | 'peek') {
  getBackend().track('mascot_interaction', { state });
}

export function trackHardwareFailure(outletId: string, device: 'printer' | 'cash_drawer') {
  getBackend().track('hardware_failure', { outletId, device, severity: 'critical' });
}

export function trackCultReferral(userId: string) {
  getBackend().track('cult_referral_shared', { userId });
}

export function trackPageView(pageName: string) {
  getBackend().page(pageName);
}

export function identifyUser(userId: string, traits?: Record<string, unknown>) {
  getBackend().identify(userId, traits);
}

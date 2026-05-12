"use client";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { AnalyticsProvider } from "@/components/providers/AnalyticsProvider";
import { I18nProvider } from "@/lib/i18n/useI18n";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <I18nProvider>
          <AnalyticsProvider>{children}</AnalyticsProvider>
        </I18nProvider>
      </CartProvider>
    </AuthProvider>
  );
}

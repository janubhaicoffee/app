// src/lib/utils/currency.ts
// Strict INR formatter — eliminates all $ signs from the ecosystem.

const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

/**
 * Formats a number as Indian Rupees (₹).
 * Uses Intl.NumberFormat('en-IN') for proper lakh/crore grouping.
 *
 * @example formatINR(20)       → "₹20"
 * @example formatINR(150000)   → "₹1,50,000"
 * @example formatINR(0)        → "₹0"
 */
export function formatINR(amount: number): string {
  return INR_FORMATTER.format(amount);
}

/**
 * Raw ₹ symbol prefix — for cases where Intl formatting adds unwanted spaces.
 * Use formatINR() for all display-facing values.
 */
export function rawINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

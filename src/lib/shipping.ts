import type { DeliverySettings } from "./types";

// Compute the delivery charge for an order.
// - Free when the subtotal meets the (enabled) free-delivery threshold.
// - Otherwise a region-specific charge if the address state matches, else the
//   default charge.
export function computeShipping(
  subtotal: number,
  settings: DeliverySettings,
  state?: string
): number {
  if (subtotal <= 0) return 0;
  if (settings.freeDeliveryThreshold > 0 && subtotal >= settings.freeDeliveryThreshold) {
    return 0;
  }
  if (state) {
    const match = settings.regions.find(
      (r) => r.region.trim().toLowerCase() === state.trim().toLowerCase()
    );
    if (match) return match.charge;
  }
  return settings.defaultCharge;
}

// Amount still needed to unlock free delivery (0 if already unlocked/disabled).
export function amountToFreeDelivery(subtotal: number, settings: DeliverySettings): number {
  if (settings.freeDeliveryThreshold <= 0) return 0;
  return Math.max(0, settings.freeDeliveryThreshold - subtotal);
}

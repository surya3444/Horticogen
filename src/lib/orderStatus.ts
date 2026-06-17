import type { OrderStatus, PaymentStatus } from "@/lib/types";

export const ORDER_STATUSES: OrderStatus[] = [
  "placed",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
];

export const orderStatusLabel: Record<OrderStatus, string> = {
  placed: "Order Placed",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const orderStatusTone: Record<OrderStatus, "neutral" | "leaf" | "terracotta" | "amber" | "red"> = {
  placed: "neutral",
  confirmed: "terracotta",
  packed: "amber",
  shipped: "terracotta",
  delivered: "leaf",
  cancelled: "red",
};

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  pending: "Payment Pending",
  verified: "Payment Verified",
  rejected: "Payment Rejected",
};

export const paymentStatusTone: Record<PaymentStatus, "amber" | "leaf" | "red"> = {
  pending: "amber",
  verified: "leaf",
  rejected: "red",
};

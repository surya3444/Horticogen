import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(ts: number): string {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(ts: number): string {
  if (!ts) return "";
  return new Date(ts).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function discountPercent(price: number, compareAt?: number): number {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function genId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function getAdminEmails(): string[] {
  return (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  query,
  orderBy,
  increment,
} from "firebase/firestore";
import { db } from "./client";
import { slugify } from "@/lib/utils";
import type { Product } from "@/lib/types";

// ---- Types ----
export interface ProductMetric {
  id: string; // = productId
  productId: string;
  name: string;
  slug: string;
  image: string;
  views: number;
  outOfStockViews: number;
  notifyRequests: number;
  lastViewedAt: number;
}

export interface SearchTerm {
  id: string; // slug of term
  term: string;
  count: number;
  lastResultsCount: number;
  lastAt: number;
}

export interface StockRequest {
  id: string;
  productId: string;
  productName: string;
  email: string;
  userId: string;
  at: number;
}

// ---- Recorders (called from the storefront) ----

// Count a product view. Bumps out-of-stock views too so demand for sold-out
// items is visible.
export async function recordProductView(product: Product) {
  const allOut = product.variants.every((v) => v.stock <= 0);
  try {
    await setDoc(
      doc(db, "productMetrics", product.id),
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        image: product.images[0] || "",
        views: increment(1),
        outOfStockViews: increment(allOut ? 1 : 0),
        lastViewedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (e) {
    console.error("recordProductView failed", e);
  }
}

// Aggregate a search term (one doc per normalized term, with a hit counter).
export async function recordSearch(term: string, resultsCount: number) {
  const key = slugify(term);
  if (!key) return;
  try {
    await setDoc(
      doc(db, "searchTerms", key),
      {
        term: term.trim(),
        count: increment(1),
        lastResultsCount: resultsCount,
        lastAt: Date.now(),
      },
      { merge: true }
    );
  } catch (e) {
    console.error("recordSearch failed", e);
  }
}

// Record interest in an out-of-stock product ("notify me when back").
export async function recordStockRequest(
  product: Product,
  email: string,
  userId: string
) {
  try {
    await addDoc(collection(db, "stockRequests"), {
      productId: product.id,
      productName: product.name,
      email,
      userId,
      at: Date.now(),
    });
    await setDoc(
      doc(db, "productMetrics", product.id),
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        image: product.images[0] || "",
        notifyRequests: increment(1),
      },
      { merge: true }
    );
  } catch (e) {
    console.error("recordStockRequest failed", e);
    throw e;
  }
}

// ---- Readers (admin) ----
export async function listProductMetrics(): Promise<ProductMetric[]> {
  const snap = await getDocs(query(collection(db, "productMetrics"), orderBy("views", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ProductMetric, "id">) }));
}

export async function listSearchTerms(): Promise<SearchTerm[]> {
  const snap = await getDocs(query(collection(db, "searchTerms"), orderBy("count", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SearchTerm, "id">) }));
}

export async function listStockRequests(): Promise<StockRequest[]> {
  const snap = await getDocs(query(collection(db, "stockRequests"), orderBy("at", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<StockRequest, "id">) }));
}

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as fbLimit,
} from "firebase/firestore";
import { db } from "./client";
import type { Product } from "@/lib/types";
import { slugify } from "@/lib/utils";

const col = () => collection(db, "products");

function fromDoc(id: string, data: Record<string, unknown>): Product {
  return { id, ...(data as Omit<Product, "id">) };
}

export async function listProducts(opts?: {
  activeOnly?: boolean;
}): Promise<Product[]> {
  const snap = await getDocs(query(col(), orderBy("createdAt", "desc")));
  let items = snap.docs.map((d) => fromDoc(d.id, d.data()));
  if (opts?.activeOnly) items = items.filter((p) => p.status === "active");
  return items;
}

export async function getProduct(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, "products", id));
  if (!snap.exists()) return null;
  return fromDoc(snap.id, snap.data());
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const snap = await getDocs(query(col(), where("slug", "==", slug), fbLimit(1)));
  if (snap.empty) return null;
  return fromDoc(snap.docs[0].id, snap.docs[0].data());
}

// Products in a category OR any of its descendants (categoryIds list).
export async function listProductsByCategories(
  categoryIds: string[]
): Promise<Product[]> {
  if (!categoryIds.length) return [];
  const all = await listProducts({ activeOnly: true });
  const set = new Set(categoryIds);
  return all.filter(
    (p) => set.has(p.categoryId) || p.categoryAncestors.some((a) => set.has(a))
  );
}

export async function listFeatured(max = 8): Promise<Product[]> {
  const all = await listProducts({ activeOnly: true });
  return all.filter((p) => p.featured).slice(0, max);
}

export async function createProduct(
  input: Omit<Product, "id" | "slug" | "ratingAvg" | "ratingCount" | "createdAt">
): Promise<string> {
  const payload: Omit<Product, "id"> = {
    ...input,
    slug: slugify(input.name) + "-" + Math.random().toString(36).slice(2, 6),
    ratingAvg: 0,
    ratingCount: 0,
    createdAt: Date.now(),
  };
  const ref = await addDoc(col(), payload);
  return ref.id;
}

export async function updateProduct(id: string, data: Partial<Product>) {
  await updateDoc(doc(db, "products", id), data);
}

export async function deleteProduct(id: string) {
  await deleteDoc(doc(db, "products", id));
}

// Relevance score for a product against the search tokens.
// Every token must match at least one field (AND); the total is weighted by
// where each token matched (name > badges > variants > descriptions).
function scoreProduct(p: Product, tokens: string[]): number {
  const name = p.name.toLowerCase();
  const badges = p.badges.join(" ").toLowerCase();
  const variants = p.variants.map((v) => v.name).join(" ").toLowerCase();
  const desc = (p.description || "").toLowerCase();
  const sci = (p.scientificDescription || "").toLowerCase();

  let total = 0;
  for (const t of tokens) {
    let best = 0;
    if (name.includes(t)) best = name.startsWith(t) ? 6 : 5;
    else if (badges.includes(t)) best = 3;
    else if (variants.includes(t)) best = 2;
    else if (desc.includes(t) || sci.includes(t)) best = 1;
    if (best === 0) return 0; // this token matched nothing -> not a result
    total += best;
  }
  // Small boost when the whole phrase appears in the name.
  if (name.includes(tokens.join(" "))) total += 4;
  return total;
}

export async function searchProducts(term: string): Promise<Product[]> {
  const q = term.trim().toLowerCase();
  if (!q) return [];
  const tokens = q.split(/\s+/).filter(Boolean);
  const all = await listProducts({ activeOnly: true });
  return all
    .map((p) => ({ p, score: scoreProduct(p, tokens) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.p.ratingCount - a.p.ratingCount)
    .map((x) => x.p);
}

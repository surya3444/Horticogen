import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  runTransaction,
} from "firebase/firestore";
import { db } from "./client";
import type { Review } from "@/lib/types";

const col = () => collection(db, "reviews");

function fromDoc(id: string, data: Record<string, unknown>): Review {
  return { id, ...(data as Omit<Review, "id">) };
}

export async function listProductReviews(
  productId: string,
  includeHidden = false
): Promise<Review[]> {
  const snap = await getDocs(
    query(col(), where("productId", "==", productId), orderBy("createdAt", "desc"))
  );
  const all = snap.docs.map((d) => fromDoc(d.id, d.data()));
  return includeHidden ? all : all.filter((r) => r.status === "published");
}

export async function listAllReviews(): Promise<Review[]> {
  const snap = await getDocs(query(col(), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => fromDoc(d.id, d.data()));
}

export async function userReviewForProduct(
  userId: string,
  productId: string
): Promise<Review | null> {
  const snap = await getDocs(
    query(col(), where("productId", "==", productId), where("userId", "==", userId))
  );
  if (snap.empty) return null;
  return fromDoc(snap.docs[0].id, snap.docs[0].data());
}

// Create a review and atomically update the product's aggregate rating.
export async function createReview(
  input: Omit<Review, "id" | "status" | "createdAt">
): Promise<string> {
  const reviewRef = doc(col());
  const productRef = doc(db, "products", input.productId);

  await runTransaction(db, async (tx) => {
    const prod = await tx.get(productRef);
    if (!prod.exists()) throw new Error("Product not found");
    const data = prod.data();
    const count = (data.ratingCount as number) || 0;
    const avg = (data.ratingAvg as number) || 0;
    const newCount = count + 1;
    const newAvg = (avg * count + input.rating) / newCount;

    tx.set(reviewRef, {
      ...input,
      status: "published",
      createdAt: Date.now(),
    });
    tx.update(productRef, {
      ratingCount: newCount,
      ratingAvg: Math.round(newAvg * 10) / 10,
    });
  });
  return reviewRef.id;
}

export async function setReviewStatus(id: string, status: Review["status"]) {
  await updateDoc(doc(db, "reviews", id), { status });
}

export async function deleteReview(id: string) {
  await deleteDoc(doc(db, "reviews", id));
}

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "./client";
import type { Order, OrderStatus, PaymentStatus } from "@/lib/types";

const col = () => collection(db, "orders");

function fromDoc(id: string, data: Record<string, unknown>): Order {
  return { id, ...(data as Omit<Order, "id">) };
}

export async function createOrder(
  input: Omit<Order, "id" | "paymentStatus" | "orderStatus" | "statusHistory" | "createdAt">
): Promise<string> {
  const now = Date.now();
  const payload: Omit<Order, "id"> = {
    ...input,
    paymentStatus: "pending",
    orderStatus: "placed",
    statusHistory: [{ status: "placed", at: now }],
    createdAt: now,
  };
  const ref = await addDoc(col(), payload);
  return ref.id;
}

export async function getOrder(id: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, "orders", id));
  if (!snap.exists()) return null;
  return fromDoc(snap.id, snap.data());
}

export async function listUserOrders(userId: string): Promise<Order[]> {
  const snap = await getDocs(
    query(col(), where("userId", "==", userId), orderBy("createdAt", "desc"))
  );
  return snap.docs.map((d) => fromDoc(d.id, d.data()));
}

export async function listAllOrders(): Promise<Order[]> {
  const snap = await getDocs(query(col(), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => fromDoc(d.id, d.data()));
}

export async function updatePaymentStatus(id: string, status: PaymentStatus) {
  await updateDoc(doc(db, "orders", id), { paymentStatus: status });
}

export async function updateOrderStatus(
  order: Order,
  status: OrderStatus,
  note?: string
) {
  const event = { status, at: Date.now(), ...(note ? { note } : {}) };
  await updateDoc(doc(db, "orders", order.id), {
    orderStatus: status,
    statusHistory: [...order.statusHistory, event],
  });
}

export async function setAdminNote(id: string, adminNote: string) {
  await updateDoc(doc(db, "orders", id), { adminNote });
}

// Has the user purchased this product? (used to gate reviews)
export async function hasPurchased(
  userId: string,
  productId: string
): Promise<string | null> {
  const orders = await listUserOrders(userId);
  for (const o of orders) {
    if (o.items.some((i) => i.productId === productId)) return o.id;
  }
  return null;
}

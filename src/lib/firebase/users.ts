import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./client";
import type { Address, UserProfile, UserRole } from "@/lib/types";
import { getAdminEmails } from "@/lib/utils";

const usersCol = () => collection(db, "users");

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return { uid, ...(snap.data() as Omit<UserProfile, "uid">) };
}

export async function ensureUserProfile(
  uid: string,
  email: string,
  name: string
): Promise<UserProfile> {
  const existing = await getUserProfile(uid);
  if (existing) return existing;

  const role: UserRole = getAdminEmails().includes(email.toLowerCase())
    ? "admin"
    : "customer";

  const profile: Omit<UserProfile, "uid"> = {
    name,
    email,
    phone: "",
    addresses: [],
    role,
    createdAt: Date.now(),
  };
  await setDoc(doc(db, "users", uid), profile);
  return { uid, ...profile };
}

export async function updateUserProfile(
  uid: string,
  data: Partial<Pick<UserProfile, "name" | "phone" | "addresses">>
) {
  await updateDoc(doc(db, "users", uid), data);
}

export async function saveAddresses(uid: string, addresses: Address[]) {
  await updateDoc(doc(db, "users", uid), { addresses });
}

export async function listUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(query(usersCol(), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<UserProfile, "uid">) }));
}

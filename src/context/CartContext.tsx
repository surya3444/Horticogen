"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "./AuthContext";
import type { CartItem } from "@/lib/types";

const LS_KEY = "horticogen_cart";

interface CartState {
  items: CartItem[];
  count: number;
  subtotal: number;
  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;
  addItem: (item: CartItem) => void;
  updateQty: (productId: string, variantId: string, qty: number) => void;
  removeItem: (productId: string, variantId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartState | undefined>(undefined);

function readLocal(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Initial hydrate from localStorage.
  useEffect(() => {
    setItems(readLocal());
    setHydrated(true);
  }, []);

  // On login, merge local cart into Firestore cart and load.
  useEffect(() => {
    if (loading || !hydrated) return;
    if (!user) return;
    (async () => {
      const ref = doc(db, "carts", user.uid);
      const snap = await getDoc(ref);
      const remote: CartItem[] = snap.exists()
        ? (snap.data().items as CartItem[]) || []
        : [];
      const merged = mergeCarts(remote, readLocal());
      setItems(merged);
      await setDoc(ref, { items: merged, updatedAt: Date.now() });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, hydrated]);

  // Persist on change.
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(LS_KEY, JSON.stringify(items));
    if (user) {
      setDoc(doc(db, "carts", user.uid), { items, updatedAt: Date.now() }).catch(
        () => {}
      );
    }
  }, [items, user, hydrated]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const idx = prev.findIndex(
        (i) => i.productId === item.productId && i.variantId === item.variantId
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + item.qty };
        return next;
      }
      return [...prev, item];
    });
    setDrawerOpen(true);
  }, []);

  const updateQty = useCallback(
    (productId: string, variantId: string, qty: number) => {
      setItems((prev) =>
        prev
          .map((i) =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, qty: Math.max(0, qty) }
              : i
          )
          .filter((i) => i.qty > 0)
      );
    },
    []
  );

  const removeItem = useCallback((productId: string, variantId: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.variantId === variantId))
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const { count, subtotal } = useMemo(() => {
    return {
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal: items.reduce((s, i) => s + i.price * i.qty, 0),
    };
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        subtotal,
        drawerOpen,
        setDrawerOpen,
        addItem,
        updateQty,
        removeItem,
        clear,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

function mergeCarts(a: CartItem[], b: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>();
  [...a, ...b].forEach((item) => {
    const key = `${item.productId}:${item.variantId}`;
    if (map.has(key)) {
      map.set(key, { ...item, qty: map.get(key)!.qty + item.qty });
    } else {
      map.set(key, { ...item });
    }
  });
  return Array.from(map.values());
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

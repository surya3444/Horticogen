"use client";

import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useSite } from "@/context/SiteContext";
import { Button } from "@/components/ui/Button";
import { formatINR } from "@/lib/utils";

export function CartDrawer() {
  const { items, subtotal, drawerOpen, setDrawerOpen, updateQty, removeItem } = useCart();
  const { general } = useSite();

  if (!drawerOpen) return null;

  const remaining = general.freeDeliveryThreshold - subtotal;

  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-ink/40" onClick={() => setDrawerOpen(false)} />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl animate-slide-in-right">
        <div className="flex items-center justify-between border-b border-sand p-4">
          <h3 className="font-display text-lg font-semibold">
            Your Cart ({items.length})
          </h3>
          <button onClick={() => setDrawerOpen(false)}>
            <X size={22} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <ShoppingBag className="h-12 w-12 text-sand" />
            <p className="text-muted">Your cart is empty.</p>
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>
              Continue shopping
            </Button>
          </div>
        ) : (
          <>
            {remaining > 0 && (
              <p className="bg-leaf-50 px-4 py-2 text-center text-xs text-leaf-700">
                Add {formatINR(remaining)} more for free delivery 🚚
              </p>
            )}
            <div className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={`${item.productId}:${item.variantId}`} className="flex gap-3">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-cream">
                      {item.image && (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <Link
                        href={`/p/${item.slug}`}
                        onClick={() => setDrawerOpen(false)}
                        className="text-sm font-medium leading-tight hover:text-terracotta-600"
                      >
                        {item.name}
                      </Link>
                      <span className="text-xs text-muted">{item.variantName}</span>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-2 rounded-full border border-sand">
                          <button
                            className="grid h-7 w-7 place-items-center text-muted hover:text-ink"
                            onClick={() => updateQty(item.productId, item.variantId, item.qty - 1)}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-5 text-center text-sm">{item.qty}</span>
                          <button
                            className="grid h-7 w-7 place-items-center text-muted hover:text-ink"
                            onClick={() => updateQty(item.productId, item.variantId, item.qty + 1)}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="text-sm font-semibold">{formatINR(item.price * item.qty)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="text-muted hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-sand p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-muted">Subtotal</span>
                <span className="font-display text-lg font-semibold">{formatINR(subtotal)}</span>
              </div>
              <Link href="/checkout" onClick={() => setDrawerOpen(false)}>
                <Button fullWidth size="lg">
                  Checkout
                </Button>
              </Link>
              <Link href="/cart" onClick={() => setDrawerOpen(false)}>
                <Button fullWidth variant="ghost" className="mt-2">
                  View full cart
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

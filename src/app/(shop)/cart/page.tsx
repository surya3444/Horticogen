"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useSite } from "@/context/SiteContext";
import { formatINR } from "@/lib/utils";

export default function CartPage() {
  const { items, subtotal, updateQty, removeItem } = useCart();
  const { general } = useSite();
  const shipping = subtotal >= general.freeDeliveryThreshold || subtotal === 0 ? 0 : 49;

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
        <ShoppingBag className="h-14 w-14 text-sand" />
        <h1 className="font-display text-2xl font-bold">Your cart is empty</h1>
        <p className="text-muted">Looks like you haven&apos;t added anything yet.</p>
        <Link href="/"><Button size="lg">Start shopping</Button></Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
      <h1 className="font-display text-2xl font-bold">Shopping Cart</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={`${item.productId}:${item.variantId}`} className="flex gap-4 rounded-2xl border border-sand bg-white p-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-cream">
                {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
              </div>
              <div className="flex flex-1 flex-col">
                <Link href={`/p/${item.slug}`} className="font-medium hover:text-terracotta-600">{item.name}</Link>
                <span className="text-sm text-muted">{item.variantName}</span>
                <span className="text-sm font-semibold">{formatINR(item.price)}</span>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-center rounded-full border border-sand">
                    <button className="grid h-8 w-8 place-items-center text-muted hover:text-ink" onClick={() => updateQty(item.productId, item.variantId, item.qty - 1)}><Minus size={14} /></button>
                    <span className="w-6 text-center text-sm">{item.qty}</span>
                    <button className="grid h-8 w-8 place-items-center text-muted hover:text-ink" onClick={() => updateQty(item.productId, item.variantId, item.qty + 1)}><Plus size={14} /></button>
                  </div>
                  <button onClick={() => removeItem(item.productId, item.variantId)} className="inline-flex items-center gap-1 text-sm text-red-600 hover:underline">
                    <Trash2 size={15} /> Remove
                  </button>
                </div>
              </div>
              <div className="hidden font-display font-semibold sm:block">{formatINR(item.price * item.qty)}</div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="h-fit rounded-2xl border border-sand bg-white p-5">
          <h2 className="font-display text-lg font-semibold">Order Summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-muted"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
            <div className="flex justify-between text-muted"><span>Shipping</span><span>{shipping === 0 ? "Free" : formatINR(shipping)}</span></div>
            <div className="flex justify-between border-t border-sand pt-2 font-display text-base font-semibold"><span>Total</span><span>{formatINR(subtotal + shipping)}</span></div>
          </div>
          <Link href="/checkout"><Button fullWidth size="lg" className="mt-5">Proceed to checkout</Button></Link>
          <Link href="/"><Button fullWidth variant="ghost" className="mt-2">Continue shopping</Button></Link>
        </div>
      </div>
    </div>
  );
}

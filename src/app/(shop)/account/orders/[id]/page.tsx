"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, CheckCircle2, Circle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { getOrder } from "@/lib/firebase/orders";
import { formatINR, formatDateTime } from "@/lib/utils";
import {
  ORDER_STATUSES,
  orderStatusLabel,
  paymentStatusLabel,
  paymentStatusTone,
} from "@/lib/orderStatus";
import type { Order, OrderStatus } from "@/lib/types";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(id).then((o) => {
      setOrder(o);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <PageLoader />;
  if (!order || (user && order.userId !== user.uid)) {
    return <p className="py-10 text-center text-muted">Order not found.</p>;
  }

  const timeline: OrderStatus[] = ORDER_STATUSES.filter((s) => s !== "cancelled");
  const currentIdx = timeline.indexOf(order.orderStatus);
  const cancelled = order.orderStatus === "cancelled";

  return (
    <div className="space-y-6">
      <Link href="/account/orders" className="inline-flex items-center gap-1 text-sm text-muted hover:text-terracotta-600">
        <ChevronLeft size={16} /> Back to orders
      </Link>

      <div className="rounded-2xl border border-sand bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-semibold">Order #{order.id.slice(0, 8)}</h2>
            <p className="text-xs text-muted">{formatDateTime(order.createdAt)}</p>
          </div>
          <Badge tone={paymentStatusTone[order.paymentStatus]}>{paymentStatusLabel[order.paymentStatus]}</Badge>
        </div>

        {/* Timeline */}
        {cancelled ? (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">This order was cancelled.</p>
        ) : (
          <div className="mt-6 flex justify-between">
            {timeline.map((s, i) => (
              <div key={s} className="flex flex-1 flex-col items-center text-center">
                <div className="flex w-full items-center">
                  <div className={`h-0.5 flex-1 ${i === 0 ? "bg-transparent" : i <= currentIdx ? "bg-leaf-500" : "bg-sand"}`} />
                  {i <= currentIdx ? (
                    <CheckCircle2 size={22} className="text-leaf-600" />
                  ) : (
                    <Circle size={22} className="text-sand" />
                  )}
                  <div className={`h-0.5 flex-1 ${i === timeline.length - 1 ? "bg-transparent" : i < currentIdx ? "bg-leaf-500" : "bg-sand"}`} />
                </div>
                <span className={`mt-1 text-[11px] ${i <= currentIdx ? "font-medium text-ink" : "text-muted"}`}>
                  {orderStatusLabel[s]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Items */}
      <div className="rounded-2xl border border-sand bg-white p-5">
        <h3 className="mb-3 font-semibold">Items</h3>
        <ul className="divide-y divide-sand">
          {order.items.map((it) => (
            <li key={it.variantId} className="flex gap-3 py-3">
              <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-cream">
                {it.image && <Image src={it.image} alt="" fill className="object-cover" />}
              </div>
              <div className="flex-1">
                <Link href={`/p/${it.slug}`} className="text-sm font-medium hover:text-terracotta-600">{it.name}</Link>
                <p className="text-xs text-muted">{it.variantName} × {it.qty}</p>
              </div>
              <span className="text-sm font-semibold">{formatINR(it.price * it.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1 border-t border-sand pt-3 text-sm">
          <div className="flex justify-between text-muted"><span>Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
          <div className="flex justify-between text-muted"><span>Shipping</span><span>{order.shipping === 0 ? "Free" : formatINR(order.shipping)}</span></div>
          <div className="flex justify-between font-display text-base font-semibold"><span>Total</span><span>{formatINR(order.total)}</span></div>
        </div>
      </div>

      {/* Address + payment */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-sand bg-white p-5">
          <h3 className="mb-2 font-semibold">Shipping address</h3>
          <p className="text-sm text-muted">
            {order.shippingAddress.label}<br />
            {order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}<br />
            {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}<br />
            📞 {order.shippingAddress.phone}
          </p>
        </div>
        <div className="rounded-2xl border border-sand bg-white p-5">
          <h3 className="mb-2 font-semibold">Payment</h3>
          <p className="text-sm text-muted">
            Method: <span className="uppercase">{order.paymentMethod}</span><br />
            Transaction ID: <span className="font-mono text-ink">{order.transactionId}</span><br />
            Status: {paymentStatusLabel[order.paymentStatus]}
          </p>
        </div>
      </div>
    </div>
  );
}

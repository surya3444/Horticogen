"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { listUserOrders } from "@/lib/firebase/orders";
import { formatINR, formatDate } from "@/lib/utils";
import { orderStatusLabel, orderStatusTone, paymentStatusLabel, paymentStatusTone } from "@/lib/orderStatus";
import type { Order } from "@/lib/types";

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    listUserOrders(user.uid).then((o) => {
      setOrders(o);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-sand bg-white py-16 text-center">
        <Package className="h-10 w-10 text-sand" />
        <p className="text-muted">You haven&apos;t placed any orders yet.</p>
        <Link href="/" className="font-medium text-terracotta-600 hover:underline">Start shopping →</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((o) => (
        <Link
          key={o.id}
          href={`/account/orders/${o.id}`}
          className="block rounded-2xl border border-sand bg-white p-5 transition hover:shadow-md"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm text-muted">Order <span className="font-mono">#{o.id.slice(0, 8)}</span></p>
              <p className="text-xs text-muted">{formatDate(o.createdAt)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone={paymentStatusTone[o.paymentStatus]}>{paymentStatusLabel[o.paymentStatus]}</Badge>
              <Badge tone={orderStatusTone[o.orderStatus]}>{orderStatusLabel[o.orderStatus]}</Badge>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex -space-x-3">
              {o.items.slice(0, 4).map((it) => (
                <div key={it.variantId} className="relative h-12 w-12 overflow-hidden rounded-lg border-2 border-white bg-cream">
                  {it.image && <Image src={it.image} alt="" fill className="object-cover" />}
                </div>
              ))}
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm text-muted">{o.items.reduce((n, i) => n + i.qty, 0)} item(s)</p>
              <p className="font-display text-lg font-semibold">{formatINR(o.total)}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

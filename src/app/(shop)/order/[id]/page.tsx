"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";
import { getOrder } from "@/lib/firebase/orders";
import { formatINR } from "@/lib/utils";
import { paymentStatusLabel, paymentStatusTone } from "@/lib/orderStatus";
import type { Order } from "@/lib/types";

export default function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(id).then((o) => {
      setOrder(o);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <PageLoader />;
  if (!order) return <p className="py-20 text-center text-muted">Order not found.</p>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 lg:px-6">
      <div className="rounded-3xl border border-sand bg-white p-8 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-leaf-100">
          <CheckCircle2 className="h-9 w-9 text-leaf-600" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold">Thank you for your order! 🌱</h1>
        <p className="mt-1 text-muted">
          Order <span className="font-mono">#{order.id.slice(0, 8)}</span> has been placed.
        </p>
        <div className="mt-3">
          <Badge tone={paymentStatusTone[order.paymentStatus]}>{paymentStatusLabel[order.paymentStatus]}</Badge>
        </div>
        <p className="mx-auto mt-4 max-w-md text-sm text-muted">
          We&apos;ve received your payment reference <span className="font-mono text-ink">{order.transactionId}</span>.
          Our team will verify it shortly and update your order status. You can track it anytime from your account.
        </p>

        <div className="mt-6 rounded-2xl bg-cream p-4 text-left">
          <ul className="space-y-3">
            {order.items.map((it) => (
              <li key={it.variantId} className="flex items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-white">
                  {it.image && <Image src={it.image} alt="" fill className="object-cover" />}
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium">{it.name}</p>
                  <p className="text-xs text-muted">{it.variantName} × {it.qty}</p>
                </div>
                <span className="text-sm font-medium">{formatINR(it.price * it.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-sand pt-3 font-display font-semibold">
            <span>Total</span><span>{formatINR(order.total)}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href={`/account/orders/${order.id}`}><Button>Track order</Button></Link>
          <Link href="/"><Button variant="outline">Continue shopping</Button></Link>
        </div>
      </div>
    </div>
  );
}

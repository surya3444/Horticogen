"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { AdminHeader, Card } from "@/components/admin/ui";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Spinner";
import { listAllOrders } from "@/lib/firebase/orders";
import { formatINR, formatDate, cn } from "@/lib/utils";
import { orderStatusLabel, orderStatusTone, paymentStatusLabel, paymentStatusTone } from "@/lib/orderStatus";
import type { Order, PaymentStatus } from "@/lib/types";

const filters: { key: PaymentStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "verified", label: "Verified" },
  { key: "rejected", label: "Rejected" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PaymentStatus | "all">("all");

  useEffect(() => {
    listAllOrders().then((o) => { setOrders(o); setLoading(false); });
  }, []);

  const shown = filter === "all" ? orders : orders.filter((o) => o.paymentStatus === filter);

  return (
    <>
      <AdminHeader title="Orders" description="Verify payments and update fulfilment status." />

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium",
              filter === f.key ? "border-terracotta-500 bg-terracotta-50 text-terracotta-700" : "border-sand bg-white text-muted hover:border-terracotta-300"
            )}
          >
            {f.label}
            {f.key !== "all" && (
              <span className="ml-1.5 text-xs">({orders.filter((o) => o.paymentStatus === f.key).length})</span>
            )}
          </button>
        ))}
      </div>

      <Card>
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
        ) : shown.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center text-muted">
            <ShoppingCart className="h-10 w-10 text-sand" />
            <p>No orders here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sand text-left text-muted">
                  <th className="pb-2 font-medium">Order</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Total</th>
                  <th className="pb-2 font-medium">Payment</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((o) => (
                  <tr key={o.id} className="border-b border-sand/60 last:border-0 hover:bg-cream">
                    <td className="py-3">
                      <Link href={`/admin/orders/${o.id}`} className="font-mono text-terracotta-600 hover:underline">#{o.id.slice(0, 8)}</Link>
                    </td>
                    <td className="py-3 text-muted">{o.userEmail}</td>
                    <td className="py-3 text-muted">{formatDate(o.createdAt)}</td>
                    <td className="py-3 font-medium">{formatINR(o.total)}</td>
                    <td className="py-3"><Badge tone={paymentStatusTone[o.paymentStatus]}>{paymentStatusLabel[o.paymentStatus]}</Badge></td>
                    <td className="py-3"><Badge tone={orderStatusTone[o.orderStatus]}>{orderStatusLabel[o.orderStatus]}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}

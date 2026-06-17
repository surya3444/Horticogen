"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IndianRupee, ShoppingCart, Package, Users, Clock } from "lucide-react";
import { AdminHeader, Card, StatCard } from "@/components/admin/ui";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Spinner";
import { listAllOrders } from "@/lib/firebase/orders";
import { listProducts } from "@/lib/firebase/products";
import { listUsers } from "@/lib/firebase/users";
import { formatINR, formatDate } from "@/lib/utils";
import { orderStatusLabel, orderStatusTone, paymentStatusLabel, paymentStatusTone } from "@/lib/orderStatus";
import type { Order } from "@/lib/types";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [counts, setCounts] = useState({ products: 0, customers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [o, p, u] = await Promise.all([listAllOrders(), listProducts(), listUsers()]);
      setOrders(o);
      setCounts({ products: p.length, customers: u.filter((x) => x.role === "customer").length });
      setLoading(false);
    })();
  }, []);

  const revenue = orders
    .filter((o) => o.paymentStatus === "verified")
    .reduce((s, o) => s + o.total, 0);
  const pendingPayments = orders.filter((o) => o.paymentStatus === "pending").length;

  if (loading) {
    return (
      <>
        <AdminHeader title="Dashboard" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader title="Dashboard" description="Overview of your store" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Verified revenue" value={formatINR(revenue)} icon={IndianRupee} tone="leaf" />
        <StatCard label="Total orders" value={orders.length} icon={ShoppingCart} tone="terracotta" />
        <StatCard label="Products" value={counts.products} icon={Package} tone="ink" />
        <StatCard label="Customers" value={counts.customers} icon={Users} tone="ink" />
      </div>

      {pendingPayments > 0 && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <Clock size={18} />
          <span><strong>{pendingPayments}</strong> order(s) awaiting payment verification.</span>
          <Link href="/admin/orders" className="ml-auto font-medium underline">Review now</Link>
        </div>
      )}

      <Card className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-terracotta-600 hover:underline">View all →</Link>
        </div>
        {orders.length === 0 ? (
          <p className="py-8 text-center text-muted">No orders yet.</p>
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
                {orders.slice(0, 8).map((o) => (
                  <tr key={o.id} className="border-b border-sand/60 last:border-0">
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

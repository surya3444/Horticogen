"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Check, X } from "lucide-react";
import { AdminHeader, Card } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select, Textarea } from "@/components/ui/Input";
import { PageLoader } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import {
  getOrder,
  updatePaymentStatus,
  updateOrderStatus,
  setAdminNote,
} from "@/lib/firebase/orders";
import { formatINR, formatDateTime } from "@/lib/utils";
import {
  ORDER_STATUSES,
  orderStatusLabel,
  orderStatusTone,
  paymentStatusLabel,
  paymentStatusTone,
} from "@/lib/orderStatus";
import type { Order, OrderStatus } from "@/lib/types";

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const o = await getOrder(id);
    setOrder(o);
    setNote(o?.adminNote || "");
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  if (loading) return <PageLoader />;
  if (!order) return <p className="py-10 text-center text-muted">Order not found.</p>;

  const setPayment = async (status: Order["paymentStatus"]) => {
    setBusy(true);
    try {
      await updatePaymentStatus(order.id, status);
      // Auto-advance to "confirmed" once a payment is verified.
      if (status === "verified" && order.orderStatus === "placed") {
        await updateOrderStatus(order, "confirmed", "Payment verified");
      }
      toast("Payment status updated", "success");
      await load();
    } catch {
      toast("Update failed", "error");
    } finally {
      setBusy(false);
    }
  };

  const setStatus = async (status: OrderStatus) => {
    setBusy(true);
    try {
      await updateOrderStatus(order, status);
      toast("Order status updated", "success");
      await load();
    } catch {
      toast("Update failed", "error");
    } finally {
      setBusy(false);
    }
  };

  const saveNote = async () => {
    setBusy(true);
    try {
      await setAdminNote(order.id, note);
      toast("Note saved", "success");
    } catch {
      toast("Could not save note", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Link href="/admin/orders" className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-terracotta-600">
        <ChevronLeft size={16} /> Back to orders
      </Link>
      <AdminHeader
        title={`Order #${order.id.slice(0, 8)}`}
        description={`${order.userEmail} · ${formatDateTime(order.createdAt)}`}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Items */}
          <Card>
            <h3 className="mb-3 font-display font-semibold">Items</h3>
            <ul className="divide-y divide-sand">
              {order.items.map((it) => (
                <li key={it.variantId} className="flex gap-3 py-3">
                  <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-cream">
                    {it.image && <Image src={it.image} alt="" fill className="object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{it.name}</p>
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
          </Card>

          {/* Shipping */}
          <Card>
            <h3 className="mb-2 font-display font-semibold">Shipping address</h3>
            <p className="text-sm text-muted">
              {order.shippingAddress.label}<br />
              {order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}<br />
              📞 {order.shippingAddress.phone}
            </p>
          </Card>

          {/* History */}
          <Card>
            <h3 className="mb-3 font-display font-semibold">Status history</h3>
            <ul className="space-y-2 text-sm">
              {order.statusHistory.map((e, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Badge tone={orderStatusTone[e.status]}>{orderStatusLabel[e.status]}</Badge>
                  <span className="text-muted">{formatDateTime(e.at)}</span>
                  {e.note && <span className="text-muted">· {e.note}</span>}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Action sidebar */}
        <div className="space-y-6">
          <Card>
            <h3 className="mb-1 font-display font-semibold">Payment</h3>
            <p className="text-sm text-muted">Method: <span className="uppercase">{order.paymentMethod}</span></p>
            <div className="mt-2 rounded-xl bg-cream p-3 text-sm">
              <p className="text-muted">Transaction / reference ID</p>
              <p className="break-all font-mono font-medium text-ink">{order.transactionId}</p>
            </div>
            <div className="mt-3">
              <Badge tone={paymentStatusTone[order.paymentStatus]}>{paymentStatusLabel[order.paymentStatus]}</Badge>
            </div>
            {order.paymentStatus !== "verified" && (
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setPayment("verified")} loading={busy}>
                  <Check size={15} /> Verify
                </Button>
                {order.paymentStatus !== "rejected" && (
                  <Button size="sm" variant="danger" onClick={() => setPayment("rejected")} loading={busy}>
                    <X size={15} /> Reject
                  </Button>
                )}
              </div>
            )}
          </Card>

          <Card>
            <h3 className="mb-2 font-display font-semibold">Fulfilment status</h3>
            <Select value={order.orderStatus} onChange={(e) => setStatus(e.target.value as OrderStatus)} disabled={busy}>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>{orderStatusLabel[s]}</option>
              ))}
            </Select>
          </Card>

          <Card>
            <h3 className="mb-2 font-display font-semibold">Internal note</h3>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Private note for your team…" />
            <Button size="sm" className="mt-2" onClick={saveNote} loading={busy}>Save note</Button>
          </Card>
        </div>
      </div>
    </>
  );
}

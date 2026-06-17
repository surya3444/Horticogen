"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Plus, Copy, Check, QrCode, Landmark } from "lucide-react";
import { AuthGuard } from "@/components/Guards";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { AddressForm } from "@/components/shop/AddressForm";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useSite } from "@/context/SiteContext";
import { useToast } from "@/components/ui/Toast";
import { getPayment, defaultPayment } from "@/lib/firebase/settings";
import { saveAddresses } from "@/lib/firebase/users";
import { createOrder } from "@/lib/firebase/orders";
import { formatINR, genId, cn } from "@/lib/utils";
import type { Address, PaymentMethod, PaymentSettings } from "@/lib/types";

function CheckoutInner() {
  const { profile, refreshProfile } = useAuth();
  const { items, subtotal, clear } = useCart();
  const { general } = useSite();
  const { toast } = useToast();
  const router = useRouter();

  const [payment, setPayment] = useState<PaymentSettings>(defaultPayment);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddr, setSelectedAddr] = useState<string>("");
  const [showAddr, setShowAddr] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [txnId, setTxnId] = useState("");
  const [placing, setPlacing] = useState(false);
  const [copied, setCopied] = useState("");

  const shipping = subtotal >= general.freeDeliveryThreshold ? 0 : 49;
  const total = subtotal + shipping;

  useEffect(() => {
    getPayment().then(setPayment);
  }, []);

  useEffect(() => {
    if (profile) {
      setAddresses(profile.addresses || []);
      const def = profile.addresses?.find((a) => a.isDefault) || profile.addresses?.[0];
      if (def) setSelectedAddr(def.id);
    }
  }, [profile]);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 1500);
  };

  const addAddress = async (a: Address) => {
    if (!profile) return;
    const next = addresses.length === 0 ? [{ ...a, isDefault: true }] : [...addresses, a];
    await saveAddresses(profile.uid, next);
    await refreshProfile();
    setAddresses(next);
    setSelectedAddr(a.id);
    setShowAddr(false);
    toast("Address added", "success");
  };

  const placeOrder = async () => {
    if (!profile) return;
    const addr = addresses.find((a) => a.id === selectedAddr);
    if (!addr) {
      toast("Please select a delivery address", "error");
      return;
    }
    if (!txnId.trim()) {
      toast("Please enter your payment transaction ID", "error");
      return;
    }
    setPlacing(true);
    try {
      const orderId = await createOrder({
        userId: profile.uid,
        userEmail: profile.email,
        items,
        subtotal,
        shipping,
        total,
        shippingAddress: addr,
        paymentMethod: method,
        transactionId: txnId.trim(),
      });
      clear();
      router.push(`/order/${orderId}`);
    } catch (e) {
      console.error(e);
      toast("Could not place order. Please try again.", "error");
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Your cart is empty</h1>
        <Link href="/" className="mt-4 inline-block text-terracotta-600 hover:underline">Continue shopping →</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
      <h1 className="font-display text-2xl font-bold">Checkout</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Address */}
          <section className="rounded-2xl border border-sand bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Delivery address</h2>
              <Button size="sm" variant="outline" onClick={() => setShowAddr(true)}><Plus size={15} /> Add</Button>
            </div>
            {addresses.length === 0 ? (
              <p className="mt-4 text-sm text-muted">No saved addresses. Add one to continue.</p>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {addresses.map((a) => (
                  <label
                    key={a.id}
                    className={cn(
                      "cursor-pointer rounded-xl border p-4 text-sm transition",
                      selectedAddr === a.id ? "border-terracotta-500 bg-terracotta-50" : "border-sand hover:border-terracotta-300"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{a.label}</span>
                      <input type="radio" checked={selectedAddr === a.id} onChange={() => setSelectedAddr(a.id)} className="accent-terracotta-500" />
                    </div>
                    <p className="mt-1 text-muted">
                      {a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} — {a.pincode}<br />📞 {a.phone}
                    </p>
                  </label>
                ))}
              </div>
            )}
          </section>

          {/* Payment */}
          <section className="rounded-2xl border border-sand bg-white p-5">
            <h2 className="font-display text-lg font-semibold">Payment</h2>
            <p className="mt-1 text-sm text-muted">{payment.instructions}</p>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setMethod("upi")}
                className={cn("flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium", method === "upi" ? "border-terracotta-500 bg-terracotta-50 text-terracotta-700" : "border-sand")}
              >
                <QrCode size={17} /> UPI / QR
              </button>
              <button
                onClick={() => setMethod("bank")}
                className={cn("flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium", method === "bank" ? "border-terracotta-500 bg-terracotta-50 text-terracotta-700" : "border-sand")}
              >
                <Landmark size={17} /> Bank Transfer
              </button>
            </div>

            {method === "upi" ? (
              <div className="mt-4 flex flex-col items-center gap-3 rounded-xl bg-cream p-5 sm:flex-row sm:items-start">
                {payment.upiQrImage ? (
                  <div className="relative h-44 w-44 shrink-0 overflow-hidden rounded-xl border border-sand bg-white">
                    <Image src={payment.upiQrImage} alt="UPI QR" fill className="object-contain p-2" />
                  </div>
                ) : (
                  <div className="grid h-44 w-44 shrink-0 place-items-center rounded-xl border border-dashed border-sand text-xs text-muted">
                    QR not set
                  </div>
                )}
                <div className="text-sm">
                  <p className="text-muted">Scan the QR or pay to UPI ID:</p>
                  {payment.upiId && (
                    <button onClick={() => copy(payment.upiId, "upi")} className="mt-1 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 font-mono font-medium">
                      {payment.upiId} {copied === "upi" ? <Check size={14} className="text-leaf-600" /> : <Copy size={14} />}
                    </button>
                  )}
                  <p className="mt-3 font-display text-lg font-semibold text-ink">Amount: {formatINR(total)}</p>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-1.5 rounded-xl bg-cream p-5 text-sm">
                <Row label="Bank" value={payment.bankName} />
                <Row label="Account name" value={payment.accountName} />
                <Row label="Account number" value={payment.accountNumber} onCopy={() => copy(payment.accountNumber, "acc")} copied={copied === "acc"} />
                <Row label="IFSC" value={payment.ifsc} onCopy={() => copy(payment.ifsc, "ifsc")} copied={copied === "ifsc"} />
                <p className="pt-2 font-display text-lg font-semibold text-ink">Amount: {formatINR(total)}</p>
              </div>
            )}

            <div className="mt-4">
              <Input
                label="Payment transaction / reference ID"
                value={txnId}
                onChange={(e) => setTxnId(e.target.value)}
                placeholder="e.g. UPI ref no. or bank UTR"
                required
              />
              <p className="mt-1 text-xs text-muted">Paste the reference ID after paying. We&apos;ll verify and confirm your order.</p>
            </div>
          </section>
        </div>

        {/* Summary */}
        <div className="h-fit rounded-2xl border border-sand bg-white p-5 lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-semibold">Order Summary</h2>
          <ul className="mt-4 space-y-3">
            {items.map((it) => (
              <li key={it.variantId} className="flex gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-cream">
                  {it.image && <Image src={it.image} alt="" fill className="object-cover" />}
                  <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] text-white">{it.qty}</span>
                </div>
                <div className="flex-1 text-sm">
                  <p className="line-clamp-1 font-medium">{it.name}</p>
                  <p className="text-xs text-muted">{it.variantName}</p>
                </div>
                <span className="text-sm font-medium">{formatINR(it.price * it.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-t border-sand pt-4 text-sm">
            <div className="flex justify-between text-muted"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
            <div className="flex justify-between text-muted">
              <span>Shipping</span>
              <span>{shipping === 0 ? <Badge tone="leaf">Free</Badge> : formatINR(shipping)}</span>
            </div>
            <div className="flex justify-between font-display text-lg font-semibold"><span>Total</span><span>{formatINR(total)}</span></div>
          </div>
          <Button fullWidth size="lg" className="mt-5" onClick={placeOrder} loading={placing}>
            Place order
          </Button>
        </div>
      </div>

      <Modal open={showAddr} onClose={() => setShowAddr(false)} title="Add delivery address">
        <AddressForm onSave={(a) => addAddress({ ...a, id: a.id || genId() })} onCancel={() => setShowAddr(false)} />
      </Modal>
    </div>
  );
}

function Row({ label, value, onCopy, copied }: { label: string; value: string; onCopy?: () => void; copied?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className="flex items-center gap-2 font-medium text-ink">
        {value || "—"}
        {onCopy && value && (
          <button onClick={onCopy}>{copied ? <Check size={13} className="text-leaf-600" /> : <Copy size={13} />}</button>
        )}
      </span>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <AuthGuard>
      <CheckoutInner />
    </AuthGuard>
  );
}

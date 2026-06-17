"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AdminHeader, Card } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import {
  getPayment,
  savePayment,
  defaultPayment,
  getDelivery,
  saveDelivery,
  defaultDelivery,
} from "@/lib/firebase/settings";
import { genId } from "@/lib/utils";
import type { DeliverySettings, PaymentSettings } from "@/lib/types";

export default function PaymentSettingsPage() {
  const { toast } = useToast();
  const [p, setP] = useState<PaymentSettings>(defaultPayment);
  const [d, setD] = useState<DeliverySettings>(defaultDelivery);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const [pay, del] = await Promise.all([getPayment(), getDelivery()]);
      setP(pay);
      setD(del);
      setLoading(false);
    })();
  }, []);

  const set = (k: keyof PaymentSettings, v: string) => setP((prev) => ({ ...prev, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await Promise.all([savePayment(p), saveDelivery(d)]);
      toast("Settings saved", "success");
    } catch {
      toast("Could not save", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (<><AdminHeader title="Payment & Delivery" /><Skeleton className="h-64 rounded-2xl" /></>);

  return (
    <>
      <AdminHeader title="Payment & Delivery" description="Payment options shown at checkout, plus delivery charges." action={<Button onClick={save} loading={saving}>Save</Button>} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <h3 className="font-display font-semibold">UPI</h3>
          <Input label="UPI ID" value={p.upiId} onChange={(e) => set("upiId", e.target.value)} placeholder="yourstore@upi" />
          <div className="max-w-[240px]">
            <ImageUploader label="UPI QR code image" value={p.upiQrImage} onChange={(url) => set("upiQrImage", url)} folder="payment" aspect="aspect-square" />
          </div>
        </Card>

        <Card className="space-y-4">
          <h3 className="font-display font-semibold">Bank transfer</h3>
          <Input label="Bank name" value={p.bankName} onChange={(e) => set("bankName", e.target.value)} />
          <Input label="Account holder name" value={p.accountName} onChange={(e) => set("accountName", e.target.value)} />
          <Input label="Account number" value={p.accountNumber} onChange={(e) => set("accountNumber", e.target.value)} />
          <Input label="IFSC code" value={p.ifsc} onChange={(e) => set("ifsc", e.target.value)} />
        </Card>
      </div>

      <Card className="mt-6">
        <Textarea label="Checkout instructions" value={p.instructions} onChange={(e) => set("instructions", e.target.value)} />
      </Card>

      {/* ---- Delivery charges ---- */}
      <Card className="mt-6 space-y-4">
        <h3 className="font-display font-semibold">Delivery charges</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Free delivery above (₹)"
            type="number"
            min={0}
            value={d.freeDeliveryThreshold}
            onChange={(e) => setD({ ...d, freeDeliveryThreshold: Number(e.target.value) })}
          />
          <Input
            label="Default delivery charge (₹)"
            type="number"
            min={0}
            value={d.defaultCharge}
            onChange={(e) => setD({ ...d, defaultCharge: Number(e.target.value) })}
          />
        </div>
        <p className="-mt-1 text-xs text-muted">
          Orders at or above the free-delivery amount ship free (set it to 0 to disable free delivery).
          The default charge applies when no region below matches the customer&apos;s state.
        </p>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium">Region-wise charges (by state)</label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setD({ ...d, regions: [...d.regions, { id: genId(), region: "", charge: 0 }] })}
            >
              <Plus size={14} /> Add region
            </Button>
          </div>

          {d.regions.length === 0 ? (
            <p className="text-sm text-muted">No region overrides — every order uses the default charge.</p>
          ) : (
            <div className="space-y-2">
              {d.regions.map((r) => (
                <div key={r.id} className="flex items-end gap-2">
                  <div className="flex-1">
                    <Input
                      label="State / region"
                      placeholder="e.g. Maharashtra"
                      value={r.region}
                      onChange={(e) =>
                        setD({ ...d, regions: d.regions.map((x) => (x.id === r.id ? { ...x, region: e.target.value } : x)) })
                      }
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      label="Charge (₹)"
                      type="number"
                      min={0}
                      value={r.charge}
                      onChange={(e) =>
                        setD({ ...d, regions: d.regions.map((x) => (x.id === r.id ? { ...x, charge: Number(e.target.value) } : x)) })
                      }
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setD({ ...d, regions: d.regions.filter((x) => x.id !== r.id) })}
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-muted hover:bg-red-100 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="mt-2 text-xs text-muted">
            The region is matched against the state entered in the customer&apos;s shipping address (case-insensitive).
          </p>
        </div>
      </Card>

      <div className="mt-6 flex justify-end"><Button onClick={save} loading={saving}>Save</Button></div>
    </>
  );
}

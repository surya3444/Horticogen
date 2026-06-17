"use client";

import { useEffect, useState } from "react";
import { AdminHeader, Card } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { getPayment, savePayment, defaultPayment } from "@/lib/firebase/settings";
import type { PaymentSettings } from "@/lib/types";

export default function PaymentSettingsPage() {
  const { toast } = useToast();
  const [p, setP] = useState<PaymentSettings>(defaultPayment);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { getPayment().then((d) => { setP(d); setLoading(false); }); }, []);

  const set = (k: keyof PaymentSettings, v: string) => setP((prev) => ({ ...prev, [k]: v }));

  const save = async () => {
    setSaving(true);
    try { await savePayment(p); toast("Payment details saved", "success"); }
    catch { toast("Could not save", "error"); }
    finally { setSaving(false); }
  };

  if (loading) return (<><AdminHeader title="Payment Details" /><Skeleton className="h-64 rounded-2xl" /></>);

  return (
    <>
      <AdminHeader title="Payment Details" description="Shown to customers at checkout for manual UPI / bank payments." action={<Button onClick={save} loading={saving}>Save</Button>} />

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

      <div className="mt-6 flex justify-end"><Button onClick={save} loading={saving}>Save</Button></div>
    </>
  );
}

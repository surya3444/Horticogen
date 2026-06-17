"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { genId } from "@/lib/utils";
import type { Address } from "@/lib/types";

const empty: Address = {
  id: "",
  label: "Home",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
};

export function AddressForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial?: Address;
  onSave: (a: Address) => void;
  onCancel?: () => void;
  saving?: boolean;
}) {
  const [a, setA] = useState<Address>(initial || { ...empty, id: genId() });

  const set = (k: keyof Address, v: string) => setA((p) => ({ ...p, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(a);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input label="Label (Home / Work)" value={a.label} onChange={(e) => set("label", e.target.value)} required />
      <Input label="Address line 1" value={a.line1} onChange={(e) => set("line1", e.target.value)} required />
      <Input label="Address line 2 (optional)" value={a.line2 || ""} onChange={(e) => set("line2", e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="City" value={a.city} onChange={(e) => set("city", e.target.value)} required />
        <Input label="State" value={a.state} onChange={(e) => set("state", e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Pincode" value={a.pincode} onChange={(e) => set("pincode", e.target.value)} required inputMode="numeric" />
        <Input label="Phone" value={a.phone} onChange={(e) => set("phone", e.target.value)} required inputMode="tel" />
      </div>
      <div className="flex gap-3">
        <Button type="submit" loading={saving}>Save address</Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        )}
      </div>
    </form>
  );
}

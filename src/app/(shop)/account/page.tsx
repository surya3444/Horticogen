"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, MapPin } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { AddressForm } from "@/components/shop/AddressForm";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { updateUserProfile, saveAddresses } from "@/lib/firebase/users";
import type { Address } from "@/lib/types";

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [savingInfo, setSavingInfo] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editing, setEditing] = useState<Address | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [savingAddr, setSavingAddr] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone || "");
      setAddresses(profile.addresses || []);
    }
  }, [profile]);

  const saveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSavingInfo(true);
    try {
      await updateUserProfile(profile.uid, { name, phone });
      await refreshProfile();
      toast("Profile updated", "success");
    } catch {
      toast("Could not update profile", "error");
    } finally {
      setSavingInfo(false);
    }
  };

  const persist = async (next: Address[]) => {
    if (!profile) return;
    setSavingAddr(true);
    try {
      await saveAddresses(profile.uid, next);
      setAddresses(next);
      await refreshProfile();
      toast("Address saved", "success");
      setShowForm(false);
      setEditing(null);
    } catch {
      toast("Could not save address", "error");
    } finally {
      setSavingAddr(false);
    }
  };

  const handleSave = (a: Address) => {
    const exists = addresses.some((x) => x.id === a.id);
    let next = exists ? addresses.map((x) => (x.id === a.id ? a : x)) : [...addresses, a];
    if (a.isDefault) next = next.map((x) => ({ ...x, isDefault: x.id === a.id }));
    if (next.length === 1) next[0].isDefault = true;
    persist(next);
  };

  const remove = (id: string) => persist(addresses.filter((x) => x.id !== id));
  const makeDefault = (id: string) =>
    persist(addresses.map((x) => ({ ...x, isDefault: x.id === id })));

  return (
    <div className="space-y-8">
      {/* Personal info */}
      <section className="rounded-2xl border border-sand bg-white p-6">
        <h2 className="font-display text-lg font-semibold">Personal information</h2>
        <form onSubmit={saveInfo} className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Email" value={profile?.email || ""} disabled />
          <Input label="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="+91 …" />
          <div className="flex items-end">
            <Button type="submit" loading={savingInfo}>Save changes</Button>
          </div>
        </form>
      </section>

      {/* Addresses */}
      <section className="rounded-2xl border border-sand bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Saved addresses</h2>
          <Button size="sm" variant="outline" onClick={() => { setEditing(null); setShowForm(true); }}>
            <Plus size={16} /> Add new
          </Button>
        </div>

        {addresses.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-2 py-8 text-center text-muted">
            <MapPin className="h-8 w-8 text-sand" />
            <p>No addresses saved yet.</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {addresses.map((a) => (
              <div key={a.id} className="rounded-xl border border-sand p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{a.label}</span>
                  {a.isDefault && <Badge tone="leaf">Default</Badge>}
                </div>
                <p className="mt-1 text-sm text-muted">
                  {a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />
                  {a.city}, {a.state} — {a.pincode}<br />
                  📞 {a.phone}
                </p>
                <div className="mt-3 flex gap-3 text-sm">
                  <button onClick={() => { setEditing(a); setShowForm(true); }} className="inline-flex items-center gap-1 text-terracotta-600 hover:underline">
                    <Pencil size={14} /> Edit
                  </button>
                  <button onClick={() => remove(a.id)} className="inline-flex items-center gap-1 text-red-600 hover:underline">
                    <Trash2 size={14} /> Delete
                  </button>
                  {!a.isDefault && (
                    <button onClick={() => makeDefault(a.id)} className="text-muted hover:underline">
                      Set default
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "Edit address" : "Add address"}>
        <AddressForm
          initial={editing || undefined}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
          saving={savingAddr}
        />
      </Modal>
    </div>
  );
}

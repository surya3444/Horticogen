"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AdminHeader, Card } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { getGeneral, saveGeneral, getFooter, saveFooter, defaultGeneral, defaultFooter } from "@/lib/firebase/settings";
import { genId } from "@/lib/utils";
import type { GeneralSettings, FooterSettings } from "@/lib/types";

export default function GeneralSettingsPage() {
  const { toast } = useToast();
  const [g, setG] = useState<GeneralSettings>(defaultGeneral);
  const [f, setF] = useState<FooterSettings>(defaultFooter);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const [gen, foot] = await Promise.all([getGeneral(), getFooter()]);
      setG(gen); setF(foot); setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await Promise.all([saveGeneral(g), saveFooter(f)]);
      toast("Settings saved", "success");
    } catch { toast("Could not save", "error"); }
    finally { setSaving(false); }
  };

  if (loading) return (<><AdminHeader title="Branding & Footer" /><Skeleton className="h-64 rounded-2xl" /></>);

  return (
    <>
      <AdminHeader title="Branding & Footer" description="Logo, announcement bar, contact info, social links & footer menus." action={<Button onClick={save} loading={saving}>Save changes</Button>} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <h3 className="font-display font-semibold">Branding</h3>
          <Input label="Site name" value={g.siteName} onChange={(e) => setG({ ...g, siteName: e.target.value })} />
          <div className="max-w-[220px]">
            <ImageUploader label="Logo (optional — falls back to text logo)" value={g.logo} onChange={(url) => setG({ ...g, logo: url })} folder="branding" aspect="aspect-[4/1]" />
          </div>
          <Input label="Announcement bar text" value={g.announcementBar} onChange={(e) => setG({ ...g, announcementBar: e.target.value })} />
          <p className="text-xs text-muted">Delivery charges & free-delivery threshold are managed under <span className="font-medium">Payment Details</span>.</p>
        </Card>

        <Card className="space-y-4">
          <h3 className="font-display font-semibold">Contact & social</h3>
          <Input label="Contact email" value={g.contactEmail} onChange={(e) => setG({ ...g, contactEmail: e.target.value })} />
          <Input label="Contact phone" value={g.contactPhone} onChange={(e) => setG({ ...g, contactPhone: e.target.value })} />
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium">Social links</label>
              <Button type="button" size="sm" variant="outline" onClick={() => setG({ ...g, social: [...g.social, { platform: "", url: "" }] })}><Plus size={14} /> Add</Button>
            </div>
            <div className="space-y-2">
              {g.social.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <Input placeholder="Platform (e.g. Instagram)" value={s.platform} onChange={(e) => { const next = [...g.social]; next[i] = { ...s, platform: e.target.value }; setG({ ...g, social: next }); }} />
                  <Input placeholder="https://…" value={s.url} onChange={(e) => { const next = [...g.social]; next[i] = { ...s, url: e.target.value }; setG({ ...g, social: next }); }} />
                  <button onClick={() => setG({ ...g, social: g.social.filter((_, idx) => idx !== i) })} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-muted hover:bg-red-100 hover:text-red-700"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold">Footer menus</h3>
          <Button type="button" size="sm" variant="outline" onClick={() => setF({ columns: [...f.columns, { id: genId(), title: "New column", links: [] }] })}><Plus size={14} /> Add column</Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {f.columns.map((col) => (
            <div key={col.id} className="rounded-xl border border-sand p-4">
              <div className="flex gap-2">
                <Input value={col.title} onChange={(e) => setF({ columns: f.columns.map((c) => c.id === col.id ? { ...c, title: e.target.value } : c) })} />
                <button onClick={() => setF({ columns: f.columns.filter((c) => c.id !== col.id) })} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-muted hover:bg-red-100 hover:text-red-700"><Trash2 size={16} /></button>
              </div>
              <div className="mt-3 space-y-2">
                {col.links.map((lnk, li) => (
                  <div key={li} className="flex gap-2">
                    <Input placeholder="Label" value={lnk.label} onChange={(e) => setF({ columns: f.columns.map((c) => c.id === col.id ? { ...c, links: c.links.map((l, idx) => idx === li ? { ...l, label: e.target.value } : l) } : c) })} />
                    <Input placeholder="/url" value={lnk.url} onChange={(e) => setF({ columns: f.columns.map((c) => c.id === col.id ? { ...c, links: c.links.map((l, idx) => idx === li ? { ...l, url: e.target.value } : l) } : c) })} />
                    <button onClick={() => setF({ columns: f.columns.map((c) => c.id === col.id ? { ...c, links: c.links.filter((_, idx) => idx !== li) } : c) })} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-muted hover:bg-red-100 hover:text-red-700"><Trash2 size={16} /></button>
                  </div>
                ))}
                <Button type="button" size="sm" variant="ghost" onClick={() => setF({ columns: f.columns.map((c) => c.id === col.id ? { ...c, links: [...c.links, { label: "", url: "" }] } : c) })}><Plus size={14} /> Add link</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-6 flex justify-end"><Button onClick={save} loading={saving}>Save changes</Button></div>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { AdminHeader, Card } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { getHomepage, saveHomepage } from "@/lib/firebase/settings";
import { listCategories } from "@/lib/firebase/categories";
import { genId } from "@/lib/utils";
import type { CollectionSection, Category } from "@/lib/types";

export default function HomepageEditorPage() {
  const { toast } = useToast();
  const [sections, setSections] = useState<CollectionSection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const [hp, cats] = await Promise.all([getHomepage(), listCategories()]);
      setSections([...hp.sections].sort((a, b) => a.order - b.order));
      setCategories(cats);
      setLoading(false);
    })();
  }, []);

  const update = (id: string, patch: Partial<CollectionSection>) =>
    setSections((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const add = () =>
    setSections((s) => [...s, { id: genId(), type: "featuredProducts", title: "New section", order: s.length + 1, enabled: true }]);
  const remove = (id: string) => setSections((s) => s.filter((x) => x.id !== id));
  const move = (i: number, dir: -1 | 1) =>
    setSections((s) => {
      const next = [...s]; const j = i + dir;
      if (j < 0 || j >= next.length) return s;
      [next[i], next[j]] = [next[j], next[i]];
      return next.map((x, idx) => ({ ...x, order: idx + 1 }));
    });

  const save = async () => {
    setSaving(true);
    try {
      await saveHomepage({ sections: sections.map((s, i) => ({ ...s, order: i + 1 })) });
      toast("Homepage saved", "success");
    } catch { toast("Could not save", "error"); }
    finally { setSaving(false); }
  };

  if (loading) return (<><AdminHeader title="Homepage" /><Skeleton className="h-64 rounded-2xl" /></>);

  return (
    <>
      <AdminHeader
        title="Homepage Sections"
        description="Control which sections appear on the homepage and in what order."
        action={<div className="flex gap-2"><Button variant="outline" onClick={add}><Plus size={16} /> Add section</Button><Button onClick={save} loading={saving}>Save</Button></div>}
      />
      {sections.length === 0 ? (
        <Card><p className="py-8 text-center text-muted">No sections. Add one to get started.</p></Card>
      ) : (
        <div className="space-y-3">
          {sections.map((s, i) => (
            <Card key={s.id}>
              <div className="flex items-start gap-3">
                <div className="flex flex-col gap-1">
                  <button onClick={() => move(i, -1)} disabled={i === 0} className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-sand disabled:opacity-30"><ArrowUp size={15} /></button>
                  <button onClick={() => move(i, 1)} disabled={i === sections.length - 1} className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-sand disabled:opacity-30"><ArrowDown size={15} /></button>
                </div>
                <div className="grid flex-1 gap-3 sm:grid-cols-2">
                  <Select label="Type" value={s.type} onChange={(e) => update(s.id, { type: e.target.value as CollectionSection["type"] })}>
                    <option value="featuredProducts">Featured products</option>
                    <option value="categoryStrip">Category strip</option>
                    <option value="banner">Promo banner</option>
                  </Select>
                  <Input label="Title" value={s.title} onChange={(e) => update(s.id, { title: e.target.value })} />
                  <Input label="Subtitle" value={s.subtitle || ""} onChange={(e) => update(s.id, { subtitle: e.target.value })} />
                  {(s.type === "categoryStrip" || s.type === "banner") && (
                    <Select label="Category" value={s.categoryId || ""} onChange={(e) => update(s.id, { categoryId: e.target.value })}>
                      <option value="">— All / none —</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{"— ".repeat(c.depth) + c.name}</option>)}
                    </Select>
                  )}
                  {s.type === "banner" && (
                    <>
                      <Input label="Button text" value={s.ctaText || ""} onChange={(e) => update(s.id, { ctaText: e.target.value })} />
                      <Input label="Button link" value={s.ctaLink || ""} onChange={(e) => update(s.id, { ctaLink: e.target.value })} />
                    </>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <label className="flex items-center gap-1.5 text-sm">
                    <input type="checkbox" checked={s.enabled} onChange={(e) => update(s.id, { enabled: e.target.checked })} className="h-4 w-4 accent-terracotta-500" /> On
                  </label>
                  <button onClick={() => remove(s.id)} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-red-100 hover:text-red-700"><Trash2 size={16} /></button>
                </div>
              </div>
            </Card>
          ))}
          <div className="flex justify-end"><Button onClick={save} loading={saving}>Save</Button></div>
        </div>
      )}
    </>
  );
}

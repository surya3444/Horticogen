"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, LayoutGrid, Image as ImageIcon, Rows3, Monitor, Smartphone, Sparkles, Wand2 } from "lucide-react";
import { AdminHeader, Card } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { ProductPicker } from "@/components/admin/ProductPicker";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { getHomepage, saveHomepage, starterSections } from "@/lib/firebase/settings";
import { listCategories } from "@/lib/firebase/categories";
import { genId } from "@/lib/utils";
import type { CollectionSection, Category, ProductSource, SectionType } from "@/lib/types";

const typeMeta: Record<SectionType, { label: string; icon: React.ElementType }> = {
  products: { label: "Products", icon: LayoutGrid },
  banner: { label: "Banner", icon: ImageIcon },
  categoryStrip: { label: "Category strip", icon: Rows3 },
  promo: { label: "Promo block", icon: Sparkles },
};

const sourceLabels: Record<ProductSource, string> = {
  featured: "Featured products",
  newest: "Newest arrivals",
  onSale: "On sale / offers",
  category: "From a category",
  custom: "Hand-picked products",
};

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

  const addSection = (type: SectionType) =>
    setSections((s) => [
      ...s,
      {
        id: genId(),
        type,
        title: type === "banner" ? "" : "New section",
        enabled: true,
        order: s.length + 1,
        ...(type === "products" ? { source: "featured" as ProductSource, layout: "carousel" as const, limit: 10 } : {}),
        ...(type === "promo" ? { highlights: [] } : {}),
      },
    ]);

  // Append the curated starter layout (preserving any existing sections).
  const loadStarter = () =>
    setSections((s) => {
      const starter = starterSections(genId()).map((x, i) => ({ ...x, order: s.length + i + 1 }));
      return [...s, ...starter];
    });

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
        description="Build the homepage from stackable sections. Drag order with the arrows; toggle visibility per section."
        action={<Button onClick={save} loading={saving}>Save changes</Button>}
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {(Object.keys(typeMeta) as SectionType[]).map((t) => {
          const Icon = typeMeta[t].icon;
          return (
            <Button key={t} type="button" variant="outline" size="sm" onClick={() => addSection(t)}>
              <Icon size={15} /> Add {typeMeta[t].label.toLowerCase()}
            </Button>
          );
        })}
        <span className="mx-1 hidden h-6 w-px bg-sand sm:block" />
        <Button type="button" variant="secondary" size="sm" onClick={loadStarter}>
          <Wand2 size={15} /> Load starter layout
        </Button>
      </div>

      {sections.length === 0 ? (
        <Card><p className="py-8 text-center text-muted">No sections yet. Add one above.</p></Card>
      ) : (
        <div className="space-y-3">
          {sections.map((s, i) => (
            <Card key={s.id} className={s.enabled ? "" : "opacity-60"}>
              <div className="flex items-start gap-3">
                <div className="flex flex-col gap-1 pt-1">
                  <button onClick={() => move(i, -1)} disabled={i === 0} className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-sand disabled:opacity-30"><ArrowUp size={15} /></button>
                  <button onClick={() => move(i, 1)} disabled={i === sections.length - 1} className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-sand disabled:opacity-30"><ArrowDown size={15} /></button>
                </div>

                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    {(() => { const Icon = typeMeta[s.type].icon; return <Icon size={16} className="text-terracotta-600" />; })()}
                    <span className="text-sm font-semibold">{typeMeta[s.type].label}</span>
                  </div>

                  {/* Common: title + subtitle (optional for banner) */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input label={s.type === "banner" ? "Title (optional)" : "Title"} value={s.title} onChange={(e) => update(s.id, { title: e.target.value })} />
                    <Input label="Subtitle (optional)" value={s.subtitle || ""} onChange={(e) => update(s.id, { subtitle: e.target.value })} />
                  </div>

                  {/* Products section options */}
                  {s.type === "products" && (
                    <>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <Select label="Show" value={s.source || "featured"} onChange={(e) => update(s.id, { source: e.target.value as ProductSource })}>
                          {(Object.keys(sourceLabels) as ProductSource[]).map((src) => (
                            <option key={src} value={src}>{sourceLabels[src]}</option>
                          ))}
                        </Select>
                        <Select label="Layout" value={s.layout || "carousel"} onChange={(e) => update(s.id, { layout: e.target.value as "grid" | "carousel" })}>
                          <option value="carousel">Carousel (scroll)</option>
                          <option value="grid">Grid</option>
                        </Select>
                        <Input label="Max items" type="number" min={1} value={s.limit || 8} onChange={(e) => update(s.id, { limit: Number(e.target.value) })} />
                      </div>

                      {s.source === "category" && (
                        <Select label="Category" value={s.categoryId || ""} onChange={(e) => update(s.id, { categoryId: e.target.value })}>
                          <option value="">— Select category —</option>
                          {categories.map((c) => <option key={c.id} value={c.id}>{"— ".repeat(c.depth) + c.name}</option>)}
                        </Select>
                      )}

                      {s.source === "custom" && (
                        <ProductPicker value={s.productIds || []} onChange={(ids) => update(s.id, { productIds: ids })} />
                      )}

                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input label="Button text (optional)" value={s.ctaText || ""} onChange={(e) => update(s.id, { ctaText: e.target.value })} placeholder="View all" />
                        <Input label="Button link (optional)" value={s.ctaLink || ""} onChange={(e) => update(s.id, { ctaLink: e.target.value })} placeholder="/c/plants" />
                      </div>
                    </>
                  )}

                  {/* Category strip options */}
                  {s.type === "categoryStrip" && (
                    <Select label="Show sub-categories of" value={s.categoryId || ""} onChange={(e) => update(s.id, { categoryId: e.target.value })}>
                      <option value="">Top-level categories</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{"— ".repeat(c.depth) + c.name}</option>)}
                    </Select>
                  )}

                  {/* Promo block options */}
                  {s.type === "promo" && (
                    <>
                      <Input
                        label="Highlight pills (comma separated)"
                        value={(s.highlights || []).join(", ")}
                        onChange={(e) => update(s.id, { highlights: e.target.value.split(",").map((h) => h.trim()).filter(Boolean) })}
                        placeholder="🌱 Air-purifying, 🐾 Pet-safe, 📄 Research links"
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input label="Button text (optional)" value={s.ctaText || ""} onChange={(e) => update(s.id, { ctaText: e.target.value })} placeholder="Shop now" />
                        <Input label="Button link (optional)" value={s.ctaLink || ""} onChange={(e) => update(s.id, { ctaLink: e.target.value })} placeholder="/c/plants" />
                      </div>
                      <p className="rounded-lg bg-cream px-3 py-2 text-xs text-muted">A colour highlight block (no image needed) — great for brand messaging or a value proposition.</p>
                    </>
                  )}

                  {/* Banner options */}
                  {s.type === "banner" && (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="mb-1.5 flex items-center gap-1.5 text-sm font-medium"><Monitor size={15} /> Desktop banner (wide)</p>
                          <ImageUploader value={s.desktopImage || s.image || ""} onChange={(url) => update(s.id, { desktopImage: url })} folder="banners" aspect="aspect-[16/5]" />
                        </div>
                        <div>
                          <p className="mb-1.5 flex items-center gap-1.5 text-sm font-medium"><Smartphone size={15} /> Mobile banner (tall)</p>
                          <ImageUploader value={s.mobileImage || ""} onChange={(url) => update(s.id, { mobileImage: url })} folder="banners" aspect="aspect-[4/5]" />
                        </div>
                      </div>
                      <p className="rounded-lg bg-cream px-3 py-2 text-xs text-muted">
                        💡 Upload <strong>both</strong> a wide desktop image and a tall mobile image so long banners stay crisp and don&apos;t get cropped awkwardly on phones. If you only upload one, it&apos;s used for both.
                      </p>
                      <Input label="Banner link (optional)" value={s.bannerLink || ""} onChange={(e) => update(s.id, { bannerLink: e.target.value })} placeholder="/c/offers" />
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
          <div className="flex justify-end"><Button onClick={save} loading={saving}>Save changes</Button></div>
        </div>
      )}
    </>
  );
}

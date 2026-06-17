"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, Monitor, Smartphone } from "lucide-react";
import { AdminHeader, Card } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { Skeleton } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { getHero, saveHero } from "@/lib/firebase/settings";
import { genId } from "@/lib/utils";
import type { HeroSlide } from "@/lib/types";

export default function HeroEditorPage() {
  const { toast } = useToast();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getHero().then((h) => { setSlides([...h.slides].sort((a, b) => a.order - b.order)); setLoading(false); });
  }, []);

  const update = (id: string, patch: Partial<HeroSlide>) =>
    setSlides((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const add = () =>
    setSlides((s) => [...s, { id: genId(), desktopImage: "", mobileImage: "", heading: "", subheading: "", ctaText: "", ctaLink: "", order: s.length + 1 }]);

  const remove = (id: string) => setSlides((s) => s.filter((x) => x.id !== id));

  const move = (i: number, dir: -1 | 1) => {
    setSlides((s) => {
      const next = [...s];
      const j = i + dir;
      if (j < 0 || j >= next.length) return s;
      [next[i], next[j]] = [next[j], next[i]];
      return next.map((x, idx) => ({ ...x, order: idx + 1 }));
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await saveHero({ slides: slides.map((s, i) => ({ ...s, order: i + 1 })) });
      toast("Hero slides saved", "success");
    } catch { toast("Could not save", "error"); }
    finally { setSaving(false); }
  };

  if (loading) return (<><AdminHeader title="Hero Slider" /><Skeleton className="h-64 rounded-2xl" /></>);

  return (
    <>
      <AdminHeader
        title="Hero Slider"
        description="Each slide has separate images for desktop & mobile."
        action={<div className="flex gap-2"><Button variant="outline" onClick={add}><Plus size={16} /> Add slide</Button><Button onClick={save} loading={saving}>Save changes</Button></div>}
      />

      {slides.length === 0 ? (
        <Card><p className="py-8 text-center text-muted">No slides yet. Add your first hero slide.</p></Card>
      ) : (
        <div className="space-y-4">
          {slides.map((slide, i) => (
            <Card key={slide.id}>
              <div className="mb-3 flex items-center justify-between">
                <span className="font-display font-semibold">Slide {i + 1}</span>
                <div className="flex gap-1">
                  <button onClick={() => move(i, -1)} disabled={i === 0} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-sand disabled:opacity-30"><ArrowUp size={16} /></button>
                  <button onClick={() => move(i, 1)} disabled={i === slides.length - 1} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-sand disabled:opacity-30"><ArrowDown size={16} /></button>
                  <button onClick={() => remove(slide.id)} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-red-100 hover:text-red-700"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-1.5 flex items-center gap-1.5 text-sm font-medium"><Monitor size={15} /> Desktop image (wide)</p>
                  <ImageUploader value={slide.desktopImage} onChange={(url) => update(slide.id, { desktopImage: url })} folder="hero" aspect="aspect-video" />
                </div>
                <div>
                  <p className="mb-1.5 flex items-center gap-1.5 text-sm font-medium"><Smartphone size={15} /> Mobile image (tall)</p>
                  <ImageUploader value={slide.mobileImage} onChange={(url) => update(slide.id, { mobileImage: url })} folder="hero" aspect="aspect-[4/5]" />
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Input label="Heading" value={slide.heading || ""} onChange={(e) => update(slide.id, { heading: e.target.value })} />
                <Input label="Subheading" value={slide.subheading || ""} onChange={(e) => update(slide.id, { subheading: e.target.value })} />
                <Input label="Button text" value={slide.ctaText || ""} onChange={(e) => update(slide.id, { ctaText: e.target.value })} placeholder="Shop Now" />
                <Input label="Button link" value={slide.ctaLink || ""} onChange={(e) => update(slide.id, { ctaLink: e.target.value })} placeholder="/c/plants" />
              </div>
            </Card>
          ))}
          <div className="flex justify-end"><Button onClick={save} loading={saving}>Save changes</Button></div>
        </div>
      )}
    </>
  );
}

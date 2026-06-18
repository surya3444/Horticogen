"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Search, Check, GripVertical, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { listProducts } from "@/lib/firebase/products";
import { formatINR } from "@/lib/utils";
import type { Product } from "@/lib/types";

// Multi-select product picker. Returns the chosen product ids (in chosen order).
export function ProductPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (open && products.length === 0) listProducts({ activeOnly: true }).then(setProducts);
  }, [open, products.length]);

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const chosen = value.map((id) => byId.get(id)).filter((p): p is Product => !!p);
  const filtered = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Hand-picked products ({value.length})</label>
        <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
          Choose products
        </Button>
      </div>

      {/* Selected list with reordering */}
      {chosen.length > 0 ? (
        <ul className="mt-2 space-y-1.5">
          {chosen.map((p, i) => (
            <li key={p.id} className="flex items-center gap-2 rounded-lg border border-sand p-1.5">
              <div className="flex flex-col">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-muted hover:text-ink disabled:opacity-30"><GripVertical size={12} className="rotate-90" /></button>
              </div>
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded bg-cream">
                {p.images[0] && <Image src={p.images[0]} alt="" fill className="object-cover" />}
              </div>
              <span className="flex-1 truncate text-sm">{p.name}</span>
              <button type="button" onClick={() => toggle(p.id)} className="text-muted hover:text-red-600"><X size={15} /></button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted">No products chosen yet.</p>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Choose products" maxWidth="max-w-xl">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-xl border border-sand bg-cream py-2 pl-9 pr-3 text-sm focus:border-terracotta-400 focus:outline-none"
          />
        </div>
        <ul className="max-h-[50vh] space-y-1 overflow-y-auto">
          {filtered.map((p) => {
            const sel = value.includes(p.id);
            const v = p.variants.find((x) => x.id === p.defaultVariantId) || p.variants[0];
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => toggle(p.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-2 text-left ${sel ? "border-terracotta-400 bg-terracotta-50" : "border-sand hover:bg-cream"}`}
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-cream">
                    {p.images[0] && <Image src={p.images[0]} alt="" fill className="object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted">{formatINR(v?.price || 0)}</p>
                  </div>
                  <span className={`grid h-5 w-5 place-items-center rounded-full border ${sel ? "border-terracotta-500 bg-terracotta-500 text-white" : "border-sand"}`}>
                    {sel && <Check size={13} />}
                  </span>
                </button>
              </li>
            );
          })}
          {filtered.length === 0 && <p className="py-6 text-center text-sm text-muted">No products found.</p>}
        </ul>
        <div className="mt-4 flex justify-end">
          <Button type="button" onClick={() => setOpen(false)}>Done ({value.length})</Button>
        </div>
      </Modal>
    </div>
  );
}

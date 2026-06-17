"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Loader2, X } from "lucide-react";
import { searchProducts } from "@/lib/firebase/products";
import { formatINR, cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function SearchBox({
  autoFocus,
  className,
  onNavigate,
}: {
  autoFocus?: boolean;
  className?: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);

  // Debounced live search.
  useEffect(() => {
    const q = term.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      const r = await searchProducts(q);
      setResults(r.slice(0, 6));
      setLoading(false);
    }, 220);
    return () => clearTimeout(t);
  }, [term]);

  // Close on outside click.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    setActive(-1);
    onNavigate?.();
    router.push(href);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = term.trim();
    if (!q) return;
    if (active >= 0 && results[active]) {
      go(`/p/${results[active].slug}`);
    } else {
      go(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || !results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showDropdown = open && term.trim().length >= 2;

  return (
    <div ref={boxRef} className={cn("relative", className)}>
      <form onSubmit={submit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            autoFocus={autoFocus}
            value={term}
            onChange={(e) => {
              setTerm(e.target.value);
              setOpen(true);
              setActive(-1);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder="Search plants, seeds, pots…"
            className="w-full rounded-full border border-sand bg-cream py-2.5 pl-10 pr-9 text-sm focus:border-terracotta-400 focus:outline-none"
          />
          {term && (
            <button
              type="button"
              onClick={() => { setTerm(""); setResults([]); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
              aria-label="Clear"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </form>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-sand bg-white shadow-xl">
          {loading ? (
            <div className="flex items-center gap-2 px-4 py-4 text-sm text-muted">
              <Loader2 size={16} className="animate-spin" /> Searching…
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-4 text-sm text-muted">
              No matches for &ldquo;{term.trim()}&rdquo;.
            </div>
          ) : (
            <>
              <ul className="max-h-[60vh] overflow-y-auto py-1">
                {results.map((p, i) => {
                  const v = p.variants.find((x) => x.id === p.defaultVariantId) || p.variants[0];
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onMouseEnter={() => setActive(i)}
                        onClick={() => go(`/p/${p.slug}`)}
                        className={cn(
                          "flex w-full items-center gap-3 px-3 py-2 text-left",
                          active === i ? "bg-cream" : "hover:bg-cream"
                        )}
                      >
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-cream">
                          {p.images[0] && <Image src={p.images[0]} alt="" fill className="object-cover" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                          {p.badges[0] && <p className="truncate text-xs text-muted">{p.badges[0]}</p>}
                        </div>
                        <span className="shrink-0 text-sm font-semibold text-ink">{formatINR(v?.price || 0)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <button
                type="button"
                onClick={() => go(`/search?q=${encodeURIComponent(term.trim())}`)}
                className="block w-full border-t border-sand px-4 py-2.5 text-center text-sm font-medium text-terracotta-600 hover:bg-cream"
              >
                See all results for &ldquo;{term.trim()}&rdquo; →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

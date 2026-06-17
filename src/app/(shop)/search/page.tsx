"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";
import { ProductGrid } from "@/components/shop/sections";
import { Skeleton } from "@/components/ui/Spinner";
import { searchProducts } from "@/lib/firebase/products";
import type { Product } from "@/lib/types";

function SearchInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const q = sp.get("q") || "";
  const [term, setTerm] = useState(q);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTerm(q);
    if (!q) {
      setResults([]);
      return;
    }
    setLoading(true);
    searchProducts(q).then((r) => {
      setResults(r);
      setLoading(false);
    });
  }, [q]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(term.trim())}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <form onSubmit={submit} className="mx-auto max-w-xl">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
          <input
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search plants, seeds, pots…"
            className="w-full rounded-full border border-sand bg-cream py-3.5 pl-12 pr-4 text-base focus:border-terracotta-400 focus:outline-none"
          />
        </div>
      </form>

      {q && (
        <p className="mt-6 text-sm text-muted">
          {loading ? "Searching…" : `${results.length} result${results.length === 1 ? "" : "s"} for `}
          {!loading && <span className="font-medium text-ink">&ldquo;{q}&rdquo;</span>}
        </p>
      )}

      <div className="mt-5">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        ) : q ? (
          results.length ? (
            <ProductGrid products={results} />
          ) : (
            <p className="py-16 text-center text-muted">No products matched your search.</p>
          )
        ) : (
          <p className="py-16 text-center text-muted">Type something to start searching 🌿</p>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-muted">Loading…</div>}>
      <SearchInner />
    </Suspense>
  );
}

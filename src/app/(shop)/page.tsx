"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Truck, Leaf, RefreshCw } from "lucide-react";
import { HeroCarousel } from "@/components/shop/HeroCarousel";
import { CategoryStrip, ProductGrid, SectionHeading } from "@/components/shop/sections";
import { Skeleton } from "@/components/ui/Spinner";
import { useSite } from "@/context/SiteContext";
import { getHero } from "@/lib/firebase/settings";
import { listFeatured, listProducts } from "@/lib/firebase/products";
import type { HeroSlide, Product } from "@/lib/types";

const perks = [
  { icon: Leaf, title: "Healthy Plants", text: "Nursery-fresh & hand-checked" },
  { icon: Truck, title: "Safe Delivery", text: "Secure plant-friendly packaging" },
  { icon: RefreshCw, title: "7-Day Replacement", text: "On damaged arrivals" },
  { icon: ShieldCheck, title: "Science-Backed", text: "Care backed by research" },
];

export default function HomePage() {
  const { tree } = useSite();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [latest, setLatest] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [hero, feat, all] = await Promise.all([
        getHero(),
        listFeatured(8),
        listProducts({ activeOnly: true }),
      ]);
      setSlides(hero.slides);
      setFeatured(feat);
      setLatest(all.slice(0, 8));
      setLoading(false);
    })();
  }, []);

  return (
    <div className="pb-8">
      <HeroCarousel slides={slides} />

      {/* Perks */}
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl bg-cream p-4 md:grid-cols-4">
          {perks.map((p) => (
            <div key={p.title} className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-leaf-100 text-leaf-700">
                <p.icon size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{p.title}</p>
                <p className="text-xs text-muted">{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <section className="mx-auto mt-12 max-w-7xl px-4 lg:px-6">
        <SectionHeading title="Shop by Category" subtitle="Find the perfect green companion" />
        {tree.length ? (
          <CategoryStrip categories={tree} />
        ) : (
          <div className="grid grid-cols-3 gap-4 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        )}
      </section>

      {/* Featured */}
      <section className="mx-auto mt-14 max-w-7xl px-4 lg:px-6">
        <SectionHeading title="Our Favourite Picks" subtitle="Hand-selected best-sellers" />
        {loading ? <GridSkeleton /> : <ProductGrid products={featured.length ? featured : latest} />}
      </section>

      {/* Promo banner */}
      <section className="mx-auto mt-14 max-w-7xl px-4 lg:px-6">
        <div className="grid items-center gap-6 overflow-hidden rounded-3xl bg-leaf-700 p-8 text-white md:grid-cols-2 md:p-12">
          <div>
            <h2 className="font-display text-2xl font-bold md:text-4xl">
              Grown with science, delivered with love
            </h2>
            <p className="mt-3 text-leaf-50">
              Every HorticoGen plant comes with research-backed care notes so your
              greens thrive — not just survive.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <span className="rounded-full bg-white/15 px-4 py-2 text-sm">🌱 Air-purifying</span>
            <span className="rounded-full bg-white/15 px-4 py-2 text-sm">🐾 Pet-safe options</span>
            <span className="rounded-full bg-white/15 px-4 py-2 text-sm">📄 Research links</span>
          </div>
        </div>
      </section>

      {/* New arrivals */}
      <section className="mx-auto mt-14 max-w-7xl px-4 lg:px-6">
        <SectionHeading title="New Arrivals" />
        {loading ? <GridSkeleton /> : <ProductGrid products={latest} />}
      </section>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-square rounded-2xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      ))}
    </div>
  );
}

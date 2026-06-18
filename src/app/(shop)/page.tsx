"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Truck, Leaf, RefreshCw } from "lucide-react";
import { HeroCarousel } from "@/components/shop/HeroCarousel";
import { HomeSections } from "@/components/shop/HomeSections";
import { getHero } from "@/lib/firebase/settings";
import type { HeroSlide } from "@/lib/types";

const perks = [
  { icon: Leaf, title: "Healthy Plants", text: "Nursery-fresh & hand-checked" },
  { icon: Truck, title: "Safe Delivery", text: "Secure plant-friendly packaging" },
  { icon: RefreshCw, title: "7-Day Replacement", text: "On damaged arrivals" },
  { icon: ShieldCheck, title: "Science-Backed", text: "Care backed by research" },
];

export default function HomePage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);

  useEffect(() => {
    getHero().then((hero) => setSlides(hero.slides));
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

      {/* Admin-configured homepage sections */}
      <HomeSections />
    </div>
  );
}

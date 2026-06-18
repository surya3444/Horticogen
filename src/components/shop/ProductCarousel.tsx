"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

// Horizontal product carousel with clear scroll affordances:
// - desktop arrow buttons (shown only when there's more to scroll)
// - edge fade hints
// - a peeking partial card on mobile so it's obvious more exist
export function ProductCarousel({ products }: { products: Product[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update, products.length]);

  const scroll = (dir: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={ref}
        className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-1 pb-2 sm:gap-4"
      >
        {products.map((p) => (
          <div key={p.id} className="w-[42vw] shrink-0 snap-start sm:w-52 lg:w-56">
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      {/* Edge fade hints (desktop) */}
      <div
        className={cn(
          "pointer-events-none absolute left-0 top-0 hidden h-full w-12 bg-gradient-to-r from-white to-transparent transition-opacity lg:block",
          canLeft ? "opacity-100" : "opacity-0"
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute right-0 top-0 hidden h-full w-12 bg-gradient-to-l from-white to-transparent transition-opacity lg:block",
          canRight ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Arrow buttons (desktop) — positioned over the image area */}
      {canLeft && (
        <button
          type="button"
          onClick={() => scroll(-1)}
          aria-label="Scroll left"
          className="absolute left-1 top-[33%] hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-sand bg-white text-ink shadow-md transition hover:bg-terracotta-500 hover:text-white lg:grid"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      {canRight && (
        <button
          type="button"
          onClick={() => scroll(1)}
          aria-label="Scroll right"
          className="absolute right-1 top-[33%] hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-sand bg-white text-ink shadow-md transition hover:bg-terracotta-500 hover:text-white lg:grid"
        >
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
}

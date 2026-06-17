"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroSlide } from "@/lib/types";
import { Button } from "@/components/ui/Button";

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const ordered = [...slides].sort((a, b) => a.order - b.order);
  const count = ordered.length;

  useEffect(() => {
    if (count <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 5500);
    return () => clearInterval(t);
  }, [count]);

  if (!count) {
    return (
      <div className="mx-auto mt-4 grid h-[280px] max-w-7xl place-items-center rounded-2xl bg-leaf-100 px-4 text-center md:h-[440px]">
        <div>
          <h1 className="font-display text-3xl font-bold text-leaf-800 md:text-5xl">
            Bring nature home 🌿
          </h1>
          <p className="mt-2 text-leaf-700">Add hero slides from the admin dashboard.</p>
        </div>
      </div>
    );
  }

  const go = (d: number) => setIndex((i) => (i + d + count) % count);

  return (
    <div className="relative mx-auto mt-3 max-w-7xl overflow-hidden rounded-2xl px-0 sm:px-4">
      <div className="relative h-[340px] w-full overflow-hidden rounded-none sm:rounded-2xl md:h-[480px]">
        {ordered.map((slide, i) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            {/* Mobile image */}
            <Image
              src={slide.mobileImage || slide.desktopImage}
              alt={slide.heading || "Hero"}
              fill
              priority={i === 0}
              className="object-cover sm:hidden"
            />
            {/* Desktop image */}
            <Image
              src={slide.desktopImage || slide.mobileImage}
              alt={slide.heading || "Hero"}
              fill
              priority={i === 0}
              className="hidden object-cover sm:block"
            />
            {(slide.heading || slide.ctaText) && (
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/55 via-ink/10 to-transparent p-6 md:justify-center md:p-14">
                <div className="max-w-lg text-white">
                  {slide.heading && (
                    <h2 className="font-display text-3xl font-bold drop-shadow md:text-5xl">
                      {slide.heading}
                    </h2>
                  )}
                  {slide.subheading && (
                    <p className="mt-2 text-sm md:text-lg md:max-w-md drop-shadow">
                      {slide.subheading}
                    </p>
                  )}
                  {slide.ctaText && slide.ctaLink && (
                    <Link href={slide.ctaLink} className="mt-4 inline-block">
                      <Button size="lg">{slide.ctaText}</Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/80 p-2 text-ink hover:bg-white sm:left-7 sm:block"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => go(1)}
            className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/80 p-2 text-ink hover:bg-white sm:right-7 sm:block"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {ordered.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-white" : "w-2 bg-white/60"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

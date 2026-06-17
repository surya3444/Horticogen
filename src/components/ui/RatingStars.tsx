"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  value,
  size = 16,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            i <= Math.round(value)
              ? "fill-amber-400 text-amber-400"
              : "fill-sand text-sand"
          )}
        />
      ))}
    </div>
  );
}

export function RatingInput({
  value,
  onChange,
  size = 28,
}: {
  value: number;
  onChange: (v: number) => void;
  size?: number;
}) {
  return (
    <div className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" onClick={() => onChange(i)} className="transition-transform hover:scale-110">
          <Star
            size={size}
            className={cn(
              i <= value ? "fill-amber-400 text-amber-400" : "fill-transparent text-sand"
            )}
          />
        </button>
      ))}
    </div>
  );
}

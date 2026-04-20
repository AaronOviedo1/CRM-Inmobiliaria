"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import type { PropertyImage } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PropertyGallery({
  images,
  title,
}: {
  images: PropertyImage[];
  title: string;
}) {
  const [idx, setIdx] = React.useState(0);
  const total = images.length;
  if (total === 0) return null;

  const prev = () => setIdx((i) => (i - 1 + total) % total);
  const next = () => setIdx((i) => (i + 1) % total);
  const current = images[idx]!;

  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
      <div className="relative group overflow-hidden rounded-lg bg-bg aspect-[16/10] border border-border">
        <img
          src={current.url}
          alt={current.altText ?? title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <button
          type="button"
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition"
          aria-label="Anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition"
          aria-label="Siguiente"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
          {idx + 1} / {total}
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
          <Expand className="h-3 w-3" /> Clic para ampliar
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 lg:grid-cols-2 max-h-[440px] overflow-y-auto">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setIdx(i)}
            className={cn(
              "relative aspect-square overflow-hidden rounded-md border",
              i === idx ? "border-gold" : "border-border hover:border-gold/40"
            )}
          >
            <img src={img.url} alt={img.altText ?? ""} className="h-full w-full object-cover" />
            {img.isCover && (
              <span className="absolute left-1 top-1 rounded-sm bg-gold px-1 py-0.5 text-[8px] font-semibold text-black">
                Portada
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

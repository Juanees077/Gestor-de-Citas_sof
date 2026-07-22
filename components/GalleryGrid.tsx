"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTilt } from "@/lib/useTilt";
import type { GalleryImage } from "@/lib/types";

interface GalleryGridProps {
  images: GalleryImage[];
}

export default function GalleryGrid({ images }: GalleryGridProps) {
  const categories = useMemo(() => {
    const set = new Set(images.map((img) => img.category).filter(Boolean));
    return ["Todos", ...Array.from(set)];
  }, [images]);

  const [activeCategory, setActiveCategory] = useState("Todos");

  const filtered = useMemo(
    () =>
      activeCategory === "Todos"
        ? images
        : images.filter((img) => img.category === activeCategory),
    [images, activeCategory]
  );

  if (images.length === 0) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-rose-200 bg-rose-50/50 py-16 px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto mb-4">
          <ImageOff className="w-6 h-6 text-rose-400" />
        </div>
        <p className="font-display text-lg font-semibold text-gray-700">
          Próximamente nuevas fotos
        </p>
        <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
          Estoy preparando la galería con mis mejores trabajos. ¡Vuelve pronto!
        </p>
      </div>
    );
  }

  return (
    <div>
      {categories.length > 2 && (
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium border-2 transition-all",
                activeCategory === cat
                  ? "bg-rose-500 border-rose-500 text-white shadow-rose-sm"
                  : "bg-white border-gray-200 text-gray-500 hover:border-rose-200 hover:text-rose-600"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="columns-2 md:columns-3 gap-3 sm:gap-4 space-y-3 sm:space-y-4">
        {filtered.map((img, index) => (
          <GalleryItem key={img.id} img={img} index={index} />
        ))}
      </div>
    </div>
  );
}

function GalleryItem({ img, index }: { img: GalleryImage; index: number }) {
  const { ref, onMouseMove, onMouseLeave } = useTilt({ max: 10, scale: 1.03 });

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="group relative block w-full break-inside-avoid overflow-hidden rounded-2xl bg-gray-100 shadow-soft animate-on-scroll anim-fade-up is-visible transition-transform duration-200 ease-out will-change-transform"
      style={{ animationDelay: `${(index % 6) * 60}ms` }}
    >
      <Image
        src={img.image_url}
        alt={img.caption || "Trabajo realizado"}
        width={600}
        height={800}
        unoptimized
        className="w-full h-auto object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
        {img.caption && (
          <p className="p-4 text-white text-sm font-medium text-left line-clamp-2">{img.caption}</p>
        )}
      </div>
    </div>
  );
}

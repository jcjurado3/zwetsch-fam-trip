"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import Image from "next/image";
import { useRef, useState } from "react";
import { X } from "lucide-react";
import { getMediaPublicUrl } from "@/lib/supabase/data";
import type { MediaItem } from "@/lib/types";

interface MediaGalleryProps {
  items: MediaItem[];
}

export function MediaGallery({ items }: MediaGalleryProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState<MediaItem | null>(null);

  useGSAP(
    () => {
      if (!gridRef.current) return;
      const cells = gridRef.current.querySelectorAll(".media-item");
      if (!cells.length) return;
      gsap.to(cells, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.06,
        ease: "power3.out",
      });
    },
    { scope: gridRef, dependencies: [items.length] }
  );

  if (!items.length) {
    return (
      <div className="card-surface animate-item rounded-3xl p-8 text-center">
        <p className="font-serif text-lg font-semibold">No photos yet</p>
        <p className="mt-2 text-sm text-muted">
          Upload your first vacation memory above!
        </p>
      </div>
    );
  }

  return (
    <>
      <div ref={gridRef} className="grid grid-cols-2 gap-3">
        {items.map((item) => {
          const url = getMediaPublicUrl(item.file_path);
          const isVideo = item.file_path.match(/\.(mp4|mov|webm)$/i);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setLightbox(item)}
              className="media-item animate-item relative aspect-square overflow-hidden rounded-2xl card-surface transition-transform active:scale-[0.97]"
            >
              {isVideo ? (
                <video
                  src={url}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                />
              ) : (
                <Image
                  src={url}
                  alt={item.caption || "Vacation photo"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 256px) 50vw, 256px"
                />
              )}
              {(item.caption || item.uploader_name) && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  {item.uploader_name && (
                    <p className="text-[10px] text-white/80">
                      {item.uploader_name}
                    </p>
                  )}
                  {item.caption && (
                    <p className="text-xs font-medium text-white line-clamp-2">
                      {item.caption}
                    </p>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative max-h-[80vh] w-full max-w-lg">
            {lightbox.file_path.match(/\.(mp4|mov|webm)$/i) ? (
              <video
                src={getMediaPublicUrl(lightbox.file_path)}
                className="mx-auto max-h-[80vh] w-full rounded-2xl"
                controls
                autoPlay
              />
            ) : (
              <Image
                src={getMediaPublicUrl(lightbox.file_path)}
                alt={lightbox.caption || "Vacation photo"}
                width={800}
                height={800}
                className="mx-auto max-h-[80vh] w-auto rounded-2xl object-contain"
              />
            )}
            {(lightbox.caption || lightbox.uploader_name) && (
              <div className="mt-4 text-center text-white">
                {lightbox.uploader_name && (
                  <p className="text-sm text-white/70">{lightbox.uploader_name}</p>
                )}
                {lightbox.caption && (
                  <p className="mt-1 font-medium">{lightbox.caption}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

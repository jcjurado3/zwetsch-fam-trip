"use client";

import { useCallback, useEffect, useState } from "react";
import { MediaGallery } from "@/components/MediaGallery";
import { MediaUploadForm } from "@/components/MediaUploadForm";
import { PageHero } from "@/components/PageHero";
import type { MediaItem } from "@/lib/types";
import { SEED_TRIP_ID } from "@/lib/seed-data";

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMedia = useCallback(async () => {
    try {
      const res = await fetch("/api/media");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch {
      // keep empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  return (
    <div className="space-y-6">
      <PageHero
        title="Share Media"
        subtitle="Upload and browse vacation photos & videos"
      />

      <MediaUploadForm tripId={SEED_TRIP_ID} onUploadComplete={fetchMedia} />

      <section>
        <h2 className="animate-item mb-3 font-serif text-lg font-semibold">
          Gallery
        </h2>
        {loading ? (
          <div className="py-8 text-center text-muted">Loading...</div>
        ) : (
          <MediaGallery items={items} />
        )}
      </section>
    </div>
  );
}

"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";

interface MediaUploadFormProps {
  tripId: string;
  onUploadComplete: () => void;
}

export function MediaUploadForm({
  tripId,
  onUploadComplete,
}: MediaUploadFormProps) {
  const [caption, setCaption] = useState("");
  const [uploaderName, setUploaderName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useGSAP(
    () => {
      if (!formRef.current) return;
      gsap.to(formRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power3.out",
      });
    },
    { scope: formRef }
  );

  useGSAP(
    () => {
      if (!previewRef.current || !previewUrl) return;
      gsap.fromTo(
        previewRef.current,
        { opacity: 0, y: 12, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "power2.out" }
      );
    },
    { dependencies: [previewUrl], scope: previewRef }
  );

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function clearFile() {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.files?.[0] ?? null;
    if (!next) {
      clearFile();
      return;
    }

    if (!next.type.startsWith("image/") && !next.type.startsWith("video/")) {
      setError("Please choose a photo or video");
      clearFile();
      return;
    }

    setError(null);
    setFile(next);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!file) {
      setError("Please select a photo or video");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tripId", tripId);
      if (caption) formData.append("caption", caption);
      if (uploaderName) formData.append("uploaderName", uploaderName);

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed");
      }

      setCaption("");
      setUploaderName("");
      clearFile();
      onUploadComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const isVideo = Boolean(file?.type.startsWith("video/"));

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="animate-item card-surface mb-6 rounded-3xl p-5"
    >
      <h2 className="font-serif text-lg font-semibold">Share a Memory</h2>
      <p className="mt-1 text-sm text-muted">
        Upload photos and videos from the trip
      </p>

      {previewUrl && file ? (
        <div ref={previewRef} className="relative mt-4 overflow-hidden rounded-2xl">
          <div className="relative aspect-[4/3] bg-background/60">
            {isVideo ? (
              <video
                src={previewUrl}
                className="h-full w-full object-cover"
                controls
                playsInline
                muted
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- local blob preview
              <img
                src={previewUrl}
                alt="Upload preview"
                className="h-full w-full object-cover"
              />
            )}
          </div>

          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/70 to-transparent p-3 pt-10">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {file.name}
              </p>
              <p className="text-xs text-white/70">
                {isVideo ? "Video" : "Photo"} · {(file.size / 1024 / 1024).toFixed(1)}{" "}
                MB
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <label className="cursor-pointer rounded-xl bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                Change
                <input
                  ref={fileInputRef}
                  type="file"
                  name="file"
                  accept="image/*,video/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={handleFileChange}
                />
              </label>
              <button
                type="button"
                onClick={clearFile}
                disabled={uploading}
                aria-label="Remove selected file"
                className="rounded-xl bg-white/15 p-1.5 text-white backdrop-blur-sm disabled:opacity-60"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-surface-border bg-background/50 py-8 transition-colors hover:border-primary/50">
          <Upload className="h-8 w-8 text-primary" />
          <span className="mt-2 text-sm font-medium">Tap to choose file</span>
          <span className="mt-1 text-xs text-muted">JPG, PNG, MP4, MOV</span>
          <input
            ref={fileInputRef}
            type="file"
            name="file"
            accept="image/*,video/*"
            className="hidden"
            disabled={uploading}
            onChange={handleFileChange}
          />
        </label>
      )}

      <div className="mt-4 space-y-3">
        <input
          type="text"
          placeholder="Your name (optional)"
          value={uploaderName}
          onChange={(e) => setUploaderName(e.target.value)}
          className="w-full rounded-2xl border border-surface-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
          disabled={uploading}
        />
        <input
          type="text"
          placeholder="Caption (optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full rounded-2xl border border-surface-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
          disabled={uploading}
        />
      </div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={uploading || !file}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          "Upload"
        )}
      </button>
    </form>
  );
}

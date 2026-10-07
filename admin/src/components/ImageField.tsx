"use client";

import { useState } from "react";
import { media, uploadImage } from "@/lib/api";
import { btnGhost, field } from "@/lib/ui";

export function Thumb({ src, className = "h-16 w-16" }: { src: string; className?: string }) {
  if (!src) {
    return <div className={`${className} shrink-0 rounded-md border border-dashed border-line bg-[#f7f7f8]`} />;
  }
  return <img src={media(src)} alt="" className={`${className} shrink-0 rounded-md object-cover ring-1 ring-black/5`} />;
}

export default function ImageField({
  value,
  onChange,
  placeholder = "/uploads/... or https://...",
}: {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [over, setOver] = useState(false);

  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      onChange(await uploadImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className={`rounded-lg transition ${over ? "bg-[#f7f7f8] ring-2 ring-ink/20" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        void upload(e.dataTransfer.files?.[0]);
      }}
    >
      <div className="flex items-center gap-2">
        <Thumb src={value} className="h-11 w-11" />
        <input className={field} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
        <label className={`${btnGhost} shrink-0 cursor-pointer ${uploading ? "pointer-events-none opacity-50" : ""}`}>
          {uploading ? "Uploading..." : "Upload"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              void upload(file);
            }}
          />
        </label>
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

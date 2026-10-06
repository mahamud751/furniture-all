"use client";

import { useCallback, useEffect, useState } from "react";
import { api, statusLabel } from "./api";

export const btn =
  "inline-flex h-10 items-center justify-center rounded-[5px] bg-ink px-4 text-sm font-medium text-white transition hover:bg-black disabled:opacity-50";
export const btnGhost =
  "inline-flex h-10 items-center justify-center rounded-[5px] border border-line bg-white px-4 text-sm font-medium text-ink transition hover:bg-[#f7f7f8] disabled:opacity-50";
export const btnDanger =
  "inline-flex h-10 items-center justify-center rounded-[5px] border border-[#ffd0cc] bg-white px-4 text-sm font-medium text-danger";
export const field =
  "h-11 w-full rounded-[5px] border border-line bg-white px-3 text-sm text-ink outline-none transition focus:border-ink";
export const area =
  "min-h-28 w-full rounded-[5px] border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-ink";
export const label = "mb-1.5 block text-[11px] font-semibold tracking-[0.14em] text-muted uppercase";

export function StatusPill({ status }: { status: string }) {
  const tone =
    status === "delivered"
      ? "bg-[#e7f6ee] text-[#1f7a4d]"
      : status === "confirmed"
        ? "bg-[#e8f1fb] text-[#1d4e89]"
        : status === "processing"
          ? "bg-[#fff4d6] text-[#8a5a00]"
          : status === "cancelled"
            ? "bg-[#fdecec] text-[#9b1c1c]"
            : status === "in"
              ? "bg-[#e7f6ee] text-[#1f7a4d]"
              : status === "out"
                ? "bg-[#fdecec] text-[#9b1c1c]"
                : "bg-[#f2f2f2] text-[#3a3a3c]";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ${tone}`}>
      {statusLabel[status] ?? status}
    </span>
  );
}

export function Banner({ children }: { children: string }) {
  if (!children) return null;
  return <p className="rounded-[5px] bg-[#fdecec] px-3 py-2 text-sm text-[#9b1c1c]">{children}</p>;
}

export function useResource<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(path));

  const reload = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    try {
      setData(await api<T>(path));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load this page.");
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, error, loading, reload, setData };
}

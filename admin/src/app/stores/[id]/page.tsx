"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { api, send, uploadImage } from "@/lib/api";
import { Banner, btn, btnDanger, btnGhost, field, label, useResource } from "@/lib/ui";

type Store = {
  id: string;
  slug: string;
  title: string;
  type: string;
  region: string;
  address: string;
  contact: string;
  hours: string[];
  mapUrl: string;
  lat: number | null;
  lng: number | null;
  image: string;
  sortOrder: number;
  active: boolean;
};

const blank: Omit<Store, "id"> = {
  slug: "",
  title: "",
  type: "Multi-Brand Store",
  region: "DHAKA",
  address: "",
  contact: "",
  hours: ["10:00 AM - 08:00 PM (Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday)"],
  mapUrl: "",
  lat: null,
  lng: null,
  image: "",
  sortOrder: 0,
  active: true,
};

export default function StoreEditorPage() {
  const params = useParams<{ id: string }>();
  const creating = params.id === "new";
  const router = useRouter();
  const existing = useResource<Store[]>(creating ? null : "/admin/stores");
  const [form, setForm] = useState(blank);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [ready, setReady] = useState(creating);

  useEffect(() => {
    const store = existing.data?.find((item) => item.id === params.id);
    if (!store) return;
    setForm({ ...store, lat: store.lat, lng: store.lng });
    setReady(true);
  }, [existing.data, params.id]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      const payload = {
        slug: form.slug,
        title: form.title,
        type: form.type,
        region: form.region,
        address: form.address,
        contact: form.contact,
        hours: form.hours,
        mapUrl: form.mapUrl,
        lat: form.lat === null || Number.isNaN(Number(form.lat)) ? null : Number(form.lat),
        lng: form.lng === null || Number.isNaN(Number(form.lng)) ? null : Number(form.lng),
        image: form.image,
        sortOrder: form.sortOrder,
        active: form.active,
      };
      await send(creating ? "/admin/stores" : `/admin/stores/${params.id}`, payload, creating ? "POST" : "PUT");
      router.replace("/stores");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the store.");
      setPending(false);
    }
  };

  return (
    <Shell title={creating ? "New store" : "Edit store"} action={<Link href="/stores" className={btnGhost}>All stores</Link>}>
      {ready && (
        <form onSubmit={save} className="max-w-3xl space-y-4 rounded-xl bg-white p-5 ring-1 ring-black/5">
          <div className="grid gap-4 sm:grid-cols-2">
            {([
              ["title", "Name"],
              ["slug", "Slug"],
              ["type", "Type"],
              ["region", "Region"],
              ["contact", "Phone"],
              ["mapUrl", "Map link"],
            ] as const).map(([key, name]) => (
              <label key={key} className="block">
                <span className={label}>{name}</span>
                <input className={field} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              </label>
            ))}
            <label className="block sm:col-span-2">
              <span className={label}>Address</span>
              <input className={field} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </label>
            <label className="block sm:col-span-2">
              <span className={label}>Hours, one line each</span>
              <textarea className="min-h-20 w-full rounded-[5px] border border-line px-3 py-2 text-sm outline-none" value={form.hours.join("\n")} onChange={(e) => setForm({ ...form, hours: e.target.value.split("\n") })} />
            </label>
            <label className="block">
              <span className={label}>Latitude</span>
              <input className={field} value={form.lat ?? ""} onChange={(e) => setForm({ ...form, lat: e.target.value === "" ? null : Number(e.target.value) })} />
            </label>
            <label className="block">
              <span className={label}>Longitude</span>
              <input className={field} value={form.lng ?? ""} onChange={(e) => setForm({ ...form, lng: e.target.value === "" ? null : Number(e.target.value) })} />
            </label>
            <label className="block">
              <span className={label}>Sort order</span>
              <input className={field} type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
            </label>
            <label className="block">
              <span className={label}>Image</span>
              <div className="flex gap-2">
                <input className={field} value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
                <label className={`${btnGhost} cursor-pointer`}>
                  Upload
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) setForm({ ...form, image: await uploadImage(file) });
                  }} />
                </label>
              </div>
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            Visible on the store locator
          </label>
          <Banner>{error}</Banner>
          <div className="flex gap-2">
            <button className={btn} disabled={pending}>{pending ? "Saving..." : "Save store"}</button>
            {!creating && (
              <button type="button" className={btnDanger} onClick={async () => {
                if (!confirm("Delete this store?")) return;
                await api(`/admin/stores/${params.id}`, { method: "DELETE" });
                router.replace("/stores");
              }}>Delete</button>
            )}
          </div>
        </form>
      )}
    </Shell>
  );
}

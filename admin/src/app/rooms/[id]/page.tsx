"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import ImageField from "@/components/ImageField";
import { api, send } from "@/lib/api";
import { Banner, btn, btnDanger, btnGhost, field, label, useResource } from "@/lib/ui";

type Child = { id?: string; slug: string; title: string; image: string; sortOrder: number };
type Room = {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  sortOrder: number;
  navOrder: number;
  showOnHome: boolean;
  children: Child[];
};

const blank = { slug: "", title: "", description: "", image: "", sortOrder: 0, navOrder: 0, showOnHome: false, children: [] as Child[] };

export default function RoomEditorPage() {
  const params = useParams<{ id: string }>();
  const creating = params.id === "new";
  const router = useRouter();
  const existing = useResource<Room[]>(creating ? null : "/admin/rooms");
  const [form, setForm] = useState(blank);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [ready, setReady] = useState(creating);

  useEffect(() => {
    const room = existing.data?.find((item) => item.id === params.id);
    if (!room) return;
    setForm({
      slug: room.slug,
      title: room.title,
      description: room.description,
      image: room.image,
      sortOrder: room.sortOrder,
      navOrder: room.navOrder,
      showOnHome: room.showOnHome,
      children: room.children,
    });
    setReady(true);
  }, [existing.data, params.id]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      await send(creating ? "/admin/rooms" : `/admin/rooms/${params.id}`, form, creating ? "POST" : "PUT");
      router.replace("/rooms");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the room.");
      setPending(false);
    }
  };

  return (
    <Shell title={creating ? "New room" : "Edit room"} action={<Link href="/rooms" className={btnGhost}>All rooms</Link>}>
      {!ready && <p className="text-sm text-muted">Loading room...</p>}
      {ready && (
        <form onSubmit={save} className="max-w-3xl space-y-4 rounded-xl bg-white p-5 ring-1 ring-black/5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={label}>Title</span>
              <input className={field} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </label>
            <label className="block">
              <span className={label}>Slug</span>
              <input className={field} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
            </label>
            <label className="block sm:col-span-2">
              <span className={label}>Homepage description</span>
              <input className={field} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>
            <div className="block sm:col-span-2">
              <span className={label}>Image</span>
              <ImageField value={form.image} onChange={(image) => setForm((current) => ({ ...current, image }))} />
            </div>
            <label className="block">
              <span className={label}>Catalogue order</span>
              <input className={field} type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
            </label>
            <label className="block">
              <span className={label}>Menu order</span>
              <input className={field} type="number" value={form.navOrder} onChange={(e) => setForm({ ...form, navOrder: Number(e.target.value) })} />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.showOnHome} onChange={(e) => setForm({ ...form, showOnHome: e.target.checked })} />
            Show in Shop by Room
          </label>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-medium">Categories</h2>
              <button
                type="button"
                className="text-sm underline"
                onClick={() => setForm({ ...form, children: [...form.children, { slug: "", title: "", image: "", sortOrder: form.children.length }] })}
              >
                Add category
              </button>
            </div>
            <div className="space-y-2">
              {form.children.map((child, index) => (
                <div key={child.id ?? index} className="grid gap-2 rounded-lg border border-line p-3 sm:grid-cols-[1fr_1fr_80px_auto]">
                  <input className={field} placeholder="Title" value={child.title} onChange={(e) => {
                    const children = [...form.children];
                    children[index] = { ...child, title: e.target.value };
                    setForm({ ...form, children });
                  }} />
                  <input className={field} placeholder="Slug" value={child.slug} onChange={(e) => {
                    const children = [...form.children];
                    children[index] = { ...child, slug: e.target.value };
                    setForm({ ...form, children });
                  }} />
                  <input className={field} type="number" value={child.sortOrder} onChange={(e) => {
                    const children = [...form.children];
                    children[index] = { ...child, sortOrder: Number(e.target.value) };
                    setForm({ ...form, children });
                  }} />
                  <button type="button" className="text-sm text-danger" onClick={() => setForm({ ...form, children: form.children.filter((_, item) => item !== index) })}>
                    Remove
                  </button>
                  <div className="sm:col-span-4">
                    <ImageField
                      value={child.image}
                      onChange={(image) =>
                        setForm((current) => ({ ...current, children: current.children.map((item, i) => (i === index ? { ...item, image } : item)) }))
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Banner>{error}</Banner>
          <div className="flex gap-2">
            <button className={btn} disabled={pending}>{pending ? "Saving..." : "Save room"}</button>
            {!creating && (
              <button
                type="button"
                className={btnDanger}
                onClick={async () => {
                  if (!confirm("Delete this room and its categories?")) return;
                  await api(`/admin/rooms/${params.id}`, { method: "DELETE" });
                  router.replace("/rooms");
                }}
              >
                Delete
              </button>
            )}
          </div>
        </form>
      )}
    </Shell>
  );
}

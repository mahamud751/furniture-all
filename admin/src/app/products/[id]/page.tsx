"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import ImageField from "@/components/ImageField";
import { api, send, uploadImage } from "@/lib/api";
import { Banner, area, btn, btnDanger, btnGhost, field, label, useResource } from "@/lib/ui";

type Room = {
  id: string;
  title: string;
  children: { id: string; title: string }[];
};

type Product = {
  id: string;
  code: string;
  slug: string;
  title: string;
  brand: string | null;
  price: number;
  discount: number;
  colors: number;
  inStock: boolean;
  description: string;
  details: string;
  specifications: { title: string; html: string }[];
  images: string[];
  roomIds: string[];
  subCategoryIds: string[];
};

const empty = {
  code: "",
  slug: "",
  title: "",
  brand: "Savasaachi",
  price: 0,
  discount: 0,
  colors: 1,
  inStock: true,
  description: "",
  details: "",
  specifications: [
    { title: "Materials", html: "" },
    { title: "Care", html: "" },
  ],
  images: [] as string[],
  roomIds: [] as string[],
  subCategoryIds: [] as string[],
};

export default function ProductEditorPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const creating = id === "new";
  const router = useRouter();
  const rooms = useResource<Room[]>("/admin/rooms");
  const existing = useResource<Product>(creating ? null : `/admin/products/${id}`);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [loaded, setLoaded] = useState(creating);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!existing.data) return;
    setForm({
      code: existing.data.code,
      slug: existing.data.slug,
      title: existing.data.title,
      brand: existing.data.brand ?? "",
      price: existing.data.price,
      discount: existing.data.discount,
      colors: existing.data.colors,
      inStock: existing.data.inStock,
      description: existing.data.description,
      details: existing.data.details,
      specifications: existing.data.specifications.length ? existing.data.specifications : empty.specifications,
      images: existing.data.images,
      roomIds: existing.data.roomIds,
      subCategoryIds: existing.data.subCategoryIds,
    });
    setLoaded(true);
  }, [existing.data]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((current) => ({ ...current, [key]: value }));

  const toggle = (key: "roomIds" | "subCategoryIds", value: string) => {
    setForm((current) => ({
      ...current,
      [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value],
    }));
  };

  const addFiles = async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    setError("");
    try {
      for (const file of files) {
        const url = await uploadImage(file);
        setForm((current) => ({ ...current, images: [...current.images, url] }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      const saved = await send<{ id: string }>(creating ? "/admin/products" : `/admin/products/${id}`, form, creating ? "POST" : "PUT");
      router.replace(`/products/${saved.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the product.");
    } finally {
      setPending(false);
    }
  };

  const remove = async () => {
    if (!confirm("Delete this product?")) return;
    await api(`/admin/products/${id}`, { method: "DELETE" });
    router.replace("/products");
  };

  return (
    <Shell
      title={creating ? "New product" : "Edit product"}
      action={
        <Link href="/products" className={btnGhost}>
          All products
        </Link>
      }
    >
      {!loaded && <p className="text-sm text-muted">Loading product...</p>}
      {loaded && (
        <form onSubmit={save} className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <section className="space-y-4 rounded-xl bg-white p-5 ring-1 ring-black/5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className={label}>Title</span>
                  <input className={field} value={form.title} onChange={(e) => set("title", e.target.value)} required />
                </label>
                <label className="block">
                  <span className={label}>Product code</span>
                  <input className={field} value={form.code} onChange={(e) => set("code", e.target.value)} required />
                </label>
                <label className="block sm:col-span-2">
                  <span className={label}>Slug</span>
                  <input className={field} value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="left blank to build from the title" />
                </label>
              </div>
              <label className="block">
                <span className={label}>Description HTML</span>
                <textarea className={area} value={form.description} onChange={(e) => set("description", e.target.value)} />
              </label>
              <label className="block">
                <span className={label}>Details HTML</span>
                <textarea className={area} value={form.details} onChange={(e) => set("details", e.target.value)} />
              </label>
            </section>
            <section className="rounded-xl bg-white p-5 ring-1 ring-black/5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-medium">Specifications</h2>
                <button type="button" className="text-sm underline" onClick={() => set("specifications", [...form.specifications, { title: "", html: "" }])}>
                  Add
                </button>
              </div>
              <div className="space-y-4">
                {form.specifications.map((spec, index) => (
                  <div key={index} className="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)_auto]">
                    <input
                      className={field}
                      value={spec.title}
                      placeholder="Title"
                      onChange={(e) => {
                        const specifications = [...form.specifications];
                        specifications[index] = { ...spec, title: e.target.value };
                        set("specifications", specifications);
                      }}
                    />
                    <textarea
                      className={area}
                      value={spec.html}
                      placeholder="HTML"
                      onChange={(e) => {
                        const specifications = [...form.specifications];
                        specifications[index] = { ...spec, html: e.target.value };
                        set("specifications", specifications);
                      }}
                    />
                    <button
                      type="button"
                      className="text-sm text-danger"
                      onClick={() => set("specifications", form.specifications.filter((_, item) => item !== index))}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded-xl bg-white p-5 ring-1 ring-black/5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-medium">Images</h2>
                <label className={`${btnGhost} cursor-pointer ${uploading ? "pointer-events-none opacity-50" : ""}`}>
                  {uploading ? "Uploading..." : "Upload images"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files ?? []);
                      e.target.value = "";
                      void addFiles(files);
                    }}
                  />
                </label>
              </div>
              <div className="space-y-3">
                {form.images.map((image, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <ImageField
                        value={image}
                        onChange={(url) =>
                          setForm((current) => ({ ...current, images: current.images.map((item, i) => (i === index ? url : item)) }))
                        }
                      />
                    </div>
                    <button type="button" className="text-sm text-danger" onClick={() => setForm((current) => ({ ...current, images: current.images.filter((_, item) => item !== index) }))}>
                      Remove
                    </button>
                  </div>
                ))}
                {!form.images.length && <p className="text-sm text-muted">No images yet. Upload or drop files, or add a path.</p>}
                <button type="button" className="text-sm underline" onClick={() => set("images", [...form.images, ""])}>
                  Add image path
                </button>
              </div>
            </section>
          </div>
          <aside className="space-y-4">
            <section className="space-y-4 rounded-xl bg-white p-5 ring-1 ring-black/5">
              <label className="block">
                <span className={label}>Brand</span>
                <input className={field} value={form.brand} onChange={(e) => set("brand", e.target.value)} />
              </label>
              <label className="block">
                <span className={label}>Price</span>
                <input className={field} type="number" min={0} value={form.price} onChange={(e) => set("price", Number(e.target.value))} />
              </label>
              <label className="block">
                <span className={label}>Discount amount</span>
                <input className={field} type="number" min={0} value={form.discount} onChange={(e) => set("discount", Number(e.target.value))} />
              </label>
              <p className="text-sm text-muted">Final price {Math.max(0, form.price - form.discount).toLocaleString("en-US")}</p>
              <label className="block">
                <span className={label}>Colours</span>
                <input className={field} type="number" min={1} value={form.colors} onChange={(e) => set("colors", Number(e.target.value))} />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.inStock} onChange={(e) => set("inStock", e.target.checked)} />
                In stock
              </label>
              <Banner>{error || existing.error || ""}</Banner>
              <button className={`${btn} w-full`} disabled={pending}>
                {pending ? "Saving..." : "Save product"}
              </button>
              {!creating && (
                <button type="button" className={`${btnDanger} w-full`} onClick={remove}>
                  Delete
                </button>
              )}
            </section>
            <section className="rounded-xl bg-white p-5 ring-1 ring-black/5">
              <h2 className="font-medium">Rooms</h2>
              <div className="mt-3 space-y-4">
                {(rooms.data ?? []).map((room) => (
                  <div key={room.id}>
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <input type="checkbox" checked={form.roomIds.includes(room.id)} onChange={() => toggle("roomIds", room.id)} />
                      {room.title}
                    </label>
                    <div className="mt-2 space-y-1 pl-6">
                      {room.children.map((child) => (
                        <label key={child.id} className="flex items-center gap-2 text-sm text-muted">
                          <input type="checkbox" checked={form.subCategoryIds.includes(child.id)} onChange={() => toggle("subCategoryIds", child.id)} />
                          {child.title}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </form>
      )}
    </Shell>
  );
}

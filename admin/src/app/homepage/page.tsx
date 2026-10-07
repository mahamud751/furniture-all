"use client";

import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import ImageField from "@/components/ImageField";
import { send } from "@/lib/api";
import { Banner, btn, field, label, useResource } from "@/lib/ui";

type Item = { title: string; image: string; href: string; productCode: string; productTitle?: string; sortOrder: number };
type Block = { kind: "tiles" | "products"; slug: string; title: string; sortOrder: number; items: Item[] };
type Home = { heroDesktop: string; heroMobile: string; heroHref: string; blocks: Block[] };

const emptyItem = (): Item => ({ title: "", image: "", href: "", productCode: "", sortOrder: 0 });

export default function HomepagePage() {
  const { data, error } = useResource<Home>("/admin/homepage");
  const [form, setForm] = useState<Home | null>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const updateBlock = (index: number, block: Block) => {
    setForm((current) => (current ? { ...current, blocks: current.blocks.map((item, i) => (i === index ? block : item)) } : current));
  };

  const updateItem = (index: number, itemIndex: number, patch: Partial<Item>) => {
    setForm((current) =>
      current
        ? {
            ...current,
            blocks: current.blocks.map((block, i) =>
              i === index ? { ...block, items: block.items.map((item, j) => (j === itemIndex ? { ...item, ...patch } : item)) } : block,
            ),
          }
        : current,
    );
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setPending(true);
    setMessage("");
    try {
      const saved = await send<Home>("/admin/homepage", form, "PUT");
      setForm(saved);
      setMessage("Homepage saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save the homepage.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Shell title="Homepage">
      {error && <p className="text-sm text-danger">{error}</p>}
      {form && (
        <form onSubmit={save} className="max-w-4xl space-y-6">
          <section className="grid gap-4 rounded-xl bg-white p-5 ring-1 ring-black/5 sm:grid-cols-2">
            <h2 className="font-medium sm:col-span-2">Hero</h2>
            <div className="block"><span className={label}>Desktop image</span><ImageField value={form.heroDesktop} onChange={(heroDesktop) => setForm((current) => (current ? { ...current, heroDesktop } : current))} /></div>
            <div className="block"><span className={label}>Mobile image</span><ImageField value={form.heroMobile} onChange={(heroMobile) => setForm((current) => (current ? { ...current, heroMobile } : current))} /></div>
            <label className="block sm:col-span-2"><span className={label}>Hero link</span><input className={field} value={form.heroHref} onChange={(e) => setForm({ ...form, heroHref: e.target.value })} /></label>
          </section>
          {form.blocks.map((block, index) => (
            <section key={index} className="space-y-3 rounded-xl bg-white p-5 ring-1 ring-black/5">
              <div className="grid gap-3 sm:grid-cols-4">
                <label className="block"><span className={label}>Kind</span>
                  <select className={field} value={block.kind} onChange={(e) => updateBlock(index, { ...block, kind: e.target.value as Block["kind"] })}>
                    <option value="tiles">Category tiles</option>
                    <option value="products">Product row</option>
                  </select>
                </label>
                <label className="block"><span className={label}>Title</span><input className={field} value={block.title} onChange={(e) => updateBlock(index, { ...block, title: e.target.value })} /></label>
                <label className="block"><span className={label}>Room slug</span><input className={field} value={block.slug} onChange={(e) => updateBlock(index, { ...block, slug: e.target.value })} /></label>
                <label className="block"><span className={label}>Order</span><input className={field} type="number" value={block.sortOrder} onChange={(e) => updateBlock(index, { ...block, sortOrder: Number(e.target.value) })} /></label>
              </div>
              {block.items.map((item, itemIndex) => (
                <div key={itemIndex} className="grid gap-2 rounded-lg border border-line p-3 sm:grid-cols-2">
                  {block.kind === "products" ? (
                    <label className="block sm:col-span-2">
                      <span className={label}>Product code {item.productTitle ? `· ${item.productTitle}` : ""}</span>
                      <input className={field} value={item.productCode} onChange={(e) => {
                        const items = [...block.items];
                        items[itemIndex] = { ...item, productCode: e.target.value };
                        updateBlock(index, { ...block, items });
                      }} />
                    </label>
                  ) : (
                    <>
                      <input className={field} placeholder="Title" value={item.title} onChange={(e) => {
                        const items = [...block.items];
                        items[itemIndex] = { ...item, title: e.target.value };
                        updateBlock(index, { ...block, items });
                      }} />
                      <div className="sm:col-span-2">
                        <ImageField value={item.image} onChange={(image) => updateItem(index, itemIndex, { image })} />
                      </div>
                      <input className={`${field} sm:col-span-2`} placeholder="Link" value={item.href} onChange={(e) => {
                        const items = [...block.items];
                        items[itemIndex] = { ...item, href: e.target.value };
                        updateBlock(index, { ...block, items });
                      }} />
                    </>
                  )}
                  <button type="button" className="text-left text-sm text-danger" onClick={() => updateBlock(index, { ...block, items: block.items.filter((_, current) => current !== itemIndex) })}>Remove item</button>
                </div>
              ))}
              <div className="flex gap-4">
                <button type="button" className="text-sm underline" onClick={() => updateBlock(index, { ...block, items: [...block.items, { ...emptyItem(), sortOrder: block.items.length }] })}>Add item</button>
                <button type="button" className="text-sm text-danger" onClick={() => setForm({ ...form, blocks: form.blocks.filter((_, current) => current !== index) })}>Remove section</button>
              </div>
            </section>
          ))}
          <button type="button" className="text-sm underline" onClick={() => setForm({ ...form, blocks: [...form.blocks, { kind: "products", slug: "", title: "New section", sortOrder: form.blocks.length, items: [] }] })}>Add section</button>
          {message && !message.startsWith("Homepage") && <Banner>{message}</Banner>}
          {message.startsWith("Homepage") && <p className="text-sm text-[#1f7a4d]">{message}</p>}
          <button className={btn} disabled={pending}>{pending ? "Saving..." : "Save homepage"}</button>
        </form>
      )}
    </Shell>
  );
}

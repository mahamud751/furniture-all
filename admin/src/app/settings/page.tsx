"use client";

import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { send } from "@/lib/api";
import { Banner, btn, field, label, useResource } from "@/lib/ui";

type Column = { title: string; links: { label: string; href: string }[] };
type Settings = {
  phone: string;
  phoneHref: string;
  email: string;
  hours: string;
  facebook: string;
  instagram: string;
  insideDhaka: number;
  outsideDhaka: number;
  advancePercent: number;
  digitalPaymentDiscountPercent: number;
  promoBanner: string;
  footerColumns: Column[];
};

export default function SettingsPage() {
  const { data, error } = useResource<Settings>("/admin/settings");
  const [form, setForm] = useState<Settings | null>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setPending(true);
    setMessage("");
    try {
      await send("/admin/settings", form, "PUT");
      setMessage("Settings saved. The shop will use them on the next page load.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save settings.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Shell title="Settings">
      {error && <p className="text-sm text-danger">{error}</p>}
      {form && (
        <form onSubmit={save} className="max-w-4xl space-y-6">
          <section className="grid gap-4 rounded-xl bg-white p-5 ring-1 ring-black/5 sm:grid-cols-2">
            <h2 className="font-medium sm:col-span-2">Service center</h2>
            {([
              ["phone", "Phone"],
              ["phoneHref", "Phone link"],
              ["email", "Email"],
              ["hours", "Hours"],
              ["facebook", "Facebook"],
              ["instagram", "Instagram"],
            ] as const).map(([key, name]) => (
              <label key={key} className="block">
                <span className={label}>{name}</span>
                <input className={field} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              </label>
            ))}
          </section>
          <section className="grid gap-4 rounded-xl bg-white p-5 ring-1 ring-black/5 sm:grid-cols-2">
            <h2 className="font-medium sm:col-span-2">Delivery and promotion</h2>
            <label className="block"><span className={label}>Inside Dhaka shipping</span><input className={field} type="number" value={form.insideDhaka} onChange={(e) => setForm({ ...form, insideDhaka: Number(e.target.value) })} /></label>
            <label className="block"><span className={label}>Outside Dhaka shipping</span><input className={field} type="number" value={form.outsideDhaka} onChange={(e) => setForm({ ...form, outsideDhaka: Number(e.target.value) })} /></label>
            <label className="block"><span className={label}>Advance percent</span><input className={field} type="number" value={form.advancePercent} onChange={(e) => setForm({ ...form, advancePercent: Number(e.target.value) })} /></label>
            <label className="block"><span className={label}>Digital discount percent</span><input className={field} type="number" value={form.digitalPaymentDiscountPercent} onChange={(e) => setForm({ ...form, digitalPaymentDiscountPercent: Number(e.target.value) })} /></label>
            <label className="block sm:col-span-2"><span className={label}>Promo banner</span><input className={field} value={form.promoBanner} onChange={(e) => setForm({ ...form, promoBanner: e.target.value })} /></label>
          </section>
          <section className="space-y-4 rounded-xl bg-white p-5 ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">Footer columns</h2>
              <button type="button" className="text-sm underline" onClick={() => setForm({ ...form, footerColumns: [...form.footerColumns, { title: "New", links: [] }] })}>Add column</button>
            </div>
            {form.footerColumns.map((column, index) => (
              <div key={index} className="rounded-lg border border-line p-3">
                <input className={field} value={column.title} onChange={(e) => {
                  const footerColumns = [...form.footerColumns];
                  footerColumns[index] = { ...column, title: e.target.value };
                  setForm({ ...form, footerColumns });
                }} />
                <div className="mt-3 space-y-2">
                  {column.links.map((link, linkIndex) => (
                    <div key={linkIndex} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                      <input className={field} value={link.label} placeholder="Label" onChange={(e) => {
                        const links = [...column.links];
                        links[linkIndex] = { ...link, label: e.target.value };
                        const footerColumns = [...form.footerColumns];
                        footerColumns[index] = { ...column, links };
                        setForm({ ...form, footerColumns });
                      }} />
                      <input className={field} value={link.href} placeholder="/path" onChange={(e) => {
                        const links = [...column.links];
                        links[linkIndex] = { ...link, href: e.target.value };
                        const footerColumns = [...form.footerColumns];
                        footerColumns[index] = { ...column, links };
                        setForm({ ...form, footerColumns });
                      }} />
                      <button type="button" className="text-sm text-danger" onClick={() => {
                        const footerColumns = [...form.footerColumns];
                        footerColumns[index] = { ...column, links: column.links.filter((_, item) => item !== linkIndex) };
                        setForm({ ...form, footerColumns });
                      }}>Remove</button>
                    </div>
                  ))}
                  <button type="button" className="text-sm underline" onClick={() => {
                    const footerColumns = [...form.footerColumns];
                    footerColumns[index] = { ...column, links: [...column.links, { label: "", href: "/" }] };
                    setForm({ ...form, footerColumns });
                  }}>Add link</button>
                </div>
              </div>
            ))}
          </section>
          {message && !message.startsWith("Settings") && <Banner>{message}</Banner>}
          {message.startsWith("Settings") && <p className="text-sm text-[#1f7a4d]">{message}</p>}
          <button className={btn} disabled={pending}>{pending ? "Saving..." : "Save settings"}</button>
        </form>
      )}
    </Shell>
  );
}

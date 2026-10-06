"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { api, send } from "@/lib/api";
import { Banner, btn, btnDanger, btnGhost, field, label, useResource } from "@/lib/ui";

type Page = { id: string; slug: string; title: string; html: string; published: boolean };

export default function PageEditor() {
  const params = useParams<{ id: string }>();
  const creating = params.id === "new";
  const router = useRouter();
  const existing = useResource<Page>(creating ? null : `/admin/pages/${params.id}`);
  const [form, setForm] = useState({ slug: "", title: "", html: "", published: true });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [ready, setReady] = useState(creating);

  useEffect(() => {
    if (!existing.data) return;
    setForm({ slug: existing.data.slug, title: existing.data.title, html: existing.data.html, published: existing.data.published });
    setReady(true);
  }, [existing.data]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      await send(creating ? "/admin/pages" : `/admin/pages/${params.id}`, form, creating ? "POST" : "PUT");
      router.replace("/pages");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the page.");
      setPending(false);
    }
  };

  return (
    <Shell title={creating ? "New page" : "Edit page"} action={<Link href="/pages" className={btnGhost}>All pages</Link>}>
      {ready && (
        <form onSubmit={save} className="space-y-4 rounded-xl bg-white p-5 ring-1 ring-black/5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={label}>Title</span>
              <input className={field} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </label>
            <label className="block">
              <span className={label}>Slug</span>
              <input className={field} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
            Published
          </label>
          <label className="block">
            <span className={label}>HTML</span>
            <textarea className="min-h-[420px] w-full rounded-[5px] border border-line px-3 py-2 font-mono text-xs outline-none focus:border-ink" value={form.html} onChange={(e) => setForm({ ...form, html: e.target.value })} />
          </label>
          <Banner>{error || existing.error}</Banner>
          <div className="flex gap-2">
            <button className={btn} disabled={pending}>{pending ? "Saving..." : "Save page"}</button>
            {!creating && (
              <button type="button" className={btnDanger} onClick={async () => {
                if (!confirm("Delete this page?")) return;
                await api(`/admin/pages/${params.id}`, { method: "DELETE" });
                router.replace("/pages");
              }}>Delete</button>
            )}
          </div>
        </form>
      )}
    </Shell>
  );
}

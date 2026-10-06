"use client";

import Link from "next/link";
import Shell from "@/components/Shell";
import { when } from "@/lib/api";
import { btn, useResource } from "@/lib/ui";

type Page = { id: string; slug: string; title: string; published: boolean; updatedAt: string };

export default function PagesPage() {
  const { data, error, loading } = useResource<Page[]>("/admin/pages");
  return (
    <Shell title="Pages" action={<Link href="/pages/new" className={btn}>New page</Link>}>
      {loading && <p className="text-sm text-muted">Loading pages...</p>}
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
        {(data ?? []).map((page) => (
          <Link key={page.id} href={`/pages/${page.id}`} className="flex items-center justify-between gap-4 border-b border-line px-4 py-4 last:border-0">
            <span>
              <span className="block font-medium">{page.title}</span>
              <span className="text-sm text-muted">/{page.slug}</span>
            </span>
            <span className="text-right text-xs text-muted">{page.published ? "Published" : "Hidden"}<br />{when(page.updatedAt)}</span>
          </Link>
        ))}
      </div>
    </Shell>
  );
}

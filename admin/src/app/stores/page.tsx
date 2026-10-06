"use client";

import Link from "next/link";
import Shell from "@/components/Shell";
import { btn, useResource } from "@/lib/ui";

type Store = { id: string; title: string; type: string; region: string; address: string; active: boolean };

export default function StoresPage() {
  const { data, error, loading } = useResource<Store[]>("/admin/stores");
  return (
    <Shell title="Stores" action={<Link href="/stores/new" className={btn}>New store</Link>}>
      {loading && <p className="text-sm text-muted">Loading stores...</p>}
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
        {(data ?? []).map((store) => (
          <Link key={store.id} href={`/stores/${store.id}`} className="block border-b border-line px-4 py-4 last:border-0 hover:bg-[#fafafa]">
            <span className="font-medium">{store.title}</span>
            <span className="mt-1 block text-sm text-muted">{store.type} · {store.region} · {store.active ? "Visible" : "Hidden"}</span>
            <span className="mt-1 block text-sm text-muted">{store.address}</span>
          </Link>
        ))}
      </div>
    </Shell>
  );
}

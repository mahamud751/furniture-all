"use client";

import Link from "next/link";
import { useState } from "react";
import Shell from "@/components/Shell";
import { media, money } from "@/lib/api";
import { btn, useResource } from "@/lib/ui";

type List = {
  total: number;
  page: number;
  pageSize: number;
  items: {
    id: string;
    code: string;
    title: string;
    finalPrice: number;
    inStock: boolean;
    image: string;
    rooms: string[];
  }[];
};

export default function ProductsPage() {
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const { data, error, loading } = useResource<List>(`/admin/products?q=${encodeURIComponent(query)}&page=${page}`);
  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <Shell
      title="Products"
      action={
        <Link href="/products/new" className={btn}>
          New product
        </Link>
      }
    >
      <form
        className="mb-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setQuery(q);
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title, code, or slug"
          className="h-11 w-full max-w-md rounded-[5px] border border-line bg-white px-3 text-sm outline-none focus:border-ink"
        />
        <button className={btn}>Search</button>
      </form>
      {loading && <p className="text-sm text-muted">Loading products...</p>}
      {error && <p className="text-sm text-danger">{error}</p>}
      {data && (
        <div className="overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-line text-[11px] tracking-[0.14em] text-muted uppercase">
                <tr>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-3 py-3 font-semibold">Code</th>
                  <th className="px-3 py-3 font-semibold">Rooms</th>
                  <th className="px-3 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 text-right font-semibold">Price</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((product) => (
                  <tr key={product.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/products/${product.id}`} className="flex items-center gap-3">
                        <span className="h-14 w-11 overflow-hidden rounded-md bg-[#f2f2f2]">
                          {product.image && <img src={media(product.image)} alt="" className="h-full w-full object-cover" />}
                        </span>
                        <span className="font-medium underline">{product.title}</span>
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-muted">{product.code}</td>
                    <td className="px-3 py-3 text-muted">{product.rooms.join(", ") || "—"}</td>
                    <td className="px-3 py-3">{product.inStock ? "In stock" : "Out of stock"}</td>
                    <td className="px-4 py-3 text-right font-medium">{money(product.finalPrice)}</td>
                  </tr>
                ))}
                {data.items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted">
                      No products match this search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 text-sm">
            <p className="text-muted">{data.total} products</p>
            <div className="flex gap-2">
              <button className="underline disabled:opacity-40" disabled={page <= 1} onClick={() => setPage((n) => n - 1)}>
                Previous
              </button>
              <span>
                {page} / {pages}
              </span>
              <button className="underline disabled:opacity-40" disabled={page >= pages} onClick={() => setPage((n) => n + 1)}>
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}

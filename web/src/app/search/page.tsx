import type { Metadata } from "next";
import CollectionView from "@/components/collection/CollectionView";
import { fieldClass } from "@/components/fields";
import { searchProducts } from "@/lib/catalog";

function queryFrom(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return (raw ?? "").trim().slice(0, 40);
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  const query = queryFrom(q);
  return { title: query ? `Search: ${query}` : "Search" };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { q } = await searchParams;
  const query = queryFrom(q);

  if (!query) {
    return (
      <section className="pt-16 pb-28">
        <div className="site-container max-w-xl">
          <h1 className="text-2xl font-medium lg:text-5xl">Search</h1>
          <p className="mt-3 text-(--secondary)">Search furniture by name or product code.</p>
          <form action="/search" className="mt-8 flex gap-3">
            <input name="q" required maxLength={40} placeholder="Bed, sofa, SS5110107" className={fieldClass} />
            <button className="h-12 shrink-0 rounded-[5px] bg-(--primary) px-6 text-sm font-medium text-white">
              Search
            </button>
          </form>
        </div>
      </section>
    );
  }

  const products = await searchProducts(query);

  return (
    <CollectionView
      title={`Results for “${query}”`}
      showTitle
      emptyLabel="No products found"
      crumbs={[{ label: "Home", href: "/" }, { label: "Search" }]}
      chips={[]}
      products={products}
    />
  );
}

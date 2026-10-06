import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductSlider from "@/components/ProductSlider";
import ProductView from "@/components/product/ProductView";
import { getProduct, getSite, roomHref } from "@/lib/catalog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };
  const description = product.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return { title: product.title, description: description.slice(0, 160) };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, site] = await Promise.all([getProduct(slug), getSite()]);
  if (!product) notFound();

  return (
    <>
      <section className="pt-6 pb-8 lg:pb-12">
        <div className="site-container">
          <div className="mb-6 rounded-lg bg-black px-4 py-3 text-center text-sm font-medium text-white lg:text-base">
            {site.promoBanner}
          </div>
          <Breadcrumbs
            className="mb-6"
            crumbs={[
              { label: "Home", href: "/" },
              { label: "Furniture", href: "/shop" },
              ...(product.room ? [{ label: product.room.title, href: roomHref(product.room.slug) }] : []),
              { label: product.title },
            ]}
          />
          <ProductView product={product} />
        </div>
      </section>
      {product.related.length > 0 && (
        <ProductSlider
          id="you-may-also-like"
          title="You May Also Like"
          href={product.room ? roomHref(product.room.slug) : "/shop"}
          products={product.related}
        />
      )}
    </>
  );
}

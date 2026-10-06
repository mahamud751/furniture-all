import CategorySlider from "@/components/CategorySlider";
import HeroBanner from "@/components/HeroBanner";
import ProductSlider from "@/components/ProductSlider";
import ShopByRoom from "@/components/ShopByRoom";
import { getHome } from "@/lib/catalog";

export default async function Home() {
  const home = await getHome();

  return (
    <>
      <HeroBanner hero={home.hero} />
      <ShopByRoom rooms={home.rooms} />
      {home.blocks.map((block) =>
        block.kind === "tiles" ? (
          <CategorySlider
            key={`${block.kind}-${block.slug}`}
            id={block.slug}
            title={block.title}
            href={block.href}
            categories={block.categories}
          />
        ) : (
          <ProductSlider
            key={`${block.kind}-${block.slug}`}
            id={block.slug}
            title={block.title}
            href={block.href}
            products={block.products}
          />
        ),
      )}
    </>
  );
}

import type { Metadata } from "next";
import CollectionView from "@/components/collection/CollectionView";
import { getShop, roomHref } from "@/lib/catalog";

export const metadata: Metadata = { title: "All Furniture" };

export default async function ShopPage() {
  const { rooms, products } = await getShop();
  return (
    <CollectionView
      title="Furniture"
      crumbs={[{ label: "Home", href: "/" }, { label: "Furniture" }]}
      chips={[
        { label: "All", href: "/shop", active: true },
        ...rooms.map((room) => ({ label: room.title, href: roomHref(room.slug), active: false })),
      ]}
      products={products}
    />
  );
}

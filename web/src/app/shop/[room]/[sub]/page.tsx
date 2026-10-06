import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CollectionView from "@/components/collection/CollectionView";
import { getSub, roomHref, subHref } from "@/lib/catalog";

export async function generateMetadata({ params }: PageProps<"/shop/[room]/[sub]">): Promise<Metadata> {
  const { room, sub } = await params;
  const data = await getSub(room, sub);
  return { title: data ? `${data.sub.title} – ${data.room.title}` : undefined };
}

export default async function SubCategoryPage({ params }: PageProps<"/shop/[room]/[sub]">) {
  const { room: roomSlug, sub: subSlug } = await params;
  const data = await getSub(roomSlug, subSlug);
  if (!data) notFound();

  return (
    <CollectionView
      title={`${data.sub.title} – ${data.room.title}`}
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Furniture", href: "/shop" },
        { label: data.room.title, href: roomHref(data.room.slug) },
        { label: data.sub.title },
      ]}
      chips={[
        { label: "All", href: roomHref(data.room.slug), active: false },
        ...data.children.map((child) => ({
          label: child.title,
          href: subHref(data.room.slug, child.slug),
          active: child.slug === data.sub.slug,
        })),
      ]}
      products={data.products}
    />
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CollectionView from "@/components/collection/CollectionView";
import { getRoom, roomHref, subHref } from "@/lib/catalog";

export async function generateMetadata({ params }: PageProps<"/shop/[room]">): Promise<Metadata> {
  const { room } = await params;
  return { title: (await getRoom(room))?.title };
}

export default async function RoomPage({ params }: PageProps<"/shop/[room]">) {
  const { room: slug } = await params;
  const room = await getRoom(slug);
  if (!room) notFound();

  return (
    <CollectionView
      title={room.title}
      crumbs={[{ label: "Home", href: "/" }, { label: "Furniture", href: "/shop" }, { label: room.title }]}
      chips={[
        { label: "All", href: roomHref(room.slug), active: true },
        ...room.children.map((child) => ({
          label: child.title,
          href: subHref(room.slug, child.slug),
          active: false,
        })),
      ]}
      products={room.products}
    />
  );
}

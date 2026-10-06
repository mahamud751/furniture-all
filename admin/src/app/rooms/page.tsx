"use client";

import Link from "next/link";
import Shell from "@/components/Shell";
import { media } from "@/lib/api";
import { btn, useResource } from "@/lib/ui";

type Room = {
  id: string;
  slug: string;
  title: string;
  image: string;
  showOnHome: boolean;
  sortOrder: number;
  navOrder: number;
  productCount: number;
  children: { id: string; title: string; productCount: number }[];
};

export default function RoomsPage() {
  const { data, error, loading } = useResource<Room[]>("/admin/rooms");
  return (
    <Shell
      title="Rooms"
      action={
        <Link href="/rooms/new" className={btn}>
          New room
        </Link>
      }
    >
      {loading && <p className="text-sm text-muted">Loading rooms...</p>}
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="grid gap-4">
        {(data ?? []).map((room) => (
          <Link key={room.id} href={`/rooms/${room.id}`} className="flex gap-4 rounded-xl bg-white p-4 ring-1 ring-black/5">
            <span className="h-20 w-28 overflow-hidden rounded-lg bg-[#ececee]">
              {room.image && <img src={media(room.image)} alt="" className="h-full w-full object-cover" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-medium">{room.title}</span>
              <span className="mt-1 block text-sm text-muted">
                /shop/{room.slug} · {room.productCount} products · menu {room.navOrder} · catalogue {room.sortOrder}
                {room.showOnHome ? " · on homepage" : ""}
              </span>
              <span className="mt-2 block text-sm text-muted">{room.children.map((child) => `${child.title} (${child.productCount})`).join(" · ")}</span>
            </span>
          </Link>
        ))}
      </div>
    </Shell>
  );
}

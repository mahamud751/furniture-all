"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { fieldClass } from "@/components/fields";

export type Store = {
  slug: string;
  title: string;
  type: string;
  region: string;
  address: string;
  contact: string;
  hours: string[];
  mapUrl: string;
  lat: number | null;
  lng: number | null;
  image: string;
};

function regionLabel(region: string) {
  if (region === "Other") return "Other";
  return region.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function telHref(contact: string) {
  const digits = contact.replace(/\D/g, "");
  return digits ? `tel:+${digits}` : undefined;
}

export default function StoreList({ stores }: { stores: Store[] }) {
  const [region, setRegion] = useState("all");
  const [query, setQuery] = useState("");

  const regions = useMemo(() => {
    return [...new Set(stores.map((store) => store.region))].sort((a, b) => {
      if (a === "DHAKA") return -1;
      if (b === "DHAKA") return 1;
      return a.localeCompare(b);
    });
  }, [stores]);

  const shown = stores.filter((store) => {
    if (region !== "all" && store.region !== region) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return `${store.title} ${store.address} ${store.region} ${store.type}`.toLowerCase().includes(q);
  });

  return (
    <>
      <h1 className="text-2xl leading-[120%] font-medium lg:text-5xl">Store Locations</h1>
      <p className="mt-3 text-(--secondary)">{stores.length} stores across Bangladesh</p>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          <button
            onClick={() => setRegion("all")}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ${
              region === "all" ? "bg-(--primary) text-white" : "bg-white text-(--primary)"
            }`}
          >
            All stores
          </button>
          {regions.map((item) => (
            <button
              key={item}
              onClick={() => setRegion(item)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap ${
                region === item ? "bg-(--primary) text-white" : "bg-white text-(--primary)"
              }`}
            >
              {regionLabel(item)}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find a store"
          aria-label="Find a store"
          className={`${fieldClass} lg:max-w-80`}
        />
      </div>

      {shown.length === 0 ? (
        <p className="py-24 text-center text-(--secondary)">No store data available</p>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((store) => {
            const phone = telHref(store.contact);
            return (
              <li key={store.slug} className="overflow-hidden rounded-xl bg-white">
                <Image
                  src={store.image}
                  alt={store.title}
                  width={640}
                  height={400}
                  className="aspect-video w-full object-cover"
                />
                <div className="p-5">
                  <p className="text-xs font-semibold tracking-[0.18em] text-(--secondary) uppercase">
                    {store.type} · {regionLabel(store.region)}
                  </p>
                  <h2 className="mt-2 text-lg font-medium leading-snug">{store.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-(--secondary)">{store.address}</p>
                  <ul className="mt-3 space-y-1 text-sm text-(--secondary)">
                    {store.hours.map((hour) => (
                      <li key={hour}>{hour}</li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium">
                    {phone && (
                      <a href={phone} className="underline">
                        {store.contact}
                      </a>
                    )}
                    <a href={store.mapUrl} target="_blank" rel="noreferrer" className="underline">
                      Get Directions
                    </a>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

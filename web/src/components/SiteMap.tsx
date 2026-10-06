"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useSite } from "@/lib/site";
import { roomHref, subHref } from "@/lib/shared";
import { CaretDown } from "./icons";

type SitemapLink = { label: string; href: string; heading: boolean };

export default function SiteMap() {
  const { rooms } = useSite();
  const [open, setOpen] = useState(false);
  const links: SitemapLink[] = rooms.flatMap((room) => [
    { label: room.title, href: roomHref(room.slug), heading: true },
    ...room.children.map((c) => ({ label: c.title, href: subHref(room.slug, c.slug), heading: false })),
  ]);
  const columns = Array.from({ length: Math.ceil(links.length / 6) }, (_, i) => links.slice(i * 6, i * 6 + 6));

  return (
    <div className="bg-linear-to-b from-[#3c3c3c] to-[#040404] pb-24 lg:pb-0">
      <div className="site-container">
        <div className="pt-16 pb-20 lg:py-24">
          <div className="py-4 lg:py-6 xl:py-10">
            <h4 className="flex items-center justify-between text-2xl leading-[120%] font-medium text-white lg:text-[40px]">
              <Link href="/shop">Furniture</Link>
              <button
                aria-label="Toggle furniture links"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className="lg:hidden"
              >
                <CaretDown className={`size-7 text-white transition-transform ${open ? "rotate-180" : ""}`} />
              </button>
            </h4>
            <div
              className={`overflow-hidden transition-all duration-700 lg:max-h-none lg:overflow-visible ${
                open ? "max-h-[1600px]" : "max-h-0"
              }`}
            >
              <div className="mt-5 justify-between gap-4 rounded-3xl bg-white/5 p-6 backdrop-blur-md max-sm:space-y-4 sm:flex sm:flex-wrap md:p-8.5 lg:mt-6 lg:flex-nowrap">
                {columns.map((column, i) => (
                  <div key={i} className="space-y-4">
                    {column.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`relative block w-fit text-base after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full ${
                          link.heading ? "font-semibold text-white" : "text-white/80"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center pb-20 lg:pb-31">
          <Image src="/images/logo-white.svg" alt="ILLIYEEN" width={285} height={196} className="h-auto w-50 lg:w-[285px]" />
        </div>
      </div>
    </div>
  );
}

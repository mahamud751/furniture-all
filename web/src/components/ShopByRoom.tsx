"use client";

import Link from "next/link";
import { useState } from "react";
import type { HomeRoom } from "@/data/furniture";
import { ChevronLeft, ChevronRight } from "./icons";

const navBtn =
  "flex size-10 items-center justify-center rounded-full border border-white bg-black/14 text-white backdrop-blur-xs transition-all duration-200 xl:size-12";

export default function ShopByRoom({ rooms }: { rooms: HomeRoom[] }) {
  // The first two items fill the frame (the 2nd shows its content);
  // the rest sit as cards on the right. "Next" rotates the list.
  const [order, setOrder] = useState(rooms);

  const next = () => setOrder(([first, ...rest]) => [...rest, first]);
  const prev = () => setOrder((list) => [list[list.length - 1], ...list.slice(0, -1)]);

  return (
    <section id="shop-by-room" className="scroll-mt-4 py-[50px]">
      <div className="site-container">
        <h2 className="mb-8 text-2xl leading-[120%] font-medium text-(--primary) capitalize lg:mb-10 lg:text-5xl">
          Shop by Room
        </h2>
        <div className="relative min-h-189 overflow-hidden rounded-xl">
          <div className="room-slide absolute inset-0">
            {order.map((room) => (
              <div
                key={room.slug}
                style={{ backgroundImage: `url(${room.image})` }}
                className="room-item absolute top-[55%] inline-block h-61 w-40 overflow-hidden rounded-xl bg-cover bg-center bg-no-repeat shadow-[0px_4px_75px_0px_rgba(0,0,0,1)] transition-all duration-900 ease-in-out sm:top-1/2 sm:h-71 sm:w-50"
              >
                <div className="room-title absolute right-0 bottom-0 left-0 bg-linear-to-t from-black/55 to-black/0 px-4 pt-4 pb-6 text-center">
                  <h3 className="text-2xl font-medium text-white">{room.name}</h3>
                </div>
                <div className="room-content relative z-1 hidden max-w-150 p-6 text-left text-white sm:pt-8 sm:pl-8 lg:pt-14 lg:pl-14 2xl:pt-32 2xl:pl-36">
                  <h2 className="room-name pt-4 text-2xl font-medium md:text-4xl lg:text-5xl xl:text-[56px]">
                    {room.name}
                  </h2>
                  <h3 className="room-des mt-2.5 mb-10 text-base">{room.description}</h3>
                  <Link
                    href={room.href}
                    aria-label="Shop Now"
                    className="flex w-max items-center justify-center gap-2 rounded-[5px] border border-white bg-white/24 px-4 py-[15px] text-base font-medium text-white backdrop-blur-lg transition-all duration-300 ease-in-out sm:w-71"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute bottom-4 left-8 z-10 flex items-center gap-8 sm:bottom-6 sm:left-1/2">
            <button aria-label="Previous room" onClick={prev} className={navBtn}>
              <ChevronLeft className="size-5 xl:size-6" />
            </button>
            <button aria-label="Next room" onClick={next} className={navBtn}>
              <ChevronRight className="size-5 xl:size-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

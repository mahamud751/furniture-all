"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/effect-coverflow";
import type { CategoryTile } from "@/data/furniture";
import SectionHeader from "./SectionHeader";
import { ChevronLeft, ChevronRight } from "./icons";
import { useMediaQuery } from "./useMediaQuery";

const overlayBtn =
  "absolute top-1/2 z-20 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-(--primary) bg-white/16 text-(--primary) backdrop-blur-xs lg:size-8 xl:size-12";

export default function CategorySlider({
  id,
  title,
  href,
  categories,
}: {
  id: string;
  title: string;
  href: string;
  categories: CategoryTile[];
}) {
  const isDesktop = useMediaQuery("(min-width: 960px)");
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const sync = (s: SwiperType) => setEdges({ start: s.isBeginning, end: s.isEnd });

  return (
    <section id={id} className="scroll-mt-4 py-8 lg:py-[50px]">
      <div className="site-container">
        <SectionHeader title={title} href={href} />
        <div className="relative -mx-4 lg:mx-0">
          <Swiper
            key={isDesktop ? "desktop" : "mobile"}
            modules={[EffectCoverflow]}
            effect="coverflow"
            slidesPerView="auto"
            spaceBetween={isDesktop ? 24 : 16}
            centeredSlides={!isDesktop}
            loop={!isDesktop}
            coverflowEffect={
              isDesktop
                ? { rotate: 0, stretch: 0, depth: 0, modifier: 1, slideShadows: false }
                : { rotate: 0, stretch: 0, depth: 200, modifier: 1, slideShadows: false }
            }
            onSwiper={(s) => {
              setSwiper(s);
              sync(s);
            }}
            onSlideChange={sync}
            onReachEnd={sync}
            onReachBeginning={sync}
          >
            {categories.map((cat) => (
              <SwiperSlide key={cat.href} className="w-[255px]! overflow-hidden rounded lg:w-[290px]!">
                <Link href={cat.href} className="relative block overflow-hidden rounded">
                  <figure className="h-full max-h-120">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      width={600}
                      height={750}
                      sizes="290px"
                      className="aspect-4/5 w-full object-cover"
                    />
                  </figure>
                  <figcaption className="absolute bottom-0 flex h-[40%] w-full flex-col justify-end space-y-2 bg-linear-to-b from-black/0 from-0% to-black/55 to-65% p-6 lg:p-7 2xl:px-12 2xl:py-8">
                    <h2 className="text-[28px] font-medium text-white lg:text-3xl 2xl:text-[32px]">
                      {cat.name}
                    </h2>
                  </figcaption>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          {!edges.start && (
            <div className="absolute top-0 left-0 z-10 hidden h-full max-h-120 w-20 rounded [background:linear-gradient(-270deg,#F5F5F5_0%,rgba(245,245,245,0)_100%)] lg:block">
              <button
                aria-label="Previous slide"
                onClick={() => swiper?.slidePrev()}
                className={`${overlayBtn} -left-3 xl:-left-6`}
              >
                <ChevronLeft className="size-4 lg:size-6" />
              </button>
            </div>
          )}
          {!edges.end && (
            <div className="absolute top-0 right-0 z-10 hidden h-full max-h-120 w-20 rounded [background:linear-gradient(270deg,#F5F5F5_0%,rgba(245,245,245,0)_100%)] lg:block">
              <button
                aria-label="Next slide"
                onClick={() => swiper?.slideNext()}
                className={`${overlayBtn} -right-3 xl:-right-6`}
              >
                <ChevronRight className="size-4 lg:size-6" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import type { ProductCardData } from "@/lib/shared";
import ProductCard from "./ProductCard";
import SectionHeader from "./SectionHeader";
import { ChevronLeft, ChevronRight } from "./icons";

const neoBtn =
  "neo-btn group flex size-10 cursor-pointer items-center justify-center rounded-lg backdrop-blur-xs disabled:cursor-not-allowed xl:size-12";

export default function ProductSlider({
  id,
  title,
  href,
  products,
}: {
  id: string;
  title: string;
  /** Omit to hide the "Explore All" link. */
  href?: string;
  products: ProductCardData[];
}) {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const sync = (s: SwiperType) => setEdges({ start: s.isBeginning, end: s.isEnd });

  return (
    <section id={id} className="scroll-mt-4 py-8 lg:py-[50px]">
      <div className="site-container">
        <SectionHeader title={title} href={href}>
          <div className="flex items-center gap-3">
            <button
              aria-label="Previous slide"
              disabled={edges.start}
              onClick={() => swiper?.slidePrev()}
              className={neoBtn}
            >
              <ChevronLeft className="size-4 text-(--primary) group-disabled:text-(--secondary) lg:size-6" />
            </button>
            <button
              aria-label="Next slide"
              disabled={edges.end}
              onClick={() => swiper?.slideNext()}
              className={neoBtn}
            >
              <ChevronRight className="size-4 text-(--primary) group-disabled:text-(--secondary) lg:size-6" />
            </button>
          </div>
        </SectionHeader>
        <Swiper
          slidesPerView={1.5}
          spaceBetween={16}
          breakpoints={{
            640: { slidesPerView: 2.5, spaceBetween: 16 },
            960: { slidesPerView: 3.5, spaceBetween: 24 },
            1200: { slidesPerView: 4.5, spaceBetween: 24 },
          }}
          onSwiper={(s) => {
            setSwiper(s);
            sync(s);
          }}
          onSlideChange={sync}
          onReachEnd={sync}
          onReachBeginning={sync}
        >
          {products.map((product) => (
            <SwiperSlide key={product.code} className="overflow-hidden rounded">
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

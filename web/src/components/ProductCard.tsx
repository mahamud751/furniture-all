"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import { formatPrice, productHref, type ProductCardData } from "@/lib/shared";
import { useCart } from "./cart/CartProvider";
import { AddToBagIcon, CaretDown, ChevronLeft, ChevronRight } from "./icons";

const imgBtn =
  "visible absolute top-1/2 z-20 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white bg-black/14 text-white opacity-100 backdrop-blur-xs transition-all duration-200 group-hover:visible group-hover:opacity-100 xl:invisible xl:size-12 xl:opacity-0";

export default function ProductCard({
  product,
  priority = false,
}: {
  product: ProductCardData;
  priority?: boolean;
}) {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const { add } = useCart();
  const href = productHref(product);
  const multiple = product.images.length > 1;

  return (
    <div className="group">
      <figure className="relative overflow-hidden rounded-md">
        <Swiper nested loop={multiple} onSwiper={setSwiper}>
          {product.images.map((src, i) => (
            <SwiperSlide key={src}>
              <Link href={href}>
                <Image
                  src={src}
                  alt={product.title}
                  width={1024}
                  height={1280}
                  sizes="(min-width: 1200px) 300px, (min-width: 960px) 25vw, 65vw"
                  priority={priority && i === 0}
                  className="aspect-4/5 w-full object-cover"
                />
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
        {multiple && (
          <>
            <button aria-label="Previous image" onClick={() => swiper?.slidePrev()} className={`${imgBtn} left-3`}>
              <ChevronLeft className="size-4 lg:size-6" />
            </button>
            <button aria-label="Next image" onClick={() => swiper?.slideNext()} className={`${imgBtn} right-3`}>
              <ChevronRight className="size-4 lg:size-6" />
            </button>
          </>
        )}
        <div className="absolute bottom-4 left-1/2 z-10 flex w-[calc(100%-16px)] -translate-x-1/2 items-stretch justify-start gap-2 lg:gap-4">
          <button
            aria-label="Add to bag"
            onClick={() => add(product)}
            className="flex size-12.5 items-center justify-center rounded bg-white/70 shadow-[0_1px_1px_0_rgba(0,0,0,0.25)] backdrop-blur-sm transition-colors hover:bg-white"
          >
            <AddToBagIcon />
          </button>
        </div>
      </figure>
      <figcaption className="relative mt-4">
        <div className="relative flex items-start justify-between gap-2">
          <h5 className="line-clamp-2 text-base font-medium text-(--primary) lg:text-lg">
            <Link href={href}>{product.title}</Link>
          </h5>
          <small className="block text-sm font-medium text-(--secondary) lg:text-base">{product.code}</small>
        </div>
        <p className="w-full overflow-hidden pt-1 pr-2 pb-2 text-base font-medium text-(--secondary)">
          <span className="inline-block">
            {product.colors} {product.colors === 1 ? "Color" : "Colors"}
            <CaretDown className="inline-block size-5 rotate-180 text-(--secondary)" />
          </span>
        </p>
        <Link href={href} className="inline-block text-base lg:text-lg">
          {product.finalPrice < product.price && (
            <span className="mr-2 text-(--secondary) line-through">{formatPrice(product.price)}</span>
          )}
          <span className="inline-block font-semibold text-(--primary)">{formatPrice(product.finalPrice)}</span>
        </Link>
      </figcaption>
    </div>
  );
}

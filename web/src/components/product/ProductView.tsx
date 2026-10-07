"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import DeliveryNote from "@/components/DeliveryNote";
import RichText from "@/components/RichText";
import { CaretDown, ChevronLeft, ChevronRight } from "@/components/icons";
import { formatPrice } from "@/lib/shared";

export type ProductViewData = {
  code: string;
  slug: string;
  title: string;
  brand: string | null;
  price: number;
  finalPrice: number;
  colors: number;
  inStock: boolean;
  description: string;
  details: string;
  specifications: { title: string; html: string }[];
  images: string[];
};

const arrow =
  "absolute top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white bg-black/14 text-white backdrop-blur-xs xl:size-12";

export default function ProductView({ product }: { product: ProductViewData }) {
  const { add } = useCart();
  const [index, setIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [open, setOpen] = useState<Record<string, boolean>>({ Details: true });
  const images = product.images;
  const multiple = images.length > 1;
  const sections = [
    { title: "Details", html: product.details },
    ...product.specifications,
  ].filter((section) => section.html.trim());

  const show = (next: number) => {
    if (!images.length) return;
    setIndex((next + images.length) % images.length);
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-5 lg:col-start-2">
        <div className="lg:sticky lg:top-28">
          <figure className="relative overflow-hidden rounded-md bg-(--tertiary)">
            {images.length > 0 ? (
              <Image
                src={images[index]}
                alt={product.title}
                width={1024}
                height={1280}
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="aspect-4/5 w-full object-cover"
              />
            ) : (
              <div className="aspect-4/5 w-full" />
            )}
            {multiple && (
              <>
                <button aria-label="Previous image" onClick={() => show(index - 1)} className={`${arrow} left-3`}>
                  <ChevronLeft className="size-5" />
                </button>
                <button aria-label="Next image" onClick={() => show(index + 1)} className={`${arrow} right-3`}>
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}
          </figure>
          {multiple && (
            <div className="mt-4 flex justify-center gap-2">
              {images.map((src, i) => (
                <button
                  key={src}
                  aria-label={`Image ${i + 1}`}
                  aria-current={i === index}
                  onClick={() => setIndex(i)}
                  className={`h-14 w-12 overflow-hidden rounded ${i === index ? "ring-2 ring-(--primary)" : "opacity-70"}`}
                >
                  <Image src={src} alt="" width={96} height={120} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="col-span-12 lg:col-span-5 xl:px-16">
        {product.brand && (
          <p className="text-xs font-semibold tracking-[0.28em] text-(--secondary) uppercase">{product.brand}</p>
        )}
        <h1 className="mt-2 text-2xl leading-[120%] font-medium text-(--brand) lg:text-4xl">{product.title}</h1>
        <p className="mt-3 text-sm text-(--secondary)">Product Code: {product.code}</p>
        <p className="mt-4 text-xl font-semibold text-(--primary) lg:text-2xl">
          {product.finalPrice < product.price && (
            <span className="mr-2 text-base font-medium text-(--secondary) line-through lg:text-lg">
              {formatPrice(product.price)}
            </span>
          )}
          {formatPrice(product.finalPrice)}
        </p>
        <p className="mt-3 text-sm font-medium text-(--primary)">{product.inStock ? "In Stock" : "Out Of Stock"}</p>
        <p className="mt-4 text-sm font-medium text-(--secondary)">
          {product.colors} {product.colors === 1 ? "Color" : "Colors"}
        </p>

        <div className="mt-6">
          <p className="mb-2 text-sm font-medium">Quantity</p>
          <div className="flex h-12 w-36 items-center justify-between rounded-[5px] border border-(--primary)/16 bg-white px-3">
            <button
              aria-label="Decrease quantity"
              onClick={() => setQuantity((n) => Math.max(1, n - 1))}
              className="px-2 text-lg"
            >
              −
            </button>
            <span className="text-sm font-medium">{quantity}</span>
            <button
              aria-label="Increase quantity"
              onClick={() => setQuantity((n) => Math.min(10, n + 1))}
              className="px-2 text-lg"
            >
              +
            </button>
          </div>
        </div>

        <button
          disabled={!product.inStock}
          onClick={() =>
            add(
              {
                code: product.code,
                slug: product.slug,
                title: product.title,
                price: product.price,
                finalPrice: product.finalPrice,
                colors: product.colors,
                images: product.images,
              },
              quantity,
            )
          }
          className="mt-6 flex h-12 w-full items-center justify-center rounded-[5px] bg-(--primary) text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {product.inStock ? "Add to bag" : "Out Of Stock"}
        </button>
        <Link
          href="/store-locations"
          className="mt-3 flex h-12 w-full items-center justify-center rounded-[5px] border border-(--primary) text-sm font-medium text-(--primary)"
        >
          Find in store
        </Link>

        <DeliveryNote className="mt-5" />
        <Link href="/shipping-policy" className="mt-2 inline-block text-sm font-medium underline">
          Shipping details
        </Link>

        {product.description.trim() && (
          <div className="mt-8">
            <RichText html={product.description} />
          </div>
        )}

        <div className="mt-6 border-t border-(--quaternary)">
          {sections.map((section) => {
            const isOpen = Boolean(open[section.title]);
            return (
              <div key={section.title} className="border-b border-(--quaternary)">
                <button
                  aria-expanded={isOpen}
                  onClick={() => setOpen((state) => ({ ...state, [section.title]: !state[section.title] }))}
                  className="flex w-full items-center justify-between py-4 text-left text-base font-medium"
                >
                  {section.title}
                  <CaretDown className={`size-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="pb-4">
                    <RichText html={section.html} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

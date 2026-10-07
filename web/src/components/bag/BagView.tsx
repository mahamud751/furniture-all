"use client";

import Image from "next/image";
import Link from "next/link";
import DeliveryNote from "@/components/DeliveryNote";
import { useCart } from "@/components/cart/CartProvider";
import { useSite } from "@/lib/site";
import { formatPrice, productHref } from "@/lib/shared";

export default function BagView() {
  const { promoBanner } = useSite();
  const { items, count, subtotal, ready, setQuantity, remove } = useCart();

  if (!ready) {
    return <p className="py-24 text-center text-sm text-(--secondary)">Loading...</p>;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl bg-white px-6 py-20 text-center">
        <h1 className="text-2xl font-medium text-(--brand) lg:text-4xl">Shopping Bag</h1>
        <p className="mt-4 text-(--secondary)">Your bag is empty. Please go back to the shop.</p>
        <Link
          href="/shop"
          className="mt-8 inline-flex h-12 items-center rounded-[5px] bg-(--primary) px-8 text-sm font-medium text-white"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl leading-[120%] font-medium text-(--brand) lg:text-5xl">Shopping Bag</h1>
      <p className="mt-3 text-sm text-(--secondary)">
        {count} {count === 1 ? "Item" : "Items"} In Bag
      </p>
      <div className="mt-6 rounded-lg bg-black px-4 py-3 text-center text-sm font-medium text-white lg:text-base">
        {promoBanner}
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.code} className="flex gap-4 rounded-xl bg-white p-4">
              <Link href={productHref(item)} className="block h-28 w-22 shrink-0 overflow-hidden rounded-md bg-(--tertiary)">
                <Image src={item.image} alt={item.title} width={160} height={200} className="h-full w-full object-cover" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <Link href={productHref(item)} className="line-clamp-2 text-base font-medium">
                    {item.title}
                  </Link>
                  <p className="shrink-0 text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                </div>
                <p className="mt-1 text-sm text-(--secondary)">{item.code}</p>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <div className="flex h-10 items-center rounded-[5px] border border-(--primary)/16">
                    <button
                      aria-label={`Decrease quantity of ${item.title}`}
                      onClick={() => setQuantity(item.code, item.quantity - 1)}
                      className="px-3 text-lg"
                    >
                      −
                    </button>
                    <span className="min-w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      aria-label={`Increase quantity of ${item.title}`}
                      onClick={() => setQuantity(item.code, item.quantity + 1)}
                      className="px-3 text-lg"
                    >
                      +
                    </button>
                  </div>
                  <button onClick={() => remove(item.code)} className="text-sm font-medium underline">
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="rounded-xl bg-white p-6 lg:sticky lg:top-6">
          <h2 className="text-lg font-medium">Order Summary</h2>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-(--secondary)">Subtotal</span>
            <span className="font-semibold">{formatPrice(subtotal)}</span>
          </div>
          <DeliveryNote className="mt-4" />
          <Link
            href="/checkout"
            className="mt-6 flex h-12 items-center justify-center rounded-[5px] bg-(--primary) text-sm font-medium text-white"
          >
            Proceed to checkout
          </Link>
        </aside>
      </div>
    </>
  );
}

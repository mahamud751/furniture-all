"use client";

import { useSite } from "@/lib/site";
import { formatPrice } from "@/lib/shared";

export default function DeliveryNote({ className = "" }: { className?: string }) {
  const { delivery } = useSite();
  return (
    <p className={`text-sm leading-6 text-(--secondary) ${className}`}>
      {delivery.advancePercent}% advance confirms the order. Delivery in 21–28 working days. Inside Dhaka{" "}
      {formatPrice(delivery.insideDhaka)} · Outside Dhaka {formatPrice(delivery.outsideDhaka)}.
    </p>
  );
}

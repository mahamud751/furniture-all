"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSite } from "@/lib/site";
import type { ProductCardData } from "@/lib/shared";
import ProductCard from "../ProductCard";
import Breadcrumbs, { type Crumb } from "../Breadcrumbs";
import { CaretDown } from "../icons";

const PAGE_SIZE = 40;

const PRICE_RANGES = [
  { id: "all", label: "All Prices", min: 0, max: Infinity },
  { id: "u20", label: "Under BDT 20,000", min: 0, max: 20000 },
  { id: "20-50", label: "BDT 20,000 – 50,000", min: 20000, max: 50000 },
  { id: "50-100", label: "BDT 50,000 – 100,000", min: 50000, max: 100000 },
  { id: "o100", label: "Over BDT 100,000", min: 100000, max: Infinity },
];

const SORTS = [
  { id: "default", label: "Default" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "name", label: "Name: A to Z" },
];

export type Chip = { label: string; href: string; active: boolean };

function Dropdown({
  label,
  value,
  options,
  onChange,
  className = "",
}: {
  label: React.ReactNode;
  value: string;
  options: { id: string; label: string }[];
  onChange: (id: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex h-9.5 w-full items-center justify-between gap-3 rounded-[5px] border border-(--primary)/16 bg-white/40 px-4 text-sm font-medium text-(--primary) lg:h-9.5 lg:text-base"
      >
        {label}
        <CaretDown className={`size-5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <ul
        className={`absolute top-[calc(100%+8px)] right-0 z-30 min-w-56 space-y-1 rounded-lg bg-white p-2 shadow-[0_0_2px_0_rgba(145,158,171,0.24),-20px_20px_40px_-4px_rgba(145,158,171,0.24)] transition-all duration-200 ${
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"
        }`}
      >
        {options.map((o) => (
          <li key={o.id}>
            <button
              onClick={() => {
                onChange(o.id);
                setOpen(false);
              }}
              className={`w-full rounded-md px-4 py-2 text-left text-sm font-medium transition-colors hover:bg-[rgba(145,158,171,0.08)] ${
                value === o.id ? "bg-[rgba(145,158,171,0.08)] text-(--primary)" : "text-(--secondary)"
              }`}
            >
              {o.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CollectionView({
  title,
  crumbs,
  chips,
  products,
  showTitle = false,
  emptyLabel = "No products match this filter.",
}: {
  title: string;
  crumbs: Crumb[];
  chips: Chip[];
  products: ProductCardData[];
  showTitle?: boolean;
  emptyLabel?: string;
}) {
  const { promoBanner } = useSite();
  const [price, setPrice] = useState("all");
  const [sort, setSort] = useState("default");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const range = PRICE_RANGES.find((r) => r.id === price)!;
    const list = products.filter((p) => p.finalPrice >= range.min && p.finalPrice < range.max);
    if (sort === "price-asc") list.sort((a, b) => a.finalPrice - b.finalPrice);
    if (sort === "price-desc") list.sort((a, b) => b.finalPrice - a.finalPrice);
    if (sort === "name") list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [products, price, sort]);

  const shown = filtered.slice(0, visible);
  const sortLabel = SORTS.find((s) => s.id === sort)!.label;

  return (
    <>
      {chips.length > 0 && (
        <div className="border-b border-(--quaternary) bg-white">
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto px-4 py-2.5 lg:justify-center lg:gap-6">
            {chips.map((chip) => (
              <Link
                key={chip.href}
                href={chip.href}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                  chip.active ? "bg-(--primary) text-white" : "text-(--primary) hover:bg-(--tertiary)"
                }`}
              >
                {chip.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <section className="pt-6 pb-16 lg:pb-24">
        <div className="site-container">
          {showTitle ? (
            <h1 className="mb-6 text-2xl leading-[120%] font-medium text-(--primary) lg:text-4xl">{title}</h1>
          ) : (
            <h1 className="sr-only">{title}</h1>
          )}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <Breadcrumbs crumbs={crumbs} />
            <div className="flex w-full items-center gap-4 sm:w-auto lg:gap-12">
              <Dropdown
                className="flex-1 sm:w-29 sm:flex-none"
                label="Price"
                value={price}
                options={PRICE_RANGES}
                onChange={(id) => {
                  setPrice(id);
                  setVisible(PAGE_SIZE);
                }}
              />
              <Dropdown
                className="flex-1 sm:w-42 sm:flex-none"
                label={
                  <span className="truncate">
                    <span className="text-(--secondary)">Sort: </span>
                    {sort === "default" ? "Default" : sortLabel}
                  </span>
                }
                value={sort}
                options={SORTS}
                onChange={setSort}
              />
            </div>
          </div>

          <div className="mb-6 rounded-lg bg-black px-4 py-3 text-center text-sm font-medium text-white lg:text-base">
            {promoBanner}
          </div>

          {shown.length === 0 ? (
            <p className="py-24 text-center text-(--secondary)">{emptyLabel}</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12">
              {shown.map((p, i) => (
                <ProductCard key={p.code} product={p} priority={i < 4} />
              ))}
            </div>
          )}

          {filtered.length > 0 && (
            <div className="mt-14 flex flex-col items-center gap-4">
              <p className="text-sm text-(--secondary)">
                1 - {shown.length} of {filtered.length} Items
              </p>
              {visible < filtered.length && (
                <button
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="h-12 w-60 rounded-[5px] bg-(--primary) text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Load More
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

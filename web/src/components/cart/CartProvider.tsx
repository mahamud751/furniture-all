"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ProductCardData } from "@/lib/shared";

export type CartItem = {
  code: string;
  slug: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  ready: boolean;
  add: (product: ProductCardData, quantity?: number) => void;
  setQuantity: (code: string, quantity: number) => void;
  remove: (code: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "furniture-bag";
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from storage once on mount
      if (saved) setItems(JSON.parse(saved));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  const add = useCallback((product: ProductCardData, quantity = 1) => {
    setItems((list) => {
      const existing = list.find((i) => i.code === product.code);
      if (existing) {
        return list.map((i) => (i.code === product.code ? { ...i, quantity: i.quantity + quantity } : i));
      }
      return [
        ...list,
        {
          code: product.code,
          slug: product.slug,
          title: product.title,
          price: product.finalPrice,
          image: product.images[0],
          quantity,
        },
      ];
    });
    setToast(product.title);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const setQuantity = useCallback((code: string, quantity: number) => {
    setItems((list) =>
      quantity <= 0 ? list.filter((i) => i.code !== code) : list.map((i) => (i.code === code ? { ...i, quantity } : i)),
    );
  }, []);

  const remove = useCallback((code: string) => setItems((list) => list.filter((i) => i.code !== code)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      ready,
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotal: items.reduce((n, i) => n + i.quantity * i.price, 0),
      add,
      setQuantity,
      remove,
      clear,
    }),
    [items, ready, add, setQuantity, remove, clear],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <div
        role="status"
        className={`fixed right-4 bottom-28 z-60 w-[calc(100%-32px)] max-w-sm rounded-lg bg-(--primary) p-4 text-white shadow-xl transition-all duration-300 lg:bottom-8 ${
          toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <p className="text-sm font-medium">Item Added to Bag</p>
        <p className="mt-1 line-clamp-1 text-sm text-white/70">{toast}</p>
        <Link href="/bag" className="mt-3 inline-block text-sm font-medium underline">
          View Bag
        </Link>
      </div>
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

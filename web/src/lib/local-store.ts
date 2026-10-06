import type { PayMethod, ShipLocation } from "./pricing";

export type Profile = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address?: string;
  city?: string;
};

export type OrderItem = {
  code: string;
  slug: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
};

export type Order = {
  id: string;
  createdAt: string;
  phone: string;
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
  };
  location: ShipLocation;
  payment: PayMethod;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  advance: number;
  balance: number;
};

const PROFILES = "furniture-profiles";
const SESSION = "furniture-session";
const ORDERS = "furniture-orders";

export function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getSessionProfile(): Profile | null {
  const phone = read<string | null>(SESSION, null);
  if (!phone) return null;
  return read<Profile[]>(PROFILES, []).find((p) => p.phone === phone) ?? null;
}

export function signIn(profile: Profile) {
  const phone = normalizePhone(profile.phone);
  const next = { ...profile, phone };
  const all = read<Profile[]>(PROFILES, []).filter((p) => p.phone !== phone);
  all.push(next);
  write(PROFILES, all);
  write(SESSION, phone);
}

export function signOut() {
  localStorage.removeItem(SESSION);
}

export function addOrder(order: Order) {
  const all = read<Order[]>(ORDERS, []);
  all.unshift(order);
  write(ORDERS, all);
}

export function ordersFor(phone: string) {
  const key = normalizePhone(phone);
  return read<Order[]>(ORDERS, []).filter((order) => order.phone === key);
}

export function orderById(id: string) {
  return read<Order[]>(ORDERS, []).find((order) => order.id === id) ?? null;
}

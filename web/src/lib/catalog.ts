import "server-only";
import { ApiError, api } from "./http";
import type { SiteData } from "./site-data";
import type { ProductCardData } from "./shared";

export type { ProductCardData } from "./shared";
export { digitalPaymentBanner, formatPrice, productHref, roomHref, subHref } from "./shared";

export type HomeRoom = {
  slug: string;
  name: string;
  description: string;
  image: string;
  href: string;
};

export type CategoryTile = { name: string; image: string; href: string };

export type HomeBlock =
  | { kind: "tiles"; slug: string; title: string; href: string; categories: CategoryTile[] }
  | { kind: "products"; slug: string; title: string; href: string; products: ProductCardData[] };

export type HomeData = {
  hero: { desktop: string; mobile: string; href: string };
  rooms: HomeRoom[];
  blocks: HomeBlock[];
};

export type RoomChip = { slug: string; title: string; children: { slug: string; title: string }[] };

export type ShopData = { rooms: RoomChip[]; products: ProductCardData[] };

export type RoomData = RoomChip & { products: ProductCardData[] };

export type SubData = {
  room: { slug: string; title: string };
  sub: { slug: string; title: string };
  children: { slug: string; title: string }[];
  products: ProductCardData[];
};

export type ProductDetail = {
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
  room: { slug: string; title: string } | null;
  related: ProductCardData[];
};

export type StoreRecord = {
  slug: string;
  title: string;
  type: string;
  region: string;
  address: string;
  contact: string;
  hours: string[];
  mapUrl: string;
  lat: number | null;
  lng: number | null;
  image: string;
};

async function missing<T>(path: string): Promise<T | null> {
  try {
    return await api<T>(path);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export function getSite() {
  return api<SiteData>("/site");
}

export function getHome() {
  return api<HomeData>("/home");
}

export function getShop() {
  return api<ShopData>("/catalog/shop");
}

export function getRoom(slug: string) {
  return missing<RoomData>(`/catalog/rooms/${encodeURIComponent(slug)}`);
}

export function getSub(room: string, sub: string) {
  return missing<SubData>(`/catalog/rooms/${encodeURIComponent(room)}/${encodeURIComponent(sub)}`);
}

export function getProduct(slug: string) {
  return missing<ProductDetail>(`/catalog/products/${encodeURIComponent(slug)}`);
}

export function searchProducts(query: string) {
  return api<ProductCardData[]>(`/catalog/search?q=${encodeURIComponent(query)}`);
}

export function getStores() {
  return api<StoreRecord[]>("/stores");
}

export function getContentPage(slug: string) {
  return missing<{ slug: string; title: string; html: string }>(`/pages/${encodeURIComponent(slug)}`);
}

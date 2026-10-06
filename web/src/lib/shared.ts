// Client-safe helpers and types (no product data imported here).

export type ProductCardData = {
  code: string;
  slug: string;
  title: string;
  price: number;
  finalPrice: number;
  colors: number;
  images: string[];
};

export const productHref = (p: { slug: string }) => `/product/${p.slug}`;
export const roomHref = (room: string) => `/shop/${room}`;
export const subHref = (room: string, sub: string) => `/shop/${room}/${sub}`;

export const formatPrice = (n: number) => `BDT ${n.toLocaleString("en-US")}`;

export const digitalPaymentBanner = "Save 5% On Entire Order With Digital Payment";

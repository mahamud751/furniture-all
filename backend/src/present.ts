import { Prisma } from "@prisma/client";

const images = { orderBy: { sortOrder: "asc" as const } };

export const cardInclude = { images } satisfies Prisma.ProductInclude;

export const detailInclude = {
  images,
  specifications: { orderBy: { sortOrder: "asc" as const } },
} satisfies Prisma.ProductInclude;

type CardProduct = Prisma.ProductGetPayload<{ include: typeof cardInclude }>;
type DetailProduct = Prisma.ProductGetPayload<{ include: typeof detailInclude }>;

export function presentCard(product: CardProduct) {
  return {
    code: product.code,
    slug: product.slug,
    title: product.title,
    price: product.price,
    finalPrice: product.finalPrice,
    colors: product.colors,
    images: product.images.map((image) => image.url),
  };
}

export function presentProduct(product: DetailProduct) {
  return {
    id: product.id,
    code: product.code,
    slug: product.slug,
    title: product.title,
    brand: product.brand,
    price: product.price,
    discount: product.discount,
    finalPrice: product.finalPrice,
    colors: product.colors,
    inStock: product.inStock,
    description: product.description,
    details: product.details,
    specifications: product.specifications.map((spec) => ({ title: spec.title, html: spec.html })),
    images: product.images.map((image) => image.url),
  };
}

export function presentCustomer(customer: {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
}) {
  return {
    id: customer.id,
    firstName: customer.firstName,
    lastName: customer.lastName,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    city: customer.city,
  };
}

export function presentOrder(order: {
  number: string;
  createdAt: Date;
  phone: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  location: string;
  payment: string;
  status: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  advance: number;
  balance: number;
  items: { code: string; slug: string; title: string; price: number; image: string; quantity: number }[];
}) {
  return {
    id: order.number,
    createdAt: order.createdAt.toISOString(),
    phone: order.phone,
    status: order.status,
    customer: {
      firstName: order.firstName,
      lastName: order.lastName,
      phone: order.phone,
      email: order.email,
      address: order.address,
      city: order.city,
    },
    location: order.location,
    payment: order.payment,
    items: order.items,
    subtotal: order.subtotal,
    discount: order.discount,
    shipping: order.shipping,
    total: order.total,
    advance: order.advance,
    balance: order.balance,
  };
}

export function quote(
  subtotal: number,
  location: "inside" | "outside",
  payment: "digital" | "cod",
  delivery: { insideDhaka: number; outsideDhaka: number; advancePercent: number; digitalPaymentDiscountPercent: number },
) {
  const shipping = location === "inside" ? delivery.insideDhaka : delivery.outsideDhaka;
  const discount = payment === "digital" ? Math.round((subtotal * delivery.digitalPaymentDiscountPercent) / 100) : 0;
  const total = subtotal - discount + shipping;
  const payInFull = location === "outside" || payment === "digital";
  const advance = payInFull ? total : Math.round((subtotal * delivery.advancePercent) / 100);
  return { shipping, discount, total, advance, balance: Math.max(0, total - advance) };
}

export function digits(value: string) {
  return value.replace(/\D/g, "");
}

export function orderNumber() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let value = "SP";
  for (let i = 0; i < 8; i += 1) value += alphabet[Math.floor(Math.random() * alphabet.length)];
  return value;
}

export type FooterColumn = { title: string; links: { label: string; href: string }[] };

export function asFooter(value: Prisma.JsonValue): FooterColumn[] {
  if (!Array.isArray(value)) return [];
  return value as FooterColumn[];
}

import type { PayMethod, ShipLocation } from "./pricing";

export type PublicOrder = {
  id: string;
  createdAt: string;
  phone: string;
  status: string;
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
  items: {
    code: string;
    slug: string;
    title: string;
    price: number;
    image: string;
    quantity: number;
  }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  advance: number;
  balance: number;
};

export const statusLabel: Record<string, string> = {
  received: "Received",
  confirmed: "Confirmed",
  processing: "Processing",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

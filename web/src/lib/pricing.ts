export type ShipLocation = "inside" | "outside";
export type PayMethod = "digital" | "cod";

export type DeliveryRates = {
  insideDhaka: number;
  outsideDhaka: number;
  advancePercent: number;
  digitalPaymentDiscountPercent: number;
};

export type Quote = {
  shipping: number;
  discount: number;
  total: number;
  advance: number;
  balance: number;
};

const fallback: DeliveryRates = {
  insideDhaka: 1500,
  outsideDhaka: 5000,
  advancePercent: 10,
  digitalPaymentDiscountPercent: 5,
};

/** Furniture totals: digital payment discount, advance inside Dhaka, full payment outside Dhaka. */
export function quote(
  subtotal: number,
  location: ShipLocation,
  payment: PayMethod,
  rates: DeliveryRates = fallback,
): Quote {
  const shipping = location === "inside" ? rates.insideDhaka : rates.outsideDhaka;
  const discount = payment === "digital" ? Math.round((subtotal * rates.digitalPaymentDiscountPercent) / 100) : 0;
  const total = subtotal - discount + shipping;
  const payInFull = location === "outside" || payment === "digital";
  const advance = payInFull ? total : Math.round((subtotal * rates.advancePercent) / 100);
  return { shipping, discount, total, advance, balance: Math.max(0, total - advance) };
}

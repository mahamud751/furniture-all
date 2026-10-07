import { roomHref, subHref } from "@/lib/shared";

export type HomeRoom = {
  slug: string;
  name: string;
  description: string;
  image: string;
  href: string;
};

export type CategoryTile = {
  name: string;
  image: string;
  href: string;
};

export const hero = {
  desktop: "/images/banners/hero-desktop.jpg",
  mobile: "/images/banners/hero-mobile.jpg",
  href: "/shop",
};

export const homeRooms: HomeRoom[] = [
  {
    slug: "bedroom",
    name: "Bedroom",
    description: "A complete selection designed for comfort, rest, and everyday living.",
    image: "/images/rooms/bedroom.webp",
    href: roomHref("bedroom"),
  },
  {
    slug: "living-room",
    name: "Living Room",
    description: "Designed for everyday gathering, conversation, and shared moments.",
    image: "/images/rooms/living-room.webp",
    href: roomHref("living-room"),
  },
  {
    slug: "dining-room",
    name: "Dining Room",
    description: "Structured furniture and considered forms for daily use.",
    image: "/images/rooms/dining-room.webp",
    href: roomHref("dining-room"),
  },
  {
    slug: "office-room",
    name: "Office Room",
    description: "Function and productivity come together in pieces that elevate workspaces.",
    image: "/images/rooms/office-room.webp",
    href: roomHref("office-room"),
  },
  {
    slug: "study-room",
    name: "Study Room",
    description: "Designed for focus, learning, and a well-organized daily routine.",
    image: "/images/rooms/study-room.webp",
    href: roomHref("study-room"),
  },
];

export const bedroomTiles = {
  slug: "bedroom",
  title: "Bedroom",
  href: roomHref("bedroom"),
  categories: [
    ["Bed", "bed"],
    ["Bedside Table", "bedside-table"],
    ["Dressing Table", "dressing-table"],
    ["Chest Of Drawer", "chest-of-drawer"],
    ["Wardrobe", "wardrobe"],
    ["TV Cabinet", "tv-cabinet"],
    ["Reading Table", "reading-table"],
    ["Bookshelf", "bookshelf"],
  ].map(([name, slug]) => ({
    name,
    image: `/images/categories/${slug}.jpg`,
    href: subHref("bedroom", slug),
  })) satisfies CategoryTile[],
};

/** Product rows on the home page (same picks as the original page). */
export const featuredSections = [
  {
    slug: "living-room",
    title: "Living Room",
    href: roomHref("living-room"),
    codes: ["SS5210120", "SS5150133", "SS5200105", "SS5190104", "SS5180119", "SS5250103", "SS5120121", "SS5220170"],
  },
  {
    slug: "office-room",
    title: "Office Room",
    href: roomHref("office-room"),
    codes: ["25263300042", "SS5220135", "SS5160107", "SS5230126", "SS5180122", "SS5150136"],
  },
];

export const navLinks = [
  { label: "Furniture", href: "/shop" },
  ...homeRooms.map((r) => ({ label: r.name, href: r.href })),
  { label: "Storage", href: roomHref("storage") },
];

export const infoLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Payment Policy", href: "/payment-policy" },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Exchange & Refund", href: "/exchange-return" },
  { label: "Loyalty Program", href: "/loyalty-program" },
  { label: "Terms & Conditions", href: "/terms-conditions" },
  { label: "Store Locations", href: "/store-locations" },
  { label: "Gift Card Policy", href: "/gift-card-policy" },
];

export const footerColumns = [
  {
    title: "Legal",
    links: [
      { label: "Shipping Policy", href: "/shipping-policy" },
      { label: "Terms Conditions", href: "/terms-conditions" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Payment Policy", href: "/payment-policy" },
      { label: "Gift Card Policy", href: "/gift-card-policy" },
    ],
  },
  {
    title: "Information",
    links: [
      { label: "Exchange & Refund", href: "/exchange-return" },
      { label: "Loyalty Program", href: "/loyalty-program" },
      { label: "Store Locations", href: "/store-locations" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about-us" },
      { label: "Contact Us", href: "/contact-us" },
      { label: "Intellectual Property", href: "/intellectual-property" },
    ],
  },
];

export const payments = [
  { name: "Visa", src: "/payments/visa-logo.svg" },
  { name: "Nagad", src: "/payments/nagad.svg" },
  { name: "Bkash", src: "/payments/bkash_svg.svg" },
  { name: "American Express", src: "/payments/amex.svg" },
  { name: "MasterCard", src: "/payments/mastercard.svg" },
  { name: "Rocket", src: "/payments/rocket.svg" },
];

export const contact = {
  phone: "09666774577",
  phoneHref: "tel:+8809666774577",
  email: "support@basha.com",
  hours: "We're available from 10.00 AM – 10.00 PM",
  facebook: "https://www.facebook.com/basha/",
  instagram: "https://www.instagram.com/basha/",
};

/** Delivery terms shown at checkout (from the product "Details" section). */
export const delivery = {
  insideDhaka: 1500,
  outsideDhaka: 5000,
  advancePercent: 10,
  digitalPaymentDiscountPercent: 5,
};

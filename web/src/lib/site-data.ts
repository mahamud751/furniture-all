export type SiteData = {
  contact: {
    phone: string;
    phoneHref: string;
    email: string;
    hours: string;
    facebook: string;
    instagram: string;
  };
  delivery: {
    insideDhaka: number;
    outsideDhaka: number;
    advancePercent: number;
    digitalPaymentDiscountPercent: number;
  };
  promoBanner: string;
  navLinks: { label: string; href: string }[];
  rooms: { slug: string; title: string; children: { slug: string; title: string }[] }[];
  footerColumns: { title: string; links: { label: string; href: string }[] }[];
};

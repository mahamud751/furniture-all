import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import "dotenv/config";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

function catalogueDir(): string {
  const found = [join(__dirname, "../../web/src/data"), join(__dirname, "../../../web/src/data")].find((dir) =>
    existsSync(join(dir, "products.json")),
  );
  if (!found) throw new Error("Furniture catalogue data was not found in web/src/data.");
  return found;
}

const dataDir = catalogueDir();

type RawProduct = {
  code: string;
  slug: string;
  title: string;
  brand: string | null;
  price: number;
  discount: number;
  finalPrice: number;
  colors: number;
  inStock: boolean;
  description: string;
  details: string;
  specifications: { title: string; html: string }[];
  images: string[];
};

type RawSub = { slug: string; title: string; codes: string[] };
type RawRoom = { slug: string; title: string; codes: string[]; children: RawSub[] };
type RawStore = {
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

const homeCopy: Record<string, { description: string; image: string; showOnHome: boolean; navOrder: number }> = {
  bedroom: {
    description: "A complete selection designed for comfort, rest, and everyday living.",
    image: "/images/rooms/bedroom.webp",
    showOnHome: true,
    navOrder: 0,
  },
  "living-room": {
    description: "Designed for everyday gathering, conversation, and shared moments.",
    image: "/images/rooms/living-room.webp",
    showOnHome: true,
    navOrder: 1,
  },
  "dining-room": {
    description: "Structured furniture and considered forms for daily use.",
    image: "/images/rooms/dining-room.webp",
    showOnHome: true,
    navOrder: 2,
  },
  "office-room": {
    description: "Function and productivity come together in pieces that elevate workspaces.",
    image: "/images/rooms/office-room.webp",
    showOnHome: true,
    navOrder: 3,
  },
  "study-room": {
    description: "Designed for focus, learning, and a well-organized daily routine.",
    image: "/images/rooms/study-room.webp",
    showOnHome: true,
    navOrder: 4,
  },
  storage: {
    description: "",
    image: "",
    showOnHome: false,
    navOrder: 5,
  },
};

const bedroomTiles: [string, string][] = [
  ["Bed", "bed"],
  ["Bedside Table", "bedside-table"],
  ["Dressing Table", "dressing-table"],
  ["Chest Of Drawer", "chest-of-drawer"],
  ["Wardrobe", "wardrobe"],
  ["TV Cabinet", "tv-cabinet"],
  ["Reading Table", "reading-table"],
  ["Bookshelf", "bookshelf"],
];

const featured = [
  {
    slug: "living-room",
    title: "Living Room",
    codes: ["SS5210120", "SS5150133", "SS5200105", "SS5190104", "SS5180119", "SS5250103", "SS5120121", "SS5220170"],
  },
  {
    slug: "office-room",
    title: "Office Room",
    codes: ["25263300042", "SS5220135", "SS5160107", "SS5230126", "SS5180122", "SS5150136"],
  },
];

const footerColumns = [
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

function readJson<T>(name: string): T {
  return JSON.parse(readFileSync(join(dataDir, name), "utf8")) as T;
}

function decodeTitle(text: string) {
  return text.replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

async function ensureAdmin() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@ilyn.local").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "Admin@12345";
  const name = process.env.ADMIN_NAME ?? "Admin";
  const hash = await bcrypt.hash(password, 10);
  await prisma.admin.upsert({
    where: { email },
    update: {},
    create: { email, name, password: hash },
  });
  console.log(`Admin ready: ${email}`);
}

async function main() {
  await ensureAdmin();
  if ((await prisma.product.count()) > 0) {
    console.log("Catalogue already present. Seed left it in place.");
    return;
  }

  const products = readJson<RawProduct[]>("products.json");
  const categories = readJson<{ all: string[]; rooms: RawRoom[] }>("categories.json");
  const stores = readJson<RawStore[]>("stores.json");
  const pages = readJson<Record<string, { title: string; html: string }>>("pages.json");
  const tileSlugs = new Set(bedroomTiles.map(([, slug]) => slug));
  const order = new Map<string, number>();
  categories.all.forEach((code, index) => {
    if (!order.has(code)) order.set(code, index);
  });

  await prisma.$transaction(
    async (tx) => {
      await tx.setting.create({
        data: {
          id: "default",
          phone: "09666774577",
          phoneHref: "tel:+8809666774577",
          email: "support@ilyn.global",
          hours: "We're available from 10.00 AM – 10.00 PM",
          facebook: "https://www.facebook.com/ILYNLifeStyle/",
          instagram: "https://www.instagram.com/ilynlifestyle/",
          insideDhaka: 1500,
          outsideDhaka: 5000,
          advancePercent: 10,
          digitalPaymentDiscountPercent: 5,
          promoBanner: "Save 5% On Entire Order With Digital Payment",
          heroDesktop: "/images/banners/hero-desktop.jpg",
          heroMobile: "/images/banners/hero-mobile.jpg",
          heroHref: "/shop",
          footerColumns,
        },
      });

      const pageRows = Object.entries(pages).filter(([, page]) => page.html.trim());
      await tx.page.createMany({
        data: pageRows.map(([slug, page]) => ({
          slug,
          title: decodeTitle(page.title),
          html: page.html,
          published: true,
        })),
      });

      await tx.store.createMany({
        data: stores.map((store, index) => ({
          slug: store.slug,
          title: store.title,
          type: store.type,
          region: store.region,
          address: store.address,
          contact: store.contact,
          hours: store.hours,
          mapUrl: store.mapUrl ?? "",
          lat: store.lat,
          lng: store.lng,
          image: store.image,
          sortOrder: index,
          active: true,
        })),
      });

      const roomId = new Map<string, string>();
      for (const [index, room] of categories.rooms.entries()) {
        const copy = homeCopy[room.slug] ?? { description: "", image: "", showOnHome: false, navOrder: index };
        const created = await tx.room.create({
          data: {
            slug: room.slug,
            title: room.title,
            description: copy.description,
            image: copy.image,
            sortOrder: index,
            navOrder: copy.navOrder,
            showOnHome: copy.showOnHome,
          },
        });
        roomId.set(room.slug, created.id);
      }

      const subId = new Map<string, string>();
      for (const room of categories.rooms) {
        for (const [index, child] of room.children.entries()) {
          const created = await tx.subCategory.create({
            data: {
              roomId: roomId.get(room.slug)!,
              slug: child.slug,
              title: child.title,
              image: room.slug === "bedroom" && tileSlugs.has(child.slug) ? `/images/categories/${child.slug}.jpg` : "",
              sortOrder: index,
            },
          });
          subId.set(`${room.slug}/${child.slug}`, created.id);
        }
      }

      const createdProducts = await tx.product.createManyAndReturn({
        data: products.map((product, index) => ({
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
          sortOrder: order.get(product.code) ?? products.length + index,
        })),
      });
      const productId = new Map(createdProducts.map((product) => [product.code, product.id]));

      await tx.productImage.createMany({
        data: products.flatMap((product) =>
          product.images.map((url, index) => ({
            productId: productId.get(product.code)!,
            url,
            sortOrder: index,
          })),
        ),
      });
      await tx.specification.createMany({
        data: products.flatMap((product) =>
          product.specifications.map((spec, index) => ({
            productId: productId.get(product.code)!,
            title: spec.title,
            html: spec.html,
            sortOrder: index,
          })),
        ),
      });

      const roomLinks: { productId: string; roomId: string; sortOrder: number }[] = [];
      for (const room of categories.rooms) {
        const seen = new Set<string>();
        room.codes.forEach((code, index) => {
          const id = productId.get(code);
          if (!id || seen.has(code)) return;
          seen.add(code);
          roomLinks.push({ productId: id, roomId: roomId.get(room.slug)!, sortOrder: index });
        });
      }
      await tx.productRoom.createMany({ data: roomLinks });

      const subLinks: { productId: string; subCategoryId: string; sortOrder: number }[] = [];
      for (const room of categories.rooms) {
        for (const child of room.children) {
          const seen = new Set<string>();
          child.codes.forEach((code, index) => {
            const id = productId.get(code);
            const sub = subId.get(`${room.slug}/${child.slug}`);
            if (!id || !sub || seen.has(code)) return;
            seen.add(code);
            subLinks.push({ productId: id, subCategoryId: sub, sortOrder: index });
          });
        }
      }
      await tx.productCategory.createMany({ data: subLinks });

      const tileBlock = await tx.homeBlock.create({
        data: { kind: "tiles", slug: "bedroom", title: "Bedroom", sortOrder: 0 },
      });
      await tx.homeBlockItem.createMany({
        data: bedroomTiles.map(([title, slug], index) => ({
          blockId: tileBlock.id,
          sortOrder: index,
          title,
          image: `/images/categories/${slug}.jpg`,
          href: `/shop/bedroom/${slug}`,
        })),
      });

      for (const [sectionIndex, section] of featured.entries()) {
        const block = await tx.homeBlock.create({
          data: { kind: "products", slug: section.slug, title: section.title, sortOrder: sectionIndex + 1 },
        });
        await tx.homeBlockItem.createMany({
          data: section.codes
            .map((code, index) => ({ code, index }))
            .filter((item) => productId.has(item.code))
            .map((item) => ({
              blockId: block.id,
              sortOrder: item.index,
              productId: productId.get(item.code)!,
            })),
        });
      }
    },
    { timeout: 180000, maxWait: 20000 },
  );

  console.log(`Seeded ${products.length} products, ${stores.length} stores, and the furniture pages.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "./prisma.service";
import { asFooter, cardInclude, detailInclude, presentCard, presentProduct } from "./present";

const roomInclude = {
  children: {
    orderBy: { sortOrder: "asc" as const },
    include: { _count: { select: { products: true } } },
  },
} satisfies Prisma.RoomInclude;

const roomTree = {
  orderBy: { sortOrder: "asc" as const },
  include: roomInclude,
} satisfies Prisma.RoomFindManyArgs;

type RoomTree = Prisma.RoomGetPayload<typeof roomTree>;

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  private visibleChildren(room: RoomTree) {
    return room.children
      .filter((child) => child._count.products > 0)
      .map((child) => ({ slug: child.slug, title: child.title }));
  }

  private async settings() {
    const setting = await this.prisma.setting.findUnique({ where: { id: "default" } });
    if (!setting) throw new NotFoundException("Store settings are not ready.");
    return setting;
  }

  async site() {
    const [setting, rooms] = await Promise.all([
      this.settings(),
      this.prisma.room.findMany(roomTree),
    ]);
    const navRooms = [...rooms].sort((a, b) => a.navOrder - b.navOrder);
    return {
      contact: {
        phone: setting.phone,
        phoneHref: setting.phoneHref,
        email: setting.email,
        hours: setting.hours,
        facebook: setting.facebook,
        instagram: setting.instagram,
      },
      delivery: {
        insideDhaka: setting.insideDhaka,
        outsideDhaka: setting.outsideDhaka,
        advancePercent: setting.advancePercent,
        digitalPaymentDiscountPercent: setting.digitalPaymentDiscountPercent,
      },
      promoBanner: setting.promoBanner,
      navLinks: [{ label: "Furniture", href: "/shop" }, ...navRooms.map((room) => ({ label: room.title, href: `/shop/${room.slug}` }))],
      rooms: rooms.map((room) => ({
        slug: room.slug,
        title: room.title,
        children: this.visibleChildren(room),
      })),
      footerColumns: asFooter(setting.footerColumns),
    };
  }

  async home() {
    const setting = await this.settings();
    const [rooms, blocks] = await Promise.all([
      this.prisma.room.findMany({ where: { showOnHome: true }, orderBy: { navOrder: "asc" } }),
      this.prisma.homeBlock.findMany({
        orderBy: { sortOrder: "asc" },
        include: {
          items: {
            orderBy: { sortOrder: "asc" },
            include: { product: { include: cardInclude } },
          },
        },
      }),
    ]);
    return {
      hero: { desktop: setting.heroDesktop, mobile: setting.heroMobile, href: setting.heroHref },
      rooms: rooms.map((room) => ({
        slug: room.slug,
        name: room.title,
        description: room.description,
        image: room.image,
        href: `/shop/${room.slug}`,
      })),
      blocks: blocks.map((block) => {
        const href = `/shop/${block.slug}`;
        if (block.kind === "tiles") {
          return {
            kind: "tiles" as const,
            slug: block.slug,
            title: block.title,
            href,
            categories: block.items.map((item) => ({
              name: item.title,
              image: item.image,
              href: item.href || href,
            })),
          };
        }
        return {
          kind: "products" as const,
          slug: block.slug,
          title: block.title,
          href,
          products: block.items.flatMap((item) => (item.product ? [presentCard(item.product)] : [])),
        };
      }),
    };
  }

  async shop() {
    const [rooms, products] = await Promise.all([
      this.prisma.room.findMany(roomTree),
      this.prisma.product.findMany({ orderBy: { sortOrder: "asc" }, include: cardInclude }),
    ]);
    return {
      rooms: rooms.map((room) => ({ slug: room.slug, title: room.title, children: this.visibleChildren(room) })),
      products: products.map(presentCard),
    };
  }

  private async roomOrThrow(slug: string) {
    const room = await this.prisma.room.findUnique({ where: { slug }, include: roomInclude });
    if (!room) throw new NotFoundException("Room not found.");
    return room;
  }

  async room(slug: string) {
    const room = await this.roomOrThrow(slug);
    const links = await this.prisma.productRoom.findMany({
      where: { roomId: room.id },
      orderBy: { sortOrder: "asc" },
      include: { product: { include: cardInclude } },
    });
    return {
      slug: room.slug,
      title: room.title,
      children: this.visibleChildren(room),
      products: links.map((link) => presentCard(link.product)),
    };
  }

  async sub(roomSlug: string, subSlug: string) {
    const room = await this.roomOrThrow(roomSlug);
    const sub = room.children.find((child) => child.slug === subSlug);
    if (!sub) throw new NotFoundException("Category not found.");
    const links = await this.prisma.productCategory.findMany({
      where: { subCategoryId: sub.id },
      orderBy: { sortOrder: "asc" },
      include: { product: { include: cardInclude } },
    });
    return {
      room: { slug: room.slug, title: room.title },
      sub: { slug: sub.slug, title: sub.title },
      children: this.visibleChildren(room),
      products: links.map((link) => presentCard(link.product)),
    };
  }

  async product(slug: string) {
    const product = await this.prisma.product.findUnique({ where: { slug }, include: detailInclude });
    if (!product) throw new NotFoundException("Product not found.");
    const membership = await this.prisma.productRoom.findFirst({
      where: { productId: product.id },
      orderBy: { room: { sortOrder: "asc" } },
      include: { room: true },
    });
    let relatedProducts: Prisma.ProductGetPayload<{ include: typeof cardInclude }>[] = [];
    if (membership) {
      const inRoom = await this.prisma.productRoom.findMany({
        where: { roomId: membership.roomId, productId: { not: product.id } },
        orderBy: { sortOrder: "asc" },
        take: 8,
        include: { product: { include: cardInclude } },
      });
      relatedProducts = inRoom.map((link) => link.product);
    }
    if (relatedProducts.length < 8) {
      const more = await this.prisma.product.findMany({
        where: { id: { notIn: [product.id, ...relatedProducts.map((item) => item.id)] } },
        orderBy: { sortOrder: "asc" },
        take: 8 - relatedProducts.length,
        include: cardInclude,
      });
      relatedProducts = [...relatedProducts, ...more];
    }
    return {
      ...presentProduct(product),
      room: membership ? { slug: membership.room.slug, title: membership.room.title } : null,
      related: relatedProducts.map(presentCard),
    };
  }

  async search(query: string) {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean).slice(0, 8);
    if (!words.length) return [];
    const products = await this.prisma.product.findMany({
      where: {
        AND: words.map((word) => ({
          OR: [
            { title: { contains: word, mode: "insensitive" } },
            { code: { contains: word, mode: "insensitive" } },
          ],
        })),
      },
      orderBy: { sortOrder: "asc" },
      include: cardInclude,
    });
    return products.map(presentCard);
  }

  async stores() {
    const stores = await this.prisma.store.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
    return stores.map((store) => ({
      slug: store.slug,
      title: store.title,
      type: store.type,
      region: store.region,
      address: store.address,
      contact: store.contact,
      hours: store.hours,
      mapUrl: store.mapUrl,
      lat: store.lat,
      lng: store.lng,
      image: store.image,
    }));
  }

  async page(slug: string) {
    const page = await this.prisma.page.findUnique({ where: { slug } });
    if (!page || !page.published || !page.html.trim()) throw new NotFoundException("Page not found.");
    return { slug: page.slug, title: page.title, html: page.html };
  }
}

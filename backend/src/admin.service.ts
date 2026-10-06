import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import { AuthService } from "./auth.service";
import {
  HomeWriteDto,
  OrderStatusDto,
  PageWriteDto,
  ProductWriteDto,
  RoomWriteDto,
  SettingsWriteDto,
  StoreWriteDto,
} from "./dto";
import { PrismaService } from "./prisma.service";
import { asFooter, detailInclude, presentProduct } from "./present";

const STATUSES = ["received", "confirmed", "processing", "delivered", "cancelled"] as const;

function conflict(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    throw new ConflictException("A record with that code, slug, phone, or email already exists.");
  }
  throw error;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);
}

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
  ) {}

  async login(email: string, password: string) {
    const admin = await this.prisma.admin.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      throw new UnauthorizedException("The email or password is incorrect.");
    }
    return {
      token: this.auth.sign({ sub: admin.id, role: "admin", email: admin.email }, "12h"),
      admin: { id: admin.id, email: admin.email, name: admin.name },
    };
  }

  async me(id: string) {
    const admin = await this.prisma.admin.findUnique({ where: { id } });
    if (!admin) throw new UnauthorizedException("Sign in again.");
    return { id: admin.id, email: admin.email, name: admin.name };
  }

  async dashboard() {
    const [products, rooms, stores, pages, customers, orders, unreadMessages, revenue, recent] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.room.count(),
      this.prisma.store.count(),
      this.prisma.page.count(),
      this.prisma.customer.count(),
      this.prisma.order.count(),
      this.prisma.message.count({ where: { read: false } }),
      this.prisma.order.aggregate({ where: { status: { not: "cancelled" } }, _sum: { total: true } }),
      this.prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { _count: { select: { items: true } } },
      }),
    ]);
    const byStatus = await this.prisma.order.groupBy({ by: ["status"], _count: { _all: true } });
    return {
      products,
      rooms,
      stores,
      pages,
      customers,
      orders,
      unreadMessages,
      revenue: revenue._sum.total ?? 0,
      byStatus: Object.fromEntries(STATUSES.map((status) => [status, byStatus.find((row) => row.status === status)?._count._all ?? 0])),
      recentOrders: recent.map((order) => ({
        id: order.id,
        number: order.number,
        name: `${order.firstName} ${order.lastName}`,
        phone: order.phone,
        total: order.total,
        status: order.status,
        items: order._count.items,
        createdAt: order.createdAt.toISOString(),
      })),
    };
  }

  async products(query: string, page: number) {
    const take = 20;
    const skip = Math.max(0, page - 1) * take;
    const where: Prisma.ProductWhereInput = query.trim()
      ? {
          OR: [
            { title: { contains: query.trim(), mode: "insensitive" } },
            { code: { contains: query.trim(), mode: "insensitive" } },
            { slug: { contains: query.trim(), mode: "insensitive" } },
          ],
        }
      : {};
    const [total, rows] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take,
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
          rooms: { include: { room: true } },
        },
      }),
    ]);
    return {
      total,
      page,
      pageSize: take,
      items: rows.map((product) => ({
        id: product.id,
        code: product.code,
        slug: product.slug,
        title: product.title,
        price: product.price,
        finalPrice: product.finalPrice,
        inStock: product.inStock,
        image: product.images[0]?.url ?? "",
        rooms: product.rooms.map((link) => link.room.title),
        updatedAt: product.updatedAt.toISOString(),
      })),
    };
  }

  async product(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { ...detailInclude, rooms: true, categories: true },
    });
    if (!product) throw new NotFoundException("Product not found.");
    return {
      ...presentProduct(product),
      roomIds: product.rooms.map((link) => link.roomId),
      subCategoryIds: product.categories.map((link) => link.subCategoryId),
    };
  }

  private async productData(dto: ProductWriteDto) {
    const slug = slugify(dto.slug || `${dto.title}-${dto.code}`);
    if (!slug) throw new BadRequestException("Enter a product slug.");
    const roomIds = [...new Set(dto.roomIds)];
    const subIds = [...new Set(dto.subCategoryIds)];
    const [rooms, subs] = await Promise.all([
      this.prisma.room.findMany({ where: { id: { in: roomIds } } }),
      this.prisma.subCategory.findMany({ where: { id: { in: subIds } } }),
    ]);
    if (rooms.length !== roomIds.length) throw new BadRequestException("One of the rooms does not exist.");
    if (subs.length !== subIds.length) throw new BadRequestException("One of the categories does not exist.");
    const linkedRooms = new Set([...roomIds, ...subs.map((sub) => sub.roomId)]);
    return {
      slug,
      fields: {
        code: dto.code.trim(),
        slug,
        title: dto.title.trim(),
        brand: dto.brand?.trim() || null,
        price: dto.price,
        discount: dto.discount,
        finalPrice: Math.max(0, dto.price - dto.discount),
        colors: dto.colors,
        inStock: dto.inStock,
        description: dto.description,
        details: dto.details,
      },
      images: dto.images.map((url) => url.trim()).filter(Boolean),
      specifications: dto.specifications.filter((spec) => spec.title.trim()),
      roomIds: [...linkedRooms],
      subIds,
    };
  }

  async createProduct(dto: ProductWriteDto) {
    const data = await this.productData(dto);
    try {
      const last = await this.prisma.product.aggregate({ _max: { sortOrder: true } });
      const product = await this.prisma.product.create({
        data: {
          ...data.fields,
          sortOrder: (last._max.sortOrder ?? 0) + 1,
          images: { create: data.images.map((url, sortOrder) => ({ url, sortOrder })) },
          specifications: { create: data.specifications.map((spec, sortOrder) => ({ title: spec.title.trim(), html: spec.html, sortOrder })) },
          rooms: { create: data.roomIds.map((roomId, sortOrder) => ({ roomId, sortOrder })) },
          categories: { create: data.subIds.map((subCategoryId, sortOrder) => ({ subCategoryId, sortOrder })) },
        },
        include: detailInclude,
      });
      return presentProduct(product);
    } catch (error) {
      conflict(error);
    }
  }

  async updateProduct(id: string, dto: ProductWriteDto) {
    await this.product(id);
    const data = await this.productData(dto);
    try {
      const product = await this.prisma.$transaction(async (tx) => {
        await tx.productImage.deleteMany({ where: { productId: id } });
        await tx.specification.deleteMany({ where: { productId: id } });
        await tx.productRoom.deleteMany({ where: { productId: id } });
        await tx.productCategory.deleteMany({ where: { productId: id } });
        return tx.product.update({
          where: { id },
          data: {
            ...data.fields,
            images: { create: data.images.map((url, sortOrder) => ({ url, sortOrder })) },
            specifications: { create: data.specifications.map((spec, sortOrder) => ({ title: spec.title.trim(), html: spec.html, sortOrder })) },
            rooms: { create: data.roomIds.map((roomId, sortOrder) => ({ roomId, sortOrder })) },
            categories: { create: data.subIds.map((subCategoryId, sortOrder) => ({ subCategoryId, sortOrder })) },
          },
          include: detailInclude,
        });
      });
      return presentProduct(product);
    } catch (error) {
      conflict(error);
    }
  }

  async deleteProduct(id: string) {
    await this.product(id);
    await this.prisma.product.delete({ where: { id } });
    return { ok: true };
  }

  async rooms() {
    const rooms = await this.prisma.room.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        children: { orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } } } },
        _count: { select: { products: true } },
      },
    });
    return rooms.map((room) => ({
      id: room.id,
      slug: room.slug,
      title: room.title,
      description: room.description,
      image: room.image,
      sortOrder: room.sortOrder,
      navOrder: room.navOrder,
      showOnHome: room.showOnHome,
      productCount: room._count.products,
      children: room.children.map((child) => ({
        id: child.id,
        slug: child.slug,
        title: child.title,
        image: child.image,
        sortOrder: child.sortOrder,
        productCount: child._count.products,
      })),
    }));
  }

  async saveRoom(dto: RoomWriteDto, id?: string) {
    const slug = slugify(dto.slug || dto.title);
    if (!slug) throw new BadRequestException("Enter a room slug.");
    const children = dto.children.map((child, index) => ({
      id: child.id,
      slug: slugify(child.slug || child.title),
      title: child.title.trim(),
      image: child.image?.trim() ?? "",
      sortOrder: child.sortOrder ?? index,
    }));
    if (children.some((child) => !child.slug || !child.title)) {
      throw new BadRequestException("Every category needs a title.");
    }
    try {
      await this.prisma.$transaction(async (tx) => {
        const room = id
          ? await tx.room.update({
              where: { id },
              data: {
                slug,
                title: dto.title.trim(),
                description: dto.description.trim(),
                image: dto.image.trim(),
                sortOrder: dto.sortOrder,
                navOrder: dto.navOrder,
                showOnHome: dto.showOnHome,
              },
            })
          : await tx.room.create({
              data: {
                slug,
                title: dto.title.trim(),
                description: dto.description.trim(),
                image: dto.image.trim(),
                sortOrder: dto.sortOrder,
                navOrder: dto.navOrder,
                showOnHome: dto.showOnHome,
              },
            });
        const keep = children.flatMap((child) => (child.id ? [child.id] : []));
        await tx.subCategory.deleteMany({ where: { roomId: room.id, id: { notIn: keep } } });
        for (const child of children) {
          if (child.id) {
            const existing = await tx.subCategory.findUnique({ where: { id: child.id } });
            if (!existing || existing.roomId !== room.id) throw new BadRequestException("Category does not belong to this room.");
            await tx.subCategory.update({
              where: { id: child.id },
              data: { slug: child.slug, title: child.title, image: child.image, sortOrder: child.sortOrder },
            });
          } else {
            await tx.subCategory.create({
              data: { roomId: room.id, slug: child.slug, title: child.title, image: child.image, sortOrder: child.sortOrder },
            });
          }
        }
      });
      return this.rooms();
    } catch (error) {
      conflict(error);
    }
  }

  async deleteRoom(id: string) {
    const room = await this.prisma.room.findUnique({ where: { id } });
    if (!room) throw new NotFoundException("Room not found.");
    await this.prisma.room.delete({ where: { id } });
    return { ok: true };
  }

  async stores() {
    const stores = await this.prisma.store.findMany({ orderBy: { sortOrder: "asc" } });
    return stores;
  }

  async saveStore(dto: StoreWriteDto, id?: string) {
    const data = {
      slug: slugify(dto.slug || dto.title),
      title: dto.title.trim(),
      type: dto.type.trim(),
      region: dto.region.trim(),
      address: dto.address.trim(),
      contact: dto.contact.trim(),
      hours: dto.hours.map((hour) => hour.trim()).filter(Boolean),
      mapUrl: dto.mapUrl.trim(),
      lat: dto.lat ?? null,
      lng: dto.lng ?? null,
      image: dto.image.trim(),
      sortOrder: dto.sortOrder,
      active: dto.active,
    };
    if (!data.slug || !data.title) throw new BadRequestException("Enter the store name.");
    try {
      return id
        ? await this.prisma.store.update({ where: { id }, data })
        : await this.prisma.store.create({ data });
    } catch (error) {
      conflict(error);
    }
  }

  async deleteStore(id: string) {
    await this.prisma.store.delete({ where: { id } });
    return { ok: true };
  }

  async pages() {
    const pages = await this.prisma.page.findMany({ orderBy: { title: "asc" } });
    return pages.map((page) => ({
      id: page.id,
      slug: page.slug,
      title: page.title,
      published: page.published,
      updatedAt: page.updatedAt.toISOString(),
    }));
  }

  async page(id: string) {
    const page = await this.prisma.page.findUnique({ where: { id } });
    if (!page) throw new NotFoundException("Page not found.");
    return page;
  }

  async savePage(dto: PageWriteDto, id?: string) {
    const data = {
      slug: slugify(dto.slug || dto.title),
      title: dto.title.trim(),
      html: dto.html,
      published: dto.published,
    };
    if (!data.slug || !data.title) throw new BadRequestException("Enter the page title.");
    try {
      return id ? await this.prisma.page.update({ where: { id }, data }) : await this.prisma.page.create({ data });
    } catch (error) {
      conflict(error);
    }
  }

  async deletePage(id: string) {
    await this.prisma.page.delete({ where: { id } });
    return { ok: true };
  }

  async customers() {
    const customers = await this.prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { orders: true } } },
    });
    return customers.map((customer) => ({
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      email: customer.email,
      city: customer.city,
      orders: customer._count.orders,
      createdAt: customer.createdAt.toISOString(),
    }));
  }

  async deleteCustomer(id: string) {
    await this.prisma.customer.delete({ where: { id } });
    return { ok: true };
  }

  async orders(status?: string) {
    const orders = await this.prisma.order.findMany({
      where: status && status !== "all" ? { status } : {},
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { items: true } } },
    });
    return orders.map((order) => ({
      id: order.id,
      number: order.number,
      name: `${order.firstName} ${order.lastName}`,
      phone: order.phone,
      email: order.email,
      city: order.city,
      total: order.total,
      advance: order.advance,
      status: order.status,
      payment: order.payment,
      location: order.location,
      items: order._count.items,
      createdAt: order.createdAt.toISOString(),
    }));
  }

  async order(id: string) {
    const order = await this.prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) throw new NotFoundException("Order not found.");
    return {
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }

  async updateOrder(id: string, dto: OrderStatusDto) {
    await this.order(id);
    const order = await this.prisma.order.update({
      where: { id },
      data: { status: dto.status, note: dto.note ?? undefined },
      include: { items: true },
    });
    return { ...order, createdAt: order.createdAt.toISOString(), updatedAt: order.updatedAt.toISOString() };
  }

  async messages() {
    const messages = await this.prisma.message.findMany({ orderBy: { createdAt: "desc" } });
    return messages.map((message) => ({
      id: message.id,
      name: message.name,
      phone: message.phone,
      email: message.email,
      subject: message.subject,
      read: message.read,
      preview: message.body.slice(0, 140),
      createdAt: message.createdAt.toISOString(),
    }));
  }

  async message(id: string) {
    const message = await this.prisma.message.findUnique({ where: { id } });
    if (!message) throw new NotFoundException("Message not found.");
    const updated = message.read ? message : await this.prisma.message.update({ where: { id }, data: { read: true } });
    return { ...updated, createdAt: updated.createdAt.toISOString() };
  }

  async setMessageRead(id: string, read: boolean) {
    const message = await this.prisma.message.update({ where: { id }, data: { read } });
    return { id: message.id, read: message.read };
  }

  async deleteMessage(id: string) {
    await this.prisma.message.delete({ where: { id } });
    return { ok: true };
  }

  private presentSettings(setting: {
    phone: string;
    phoneHref: string;
    email: string;
    hours: string;
    facebook: string;
    instagram: string;
    insideDhaka: number;
    outsideDhaka: number;
    advancePercent: number;
    digitalPaymentDiscountPercent: number;
    promoBanner: string;
    footerColumns: Prisma.JsonValue;
  }) {
    return {
      phone: setting.phone,
      phoneHref: setting.phoneHref,
      email: setting.email,
      hours: setting.hours,
      facebook: setting.facebook,
      instagram: setting.instagram,
      insideDhaka: setting.insideDhaka,
      outsideDhaka: setting.outsideDhaka,
      advancePercent: setting.advancePercent,
      digitalPaymentDiscountPercent: setting.digitalPaymentDiscountPercent,
      promoBanner: setting.promoBanner,
      footerColumns: asFooter(setting.footerColumns),
    };
  }

  async settings() {
    const setting = await this.prisma.setting.findUnique({ where: { id: "default" } });
    if (!setting) throw new NotFoundException("Store settings are not ready.");
    return this.presentSettings(setting);
  }

  async updateSettings(dto: SettingsWriteDto) {
    const setting = await this.prisma.setting.update({
      where: { id: "default" },
      data: {
        ...dto,
        email: dto.email.trim().toLowerCase(),
        footerColumns: dto.footerColumns as unknown as Prisma.InputJsonValue,
      },
    });
    return this.presentSettings(setting);
  }

  async homepage() {
    const setting = await this.prisma.setting.findUnique({ where: { id: "default" } });
    if (!setting) throw new NotFoundException("Store settings are not ready.");
    const blocks = await this.prisma.homeBlock.findMany({
      orderBy: { sortOrder: "asc" },
      include: { items: { orderBy: { sortOrder: "asc" }, include: { product: true } } },
    });
    return {
      heroDesktop: setting.heroDesktop,
      heroMobile: setting.heroMobile,
      heroHref: setting.heroHref,
      blocks: blocks.map((block) => ({
        kind: block.kind,
        slug: block.slug,
        title: block.title,
        sortOrder: block.sortOrder,
        items: block.items.map((item) => ({
          title: item.title,
          image: item.image,
          href: item.href,
          productCode: item.product?.code ?? "",
          productTitle: item.product?.title ?? "",
          sortOrder: item.sortOrder,
        })),
      })),
    };
  }

  async updateHomepage(dto: HomeWriteDto) {
    const codes = [...new Set(dto.blocks.flatMap((block) => block.items.map((item) => item.productCode?.trim() || "")).filter(Boolean))];
    const products = await this.prisma.product.findMany({ where: { code: { in: codes } } });
    const byCode = new Map(products.map((product) => [product.code, product.id]));
    const missing = codes.filter((code) => !byCode.has(code));
    if (missing.length) throw new BadRequestException(`Unknown product code: ${missing.join(", ")}`);
    await this.prisma.$transaction(async (tx) => {
      await tx.setting.update({
        where: { id: "default" },
        data: { heroDesktop: dto.heroDesktop.trim(), heroMobile: dto.heroMobile.trim(), heroHref: dto.heroHref.trim() || "/shop" },
      });
      await tx.homeBlock.deleteMany();
      for (const block of dto.blocks) {
        await tx.homeBlock.create({
          data: {
            kind: block.kind,
            slug: slugify(block.slug || block.title),
            title: block.title.trim(),
            sortOrder: block.sortOrder,
            items: {
              create: block.items.map((item, index) => ({
                sortOrder: item.sortOrder ?? index,
                title: item.title?.trim() ?? "",
                image: item.image?.trim() ?? "",
                href: item.href?.trim() ?? "",
                productId: item.productCode?.trim() ? byCode.get(item.productCode.trim()) : null,
              })),
            },
          },
        });
      }
    });
    return this.homepage();
  }
}

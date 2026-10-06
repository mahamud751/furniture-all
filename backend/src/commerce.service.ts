import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import { AuthService } from "./auth.service";
import { PrismaService } from "./prisma.service";
import { digits, orderNumber, presentCustomer, presentOrder, quote } from "./present";
import { CreateOrderDto, MessageDto, RegisterDto, UpdateCustomerDto } from "./dto";

const orderInclude = { items: { orderBy: { id: "asc" as const } } } satisfies Prisma.OrderInclude;

@Injectable()
export class CommerceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
  ) {}

  private async delivery() {
    const setting = await this.prisma.setting.findUnique({ where: { id: "default" } });
    if (!setting) throw new NotFoundException("Store settings are not ready.");
    return setting;
  }

  async register(dto: RegisterDto) {
    const phone = digits(dto.phone);
    if (phone.length < 11) throw new BadRequestException("Enter an 11-digit phone number.");
    const email = dto.email.trim().toLowerCase();
    const hash = await bcrypt.hash(dto.password, 10);
    try {
      const customer = await this.prisma.customer.create({
        data: {
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          phone,
          email,
          password: hash,
        },
      });
      await this.prisma.order.updateMany({ where: { phone, customerId: null }, data: { customerId: customer.id } });
      return {
        token: this.auth.sign({ sub: customer.id, role: "customer", email: customer.email }, "30d"),
        customer: presentCustomer(customer),
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("An account with this phone or email already exists.");
      }
      throw error;
    }
  }

  async login(phoneRaw: string, password: string) {
    const phone = digits(phoneRaw);
    const customer = await this.prisma.customer.findUnique({ where: { phone } });
    if (!customer || !(await bcrypt.compare(password, customer.password))) {
      throw new UnauthorizedException("The phone number or password is incorrect.");
    }
    await this.prisma.order.updateMany({ where: { phone, customerId: null }, data: { customerId: customer.id } });
    return {
      token: this.auth.sign({ sub: customer.id, role: "customer", email: customer.email }, "30d"),
      customer: presentCustomer(customer),
    };
  }

  async me(id: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new UnauthorizedException("Sign in again.");
    return presentCustomer(customer);
  }

  async updateMe(id: string, dto: UpdateCustomerDto) {
    const current = await this.prisma.customer.findUnique({ where: { id } });
    if (!current) throw new UnauthorizedException("Sign in again.");
    const phone = dto.phone ? digits(dto.phone) : current.phone;
    if (phone.length < 11) throw new BadRequestException("Enter an 11-digit phone number.");
    try {
      const customer = await this.prisma.customer.update({
        where: { id },
        data: {
          firstName: dto.firstName?.trim() || current.firstName,
          lastName: dto.lastName?.trim() || current.lastName,
          phone,
          email: dto.email ? dto.email.trim().toLowerCase() : current.email,
          address: dto.address !== undefined ? dto.address.trim() : current.address,
          city: dto.city !== undefined ? dto.city.trim() : current.city,
          password: dto.password ? await bcrypt.hash(dto.password, 10) : undefined,
        },
      });
      return presentCustomer(customer);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("An account with this phone or email already exists.");
      }
      throw error;
    }
  }

  async myOrders(customerId: string) {
    const orders = await this.prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      include: orderInclude,
    });
    return orders.map(presentOrder);
  }

  async createOrder(dto: CreateOrderDto, customerId?: string) {
    if (!dto.items.length) throw new BadRequestException("Your bag is empty.");
    const phone = digits(dto.phone);
    if (phone.length < 11) throw new BadRequestException("Enter an 11-digit phone number.");
    if (!dto.firstName.trim() || !dto.lastName.trim() || !dto.address.trim() || !dto.city.trim()) {
      throw new BadRequestException("Enter your name, delivery address, and city.");
    }
    const codes = [...new Set(dto.items.map((item) => item.code))];
    const products = await this.prisma.product.findMany({
      where: { code: { in: codes } },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    });
    const byCode = new Map(products.map((product) => [product.code, product]));
    let subtotal = 0;
    const items = dto.items.map((item) => {
      const product = byCode.get(item.code);
      if (!product) throw new BadRequestException(`Product ${item.code} is no longer available.`);
      if (!product.inStock) throw new BadRequestException(`${product.title} is out of stock.`);
      subtotal += product.finalPrice * item.quantity;
      return {
        productId: product.id,
        code: product.code,
        slug: product.slug,
        title: product.title,
        price: product.finalPrice,
        image: product.images[0]?.url ?? "",
        quantity: item.quantity,
      };
    });
    const setting = await this.delivery();
    const totals = quote(subtotal, dto.location, dto.payment, setting);
    let number = orderNumber();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const existing = await this.prisma.order.findUnique({ where: { number } });
      if (!existing) break;
      number = orderNumber();
    }
    const order = await this.prisma.order.create({
      data: {
        number,
        customerId,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        phone,
        email: dto.email.trim().toLowerCase(),
        address: dto.address.trim(),
        city: dto.city.trim(),
        location: dto.location,
        payment: dto.payment,
        subtotal,
        ...totals,
        items: { create: items },
      },
      include: orderInclude,
    });
    if (customerId) {
      await this.prisma.customer.update({
        where: { id: customerId },
        data: { address: order.address, city: order.city },
      });
    }
    return presentOrder(order);
  }

  async orderByNumber(number: string) {
    const order = await this.prisma.order.findUnique({ where: { number }, include: orderInclude });
    if (!order) throw new NotFoundException("Order not found.");
    return presentOrder(order);
  }

  async message(dto: MessageDto) {
    const phone = digits(dto.phone);
    if (phone.length < 11) throw new BadRequestException("Enter an 11-digit phone number.");
    const created = await this.prisma.message.create({
      data: {
        name: `${dto.firstName.trim()} ${dto.lastName.trim()}`.trim(),
        phone,
        email: dto.email.trim().toLowerCase(),
        subject: "Furniture enquiry",
        body: dto.message.trim(),
      },
    });
    return { id: created.id, ok: true };
  }
}

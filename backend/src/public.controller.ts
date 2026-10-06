import { Body, Controller, Get, Param, Post, Query, Req } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Request } from "express";
import { AuthService } from "./auth.service";
import { CatalogService } from "./catalog.service";
import { CommerceService } from "./commerce.service";
import { CreateOrderDto, LoginDto, MessageDto, RegisterDto, UpdateCustomerDto } from "./dto";

@ApiTags("Catalogue")
@Controller()
export class PublicController {
  constructor(
    private readonly catalog: CatalogService,
    private readonly commerce: CommerceService,
    private readonly auth: AuthService,
  ) {}

  @Get("health")
  @ApiOperation({ summary: "API health check" })
  health() {
    return { ok: true, service: "furniture-api" };
  }

  @Get("site")
  @ApiOperation({ summary: "Header, footer, delivery rates, and promo banner" })
  site() {
    return this.catalog.site();
  }

  @Get("home")
  @ApiOperation({ summary: "Homepage hero, room slider, category tiles, and featured products" })
  home() {
    return this.catalog.home();
  }

  @Get("catalog/shop")
  @ApiOperation({ summary: "All furniture, with room chips" })
  shop() {
    return this.catalog.shop();
  }

  @Get("catalog/rooms/:slug")
  @ApiOperation({ summary: "Products in one room" })
  room(@Param("slug") slug: string) {
    return this.catalog.room(slug);
  }

  @Get("catalog/rooms/:slug/:sub")
  @ApiOperation({ summary: "Products in one subcategory" })
  sub(@Param("slug") slug: string, @Param("sub") sub: string) {
    return this.catalog.sub(slug, sub);
  }

  @Get("catalog/products/:slug")
  @ApiOperation({ summary: "Product detail, breadcrumb room, and related products" })
  product(@Param("slug") slug: string) {
    return this.catalog.product(slug);
  }

  @Get("catalog/search")
  @ApiOperation({ summary: "Search furniture by title and product code" })
  search(@Query("q") q = "") {
    return this.catalog.search(q.slice(0, 40));
  }

  @Get("stores")
  @ApiOperation({ summary: "Active store locations" })
  stores() {
    return this.catalog.stores();
  }

  @Get("pages/:slug")
  @ApiOperation({ summary: "Published content page" })
  page(@Param("slug") slug: string) {
    return this.catalog.page(slug);
  }

  @Post("orders")
  @ApiOperation({ summary: "Place an order. Totals are calculated on the server. A customer token attaches the order to the account." })
  @ApiOkResponse({ description: "The saved order, including the public order number." })
  createOrder(@Body() dto: CreateOrderDto, @Req() req: Request) {
    const customer = this.auth.optionalCustomer(req);
    return this.commerce.createOrder(dto, customer?.sub);
  }

  @Get("orders/:number")
  @ApiOperation({ summary: "Order confirmation by public order number" })
  order(@Param("number") number: string) {
    return this.commerce.orderByNumber(number);
  }

  @Post("customers/register")
  @ApiOperation({ summary: "Create a customer account" })
  register(@Body() dto: RegisterDto) {
    return this.commerce.register(dto);
  }

  @Post("customers/login")
  @ApiOperation({ summary: "Sign in with phone and password" })
  login(@Body() dto: LoginDto) {
    return this.commerce.login(dto.phone, dto.password);
  }

  @Get("customers/me")
  @ApiOperation({ summary: "Current customer profile" })
  me(@Req() req: Request) {
    return this.commerce.me(this.auth.require(req, "customer").sub);
  }

  @Post("customers/me")
  @ApiOperation({ summary: "Update the current customer profile" })
  updateMe(@Body() dto: UpdateCustomerDto, @Req() req: Request) {
    return this.commerce.updateMe(this.auth.require(req, "customer").sub, dto);
  }

  @Get("customers/me/orders")
  @ApiOperation({ summary: "Orders for the signed-in customer" })
  myOrders(@Req() req: Request) {
    return this.commerce.myOrders(this.auth.require(req, "customer").sub);
  }

  @Post("messages")
  @ApiOperation({ summary: "Save a contact form message" })
  message(@Body() dto: MessageDto) {
    return this.commerce.message(dto);
  }
}

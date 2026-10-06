import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { randomBytes } from "crypto";
import type { Request } from "express";
import { mkdirSync, writeFileSync } from "fs";
import { extname, join } from "path";
import { AdminService } from "./admin.service";
import { AuthService } from "./auth.service";
import {
  AdminLoginDto,
  HomeWriteDto,
  OrderStatusDto,
  PageWriteDto,
  ProductWriteDto,
  ReadMessageDto,
  RoomWriteDto,
  SettingsWriteDto,
  StoreWriteDto,
} from "./dto";

@ApiTags("Admin")
@Controller("admin")
export class AdminController {
  constructor(
    private readonly admin: AdminService,
    private readonly auth: AuthService,
  ) {}

  private id(req: Request) {
    return this.auth.require(req, "admin").sub;
  }

  @Post("auth/login")
  @ApiOperation({ summary: "Admin sign in. Returns a bearer token." })
  login(@Body() dto: AdminLoginDto) {
    return this.admin.login(dto.email, dto.password);
  }

  @Get("auth/me")
  @ApiBearerAuth("JWT")
  @ApiOperation({ summary: "Current admin" })
  me(@Req() req: Request) {
    return this.admin.me(this.id(req));
  }

  @Get("dashboard")
  @ApiBearerAuth("JWT")
  @ApiOperation({ summary: "Counts, revenue, and recent orders" })
  dashboard(@Req() req: Request) {
    this.id(req);
    return this.admin.dashboard();
  }

  @Get("products")
  @ApiBearerAuth("JWT")
  @ApiOperation({ summary: "Search and page the catalogue" })
  products(@Req() req: Request, @Query("q") q = "", @Query("page") page = "1") {
    this.id(req);
    return this.admin.products(q, Math.max(1, Number(page) || 1));
  }

  @Get("products/:id")
  @ApiBearerAuth("JWT")
  product(@Req() req: Request, @Param("id") id: string) {
    this.id(req);
    return this.admin.product(id);
  }

  @Post("products")
  @ApiBearerAuth("JWT")
  @ApiOperation({ summary: "Create a product. Final price is price minus discount." })
  createProduct(@Req() req: Request, @Body() dto: ProductWriteDto) {
    this.id(req);
    return this.admin.createProduct(dto);
  }

  @Put("products/:id")
  @ApiBearerAuth("JWT")
  updateProduct(@Req() req: Request, @Param("id") id: string, @Body() dto: ProductWriteDto) {
    this.id(req);
    return this.admin.updateProduct(id, dto);
  }

  @Delete("products/:id")
  @ApiBearerAuth("JWT")
  deleteProduct(@Req() req: Request, @Param("id") id: string) {
    this.id(req);
    return this.admin.deleteProduct(id);
  }

  @Get("rooms")
  @ApiBearerAuth("JWT")
  @ApiOperation({ summary: "Rooms and their subcategories" })
  rooms(@Req() req: Request) {
    this.id(req);
    return this.admin.rooms();
  }

  @Post("rooms")
  @ApiBearerAuth("JWT")
  createRoom(@Req() req: Request, @Body() dto: RoomWriteDto) {
    this.id(req);
    return this.admin.saveRoom(dto);
  }

  @Put("rooms/:id")
  @ApiBearerAuth("JWT")
  updateRoom(@Req() req: Request, @Param("id") id: string, @Body() dto: RoomWriteDto) {
    this.id(req);
    return this.admin.saveRoom(dto, id);
  }

  @Delete("rooms/:id")
  @ApiBearerAuth("JWT")
  deleteRoom(@Req() req: Request, @Param("id") id: string) {
    this.id(req);
    return this.admin.deleteRoom(id);
  }

  @Get("stores")
  @ApiBearerAuth("JWT")
  stores(@Req() req: Request) {
    this.id(req);
    return this.admin.stores();
  }

  @Post("stores")
  @ApiBearerAuth("JWT")
  createStore(@Req() req: Request, @Body() dto: StoreWriteDto) {
    this.id(req);
    return this.admin.saveStore(dto);
  }

  @Put("stores/:id")
  @ApiBearerAuth("JWT")
  updateStore(@Req() req: Request, @Param("id") id: string, @Body() dto: StoreWriteDto) {
    this.id(req);
    return this.admin.saveStore(dto, id);
  }

  @Delete("stores/:id")
  @ApiBearerAuth("JWT")
  deleteStore(@Req() req: Request, @Param("id") id: string) {
    this.id(req);
    return this.admin.deleteStore(id);
  }

  @Get("pages")
  @ApiBearerAuth("JWT")
  pages(@Req() req: Request) {
    this.id(req);
    return this.admin.pages();
  }

  @Get("pages/:id")
  @ApiBearerAuth("JWT")
  page(@Req() req: Request, @Param("id") id: string) {
    this.id(req);
    return this.admin.page(id);
  }

  @Post("pages")
  @ApiBearerAuth("JWT")
  createPage(@Req() req: Request, @Body() dto: PageWriteDto) {
    this.id(req);
    return this.admin.savePage(dto);
  }

  @Put("pages/:id")
  @ApiBearerAuth("JWT")
  updatePage(@Req() req: Request, @Param("id") id: string, @Body() dto: PageWriteDto) {
    this.id(req);
    return this.admin.savePage(dto, id);
  }

  @Delete("pages/:id")
  @ApiBearerAuth("JWT")
  deletePage(@Req() req: Request, @Param("id") id: string) {
    this.id(req);
    return this.admin.deletePage(id);
  }

  @Get("customers")
  @ApiBearerAuth("JWT")
  customers(@Req() req: Request) {
    this.id(req);
    return this.admin.customers();
  }

  @Delete("customers/:id")
  @ApiBearerAuth("JWT")
  deleteCustomer(@Req() req: Request, @Param("id") id: string) {
    this.id(req);
    return this.admin.deleteCustomer(id);
  }

  @Get("orders")
  @ApiBearerAuth("JWT")
  @ApiOperation({ summary: "Orders, optionally filtered by status" })
  orders(@Req() req: Request, @Query("status") status?: string) {
    this.id(req);
    return this.admin.orders(status);
  }

  @Get("orders/:id")
  @ApiBearerAuth("JWT")
  order(@Req() req: Request, @Param("id") id: string) {
    this.id(req);
    return this.admin.order(id);
  }

  @Put("orders/:id")
  @ApiBearerAuth("JWT")
  @ApiOperation({ summary: "Change order status and internal note" })
  updateOrder(@Req() req: Request, @Param("id") id: string, @Body() dto: OrderStatusDto) {
    this.id(req);
    return this.admin.updateOrder(id, dto);
  }

  @Get("messages")
  @ApiBearerAuth("JWT")
  messages(@Req() req: Request) {
    this.id(req);
    return this.admin.messages();
  }

  @Get("messages/:id")
  @ApiBearerAuth("JWT")
  @ApiOperation({ summary: "Read a message. Opening it marks it as read." })
  message(@Req() req: Request, @Param("id") id: string) {
    this.id(req);
    return this.admin.message(id);
  }

  @Put("messages/:id")
  @ApiBearerAuth("JWT")
  setMessageRead(@Req() req: Request, @Param("id") id: string, @Body() dto: ReadMessageDto) {
    this.id(req);
    return this.admin.setMessageRead(id, dto.read);
  }

  @Delete("messages/:id")
  @ApiBearerAuth("JWT")
  deleteMessage(@Req() req: Request, @Param("id") id: string) {
    this.id(req);
    return this.admin.deleteMessage(id);
  }

  @Get("settings")
  @ApiBearerAuth("JWT")
  settings(@Req() req: Request) {
    this.id(req);
    return this.admin.settings();
  }

  @Put("settings")
  @ApiBearerAuth("JWT")
  updateSettings(@Req() req: Request, @Body() dto: SettingsWriteDto) {
    this.id(req);
    return this.admin.updateSettings(dto);
  }

  @Get("homepage")
  @ApiBearerAuth("JWT")
  homepage(@Req() req: Request) {
    this.id(req);
    return this.admin.homepage();
  }

  @Put("homepage")
  @ApiBearerAuth("JWT")
  updateHomepage(@Req() req: Request, @Body() dto: HomeWriteDto) {
    this.id(req);
    return this.admin.updateHomepage(dto);
  }

  @Post("uploads")
  @ApiBearerAuth("JWT")
  @ApiConsumes("multipart/form-data")
  @ApiBody({ schema: { type: "object", properties: { file: { type: "string", format: "binary" } } } })
  @ApiOperation({ summary: "Upload an image into the storefront public/uploads folder" })
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: 8 * 1024 * 1024 } }))
  upload(@Req() req: Request, @UploadedFile() file?: Express.Multer.File) {
    this.id(req);
    if (!file) throw new BadRequestException("Choose an image.");
    const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
    if (!allowed.has(file.mimetype)) throw new BadRequestException("Use a JPG, PNG, WEBP, or GIF.");
    const dir = join(process.env.WEB_PUBLIC_DIR ?? "", "uploads");
    if (!process.env.WEB_PUBLIC_DIR) throw new BadRequestException("WEB_PUBLIC_DIR is not configured.");
    mkdirSync(dir, { recursive: true });
    const ext = extname(file.originalname).toLowerCase() || ".jpg";
    const name = `${Date.now()}-${randomBytes(4).toString("hex")}${ext}`;
    writeFileSync(join(dir, name), file.buffer);
    return { url: `/uploads/${name}` };
  }
}

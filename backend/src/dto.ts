import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";

export class RegisterDto {
  @ApiProperty({ example: "Ayesha" })
  @IsString()
  @MaxLength(80)
  firstName: string;

  @ApiProperty({ example: "Rahman" })
  @IsString()
  @MaxLength(80)
  lastName: string;

  @ApiProperty({ example: "01700000000" })
  @IsString()
  phone: string;

  @ApiProperty({ example: "ayesha@example.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 6 })
  @IsString()
  @MinLength(6)
  @MaxLength(80)
  password: string;
}

export class LoginDto {
  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsString()
  password: string;
}

export class AdminLoginDto {
  @ApiProperty({ example: "admin@savasaachi.local" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "Admin@12345" })
  @IsString()
  password: string;
}

export class UpdateCustomerDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(240)
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string;

  @ApiPropertyOptional({ minLength: 6 })
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(80)
  password?: string;
}

export class OrderItemDto {
  @ApiProperty({ example: "SS5110107" })
  @IsString()
  code: string;

  @ApiProperty({ minimum: 1, maximum: 20 })
  @IsInt()
  @Min(1)
  @Max(20)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty()
  @IsString()
  @MaxLength(80)
  firstName: string;

  @ApiProperty()
  @IsString()
  @MaxLength(80)
  lastName: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MaxLength(300)
  address: string;

  @ApiProperty()
  @IsString()
  @MaxLength(80)
  city: string;

  @ApiProperty({ enum: ["inside", "outside"] })
  @IsIn(["inside", "outside"])
  location: "inside" | "outside";

  @ApiProperty({ enum: ["digital", "cod"] })
  @IsIn(["digital", "cod"])
  payment: "digital" | "cod";
}

export class MessageDto {
  @ApiProperty()
  @IsString()
  @MaxLength(80)
  firstName: string;

  @ApiProperty()
  @IsString()
  @MaxLength(80)
  lastName: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  @MaxLength(4000)
  message: string;
}

export class SpecDto {
  @ApiProperty()
  @IsString()
  @MaxLength(80)
  title: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100000)
  html: string;
}

export class ProductWriteDto {
  @ApiProperty()
  @IsString()
  @MaxLength(40)
  code: string;

  @ApiProperty()
  @IsString()
  @MaxLength(180)
  slug: string;

  @ApiProperty()
  @IsString()
  @MaxLength(180)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  brand?: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  price: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  discount: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(20)
  colors: number;

  @ApiProperty()
  @IsBoolean()
  inStock: boolean;

  @ApiProperty()
  @IsString()
  @MaxLength(200000)
  description: string;

  @ApiProperty()
  @IsString()
  @MaxLength(200000)
  details: string;

  @ApiProperty({ type: [SpecDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpecDto)
  specifications: SpecDto[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  images: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  roomIds: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  subCategoryIds: string[];
}

export class SubWriteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(80)
  slug: string;

  @ApiProperty()
  @IsString()
  @MaxLength(80)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty()
  @IsInt()
  sortOrder: number;
}

export class RoomWriteDto {
  @ApiProperty()
  @IsString()
  @MaxLength(80)
  slug: string;

  @ApiProperty()
  @IsString()
  @MaxLength(80)
  title: string;

  @ApiProperty()
  @IsString()
  @MaxLength(500)
  description: string;

  @ApiProperty()
  @IsString()
  image: string;

  @ApiProperty()
  @IsInt()
  sortOrder: number;

  @ApiProperty()
  @IsInt()
  navOrder: number;

  @ApiProperty()
  @IsBoolean()
  showOnHome: boolean;

  @ApiProperty({ type: [SubWriteDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubWriteDto)
  children: SubWriteDto[];
}

export class StoreWriteDto {
  @ApiProperty()
  @IsString()
  @MaxLength(80)
  slug: string;

  @ApiProperty()
  @IsString()
  @MaxLength(160)
  title: string;

  @ApiProperty()
  @IsString()
  @MaxLength(80)
  type: string;

  @ApiProperty()
  @IsString()
  @MaxLength(80)
  region: string;

  @ApiProperty()
  @IsString()
  @MaxLength(400)
  address: string;

  @ApiProperty()
  @IsString()
  @MaxLength(80)
  contact: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  hours: string[];

  @ApiProperty()
  @IsString()
  mapUrl: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  lat?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  lng?: number | null;

  @ApiProperty()
  @IsString()
  image: string;

  @ApiProperty()
  @IsInt()
  sortOrder: number;

  @ApiProperty()
  @IsBoolean()
  active: boolean;
}

export class PageWriteDto {
  @ApiProperty()
  @IsString()
  @MaxLength(80)
  slug: string;

  @ApiProperty()
  @IsString()
  @MaxLength(160)
  title: string;

  @ApiProperty()
  @IsString()
  @MaxLength(500000)
  html: string;

  @ApiProperty()
  @IsBoolean()
  published: boolean;
}

export class FooterLinkDto {
  @ApiProperty()
  @IsString()
  label: string;

  @ApiProperty()
  @IsString()
  href: string;
}

export class FooterColumnDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ type: [FooterLinkDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FooterLinkDto)
  links: FooterLinkDto[];
}

export class SettingsWriteDto {
  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsString()
  phoneHref: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  hours: string;

  @ApiProperty()
  @IsString()
  facebook: string;

  @ApiProperty()
  @IsString()
  instagram: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  insideDhaka: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  outsideDhaka: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  @Max(100)
  advancePercent: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  @Max(100)
  digitalPaymentDiscountPercent: number;

  @ApiProperty()
  @IsString()
  @MaxLength(180)
  promoBanner: string;

  @ApiProperty({ type: [FooterColumnDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FooterColumnDto)
  footerColumns: FooterColumnDto[];
}

export class HomeItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  href?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productCode?: string;

  @ApiProperty()
  @IsInt()
  sortOrder: number;
}

export class HomeBlockDto {
  @ApiProperty({ enum: ["tiles", "products"] })
  @IsIn(["tiles", "products"])
  kind: "tiles" | "products";

  @ApiProperty()
  @IsString()
  slug: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsInt()
  sortOrder: number;

  @ApiProperty({ type: [HomeItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HomeItemDto)
  items: HomeItemDto[];
}

export class HomeWriteDto {
  @ApiProperty()
  @IsString()
  heroDesktop: string;

  @ApiProperty()
  @IsString()
  heroMobile: string;

  @ApiProperty()
  @IsString()
  heroHref: string;

  @ApiProperty({ type: [HomeBlockDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HomeBlockDto)
  blocks: HomeBlockDto[];
}

export class OrderStatusDto {
  @ApiProperty({ enum: ["received", "confirmed", "processing", "delivered", "cancelled"] })
  @IsIn(["received", "confirmed", "processing", "delivered", "cancelled"])
  status: "received" | "confirmed" | "processing" | "delivered" | "cancelled";

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}

export class ReadMessageDto {
  @ApiProperty()
  @IsBoolean()
  read: boolean;
}

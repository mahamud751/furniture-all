import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { AuthService } from "./auth.service";
import { CatalogService } from "./catalog.service";
import { CommerceService } from "./commerce.service";
import { PrismaService } from "./prisma.service";
import { PublicController } from "./public.controller";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>("JWT_SECRET"),
      }),
    }),
  ],
  controllers: [PublicController, AdminController],
  providers: [PrismaService, AuthService, CatalogService, CommerceService, AdminService],
})
export class AppModule {}

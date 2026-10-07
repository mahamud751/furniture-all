import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  app.enableCors({
    origin: [
      process.env.WEB_ORIGIN ?? "http://localhost:3000",
      process.env.ADMIN_ORIGIN ?? "http://localhost:3001",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
    ],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  const config = new DocumentBuilder()
    .setTitle("Basha Furniture API")
    .setDescription(
      "Local catalogue, orders, customers, content, and admin management for the furniture store. Prices and delivery totals are calculated by the API.",
    )
    .setVersion("1.0")
    .addBearerAuth({ type: "http", scheme: "bearer", bearerFormat: "JWT", description: "Admin or customer access token" }, "JWT")
    .build();
  SwaggerModule.setup("api/docs", app, SwaggerModule.createDocument(app, config), {
    swaggerOptions: { persistAuthorization: true },
  });
  const port = process.env.PORT ?? 3004;
  await app.listen(port);
  console.log(`API http://localhost:${port}/api`);
  console.log(`Swagger http://localhost:${port}/api/docs`);
}

void bootstrap();

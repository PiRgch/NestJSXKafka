import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  // Create HTTP application
  const app = await NestFactory.create(AppModule);

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);

  console.log(
    `🚀 HTTP Server running on: http://localhost:${process.env.PORT ?? 3000}`,
  );
  console.log(`📚 Architecture: Hexagonal DDD with Event-Driven Architecture`);
  console.log(`📋 Available endpoints:`);
  console.log(`   POST /orders - Create a new order`);
  console.log(`   GET  /orders/:id - Get an order by ID`);
}

void bootstrap();

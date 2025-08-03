import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { OrderModule } from './order/order.module';
import { kafkaConfig } from './order/infrastructure/kafka/kafka.config';

async function bootstrap() {
  // For production with Kafka, use OrderModule instead of OrderDevModule
  const AppModuleWithKafka = class {
    static imports = [OrderModule]; // Use full Kafka module
    static controllers = [];
    static providers = [];
  };

  // Create HTTP application
  const app = await NestFactory.create(AppModuleWithKafka);
  
  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Connect microservice for Kafka
  const microservice = app.connectMicroservice<MicroserviceOptions>(kafkaConfig);
  
  // Start both HTTP server and microservice
  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000);
  
  console.log(`🚀 HTTP Server running on: http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`📨 Kafka microservice connected`);
  console.log(`📚 Architecture: Hexagonal DDD with Kafka Event-Driven Architecture`);
  console.log(`📋 Available endpoints:`);
  console.log(`   POST /orders - Create a new order`);
  console.log(`   GET  /orders/:id - Get an order by ID`);
  console.log(`🔊 Kafka topics:`);
  console.log(`   - order.events`);
  console.log(`   - order.created`);
}

bootstrap();
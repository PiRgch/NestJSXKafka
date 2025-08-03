import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrderDevModule } from './order/order-dev.module';

@Module({
  imports: [OrderDevModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

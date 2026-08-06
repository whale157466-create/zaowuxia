import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { CartItem } from '../cart/cart.entity';
import { Product } from '../product/product.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, CartItem, Product])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}

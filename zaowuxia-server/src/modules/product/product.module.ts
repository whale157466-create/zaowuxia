import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Shop } from '../shop/shop.entity';
import { ShopModule } from '../shop/shop.module';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Shop]), ShopModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}

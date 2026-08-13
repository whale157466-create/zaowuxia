import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tutorial } from './tutorial.entity';
import { Product } from '../product/product.entity';
import { Shop } from '../shop/shop.entity';
import { ProductModule } from '../product/product.module';
import { ShopModule } from '../shop/shop.module';
import { TutorialController } from './tutorial.controller';
import { TutorialService } from './tutorial.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tutorial, Product, Shop]), ProductModule, ShopModule],
  controllers: [TutorialController],
  providers: [TutorialService],
})
export class TutorialModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { ProductModule } from './modules/product/product.module';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';

@Module({
  imports: [
    // SQLite — 零配置，数据库文件自动生成在项目根目录
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'zaowuxia.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // 开发环境自动建表，生产要关掉
    }),
    AuthModule,
    ProductModule,
    CartModule,
    OrderModule,
  ],
})
export class AppModule {}

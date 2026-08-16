import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { ProductModule } from './modules/product/product.module';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';
import { AddressModule } from './modules/address/address.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { AfterSalesModule } from './modules/afterSales/after-sales.module';
import { ShopModule } from './modules/shop/shop.module';
import { TutorialModule } from './modules/tutorial/tutorial.module';
import { FavoriteModule } from './modules/favorite/favorite.module';
import { HistoryModule } from './modules/history/history.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    // MySQL — 连接信息从 .env 读取（synchronize 仅开发环境自动建表，生产必须关掉）
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'zaowuxia',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      charset: 'utf8mb4', // 支持中文与 emoji
      extra: { decimalNumbers: true }, // DECIMAL 返回 number（默认 string，前端 .toFixed() 会报错）
    }),
    AuthModule,
    ProductModule,
    CartModule,
    OrderModule,
    AddressModule,
    CouponModule,
    AfterSalesModule,
    ShopModule,
    TutorialModule,
    FavoriteModule,
    HistoryModule,
    UserModule,
  ],
})
export class AppModule {}

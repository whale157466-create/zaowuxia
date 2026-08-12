import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AfterSales } from './after-sales.entity';
import { Order } from '../order/order.entity';
import { AfterSalesController } from './after-sales.controller';
import { AfterSalesService } from './after-sales.service';

@Module({
  imports: [TypeOrmModule.forFeature([AfterSales, Order])],
  controllers: [AfterSalesController],
  providers: [AfterSalesService],
})
export class AfterSalesModule {}

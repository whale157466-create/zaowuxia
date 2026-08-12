import { Controller, Get, Query } from '@nestjs/common';
import { CouponService } from './coupon.service';

@Controller('coupons')
export class CouponController {
  constructor(private readonly service: CouponService) {}

  @Get()
  async findAll(@Query('amount') amount?: string) {
    const amt = amount ? Number(amount) : undefined;
    return { code: 0, message: 'ok', data: await this.service.findAll(amt) };
  }
}

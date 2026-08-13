import { Controller, Get, Param } from '@nestjs/common';
import { ShopService } from './shop.service';

@Controller('shops')
export class ShopController {
  constructor(private readonly service: ShopService) {}

  @Get()
  async findAll() {
    return { code: 0, message: 'ok', data: await this.service.findAll() };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const shop = await this.service.findOne(id);
    if (!shop) return { code: 404, message: '店铺不存在', data: null };
    return { code: 0, message: 'ok', data: shop };
  }
}

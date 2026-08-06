import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { CartService } from './cart.service';

@Controller()
export class CartController {
  constructor(private readonly service: CartService) {}

  @Get('cart')
  async findAll() { return { code: 0, message: 'ok', data: await this.service.findAll() }; }

  @Post('cart')
  async add(@Body() body: { skuId: string; quantity: number }) {
    await this.service.add(body.skuId, body.quantity);
    return { code: 0, message: 'ok', data: await this.service.findAll() };
  }

  @Post('cart/batch')
  async batchAdd(@Body() body: { items: { skuId: string; quantity: number }[] }) {
    await this.service.batchAdd(body.items);
    return { code: 0, message: 'ok', data: await this.service.findAll() };
  }

  @Put('cart/:id')
  async update(@Param('id') id: string, @Body() body: any) {
    await this.service.update(id, body);
    return { code: 0, message: 'ok', data: null };
  }

  @Delete('cart/:id')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { code: 0, message: 'ok', data: null };
  }
}

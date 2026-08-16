import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { FavoriteService } from './favorite.service';

@Controller('favorites')
export class FavoriteController {
  constructor(private readonly service: FavoriteService) {}

  @Get()
  async findAll() {
    return { code: 0, message: 'ok', data: await this.service.findAll() };
  }

  @Post()
  async add(@Body('productId') productId: string) {
    return { code: 0, message: 'ok', data: await this.service.add(productId) };
  }

  @Delete(':productId')
  async remove(@Param('productId') productId: string) {
    await this.service.remove(productId);
    return { code: 0, message: 'ok', data: null };
  }
}

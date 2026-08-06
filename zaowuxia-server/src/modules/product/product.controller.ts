import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller()
export class ProductController {
  constructor(private readonly service: ProductService) {}

  @Get('categories')
  async getCategories() {
    return { code: 0, message: 'ok', data: await this.service.findCategories() };
  }

  @Get('products')
  async getProducts(@Query() query: any) {
    return { code: 0, message: 'ok', data: await this.service.findAll(query) };
  }

  @Get('products/:id')
  async getProduct(@Param('id') id: string) {
    const p = await this.service.findOne(id);
    if (!p) return { code: 404, message: '商品不存在', data: null };
    return { code: 0, message: 'ok', data: p };
  }

  @Get('products/:id/kit')
  async getKit(@Param('id') id: string) {
    return { code: 0, message: 'ok', data: await this.service.findKitItems(id) };
  }
}

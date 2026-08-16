import { Controller, Get, Post, Put, Delete, Param, Query, Body } from '@nestjs/common';
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

  // ===== 管理端商品 =====

  @Get('admin/products')
  async adminGetProducts(@Query() query: any) {
    return { code: 0, message: 'ok', data: await this.service.adminFindAll(query) };
  }

  @Post('admin/products')
  async adminCreateProduct(@Body() body: any) {
    return { code: 0, message: 'ok', data: await this.service.adminCreate(body) };
  }

  @Put('admin/products/:id')
  async adminUpdateProduct(@Param('id') id: string, @Body() body: any) {
    return { code: 0, message: 'ok', data: await this.service.adminUpdate(id, body) };
  }

  @Post('admin/products/batch')
  async adminBatchUpdateProducts(@Body() body: any) {
    await this.service.adminBatchUpdate(body.ids, body.action);
    return { code: 0, message: 'ok', data: null };
  }

  @Delete('admin/products/:id')
  async adminRemoveProduct(@Param('id') id: string) {
    await this.service.adminRemove(id);
    return { code: 0, message: 'ok', data: null };
  }
}

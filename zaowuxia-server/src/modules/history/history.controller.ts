import { Controller, Get, Post, Delete, Body } from '@nestjs/common';
import { HistoryService } from './history.service';

@Controller('history')
export class HistoryController {
  constructor(private readonly service: HistoryService) {}

  @Get()
  async findAll() {
    return { code: 0, message: 'ok', data: await this.service.findAll() };
  }

  @Post()
  async record(@Body('productId') productId: string) {
    return { code: 0, message: 'ok', data: await this.service.record(productId) };
  }

  @Delete()
  async clear() {
    await this.service.clear();
    return { code: 0, message: 'ok', data: null };
  }
}

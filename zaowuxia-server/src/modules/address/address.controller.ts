import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { AddressService } from './address.service';

@Controller('addresses')
export class AddressController {
  constructor(private readonly service: AddressService) {}

  @Get()
  async findAll() {
    return { code: 0, message: 'ok', data: await this.service.findAll() };
  }

  @Post()
  async create(@Body() body: any) {
    return { code: 0, message: 'ok', data: await this.service.create(body) };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return { code: 0, message: 'ok', data: await this.service.update(id, body) };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { code: 0, message: 'ok', data: null };
  }
}

import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { AfterSalesService } from './after-sales.service';

@Controller()
export class AfterSalesController {
  constructor(private readonly service: AfterSalesService) {}

  /** 用户提交售后 */
  @Post('after-sales')
  async submit(@Body() body: any) {
    return { code: 0, message: '售后申请已提交', data: await this.service.submit(body) };
  }

  /** 用户查询售后列表 */
  @Get('after-sales')
  async findAll(@Query('orderId') orderId?: string) {
    return { code: 0, message: 'ok', data: await this.service.findAll(orderId) };
  }

  /** 管理端：审核售后 */
  @Post('admin/after-sales/:id/review')
  async review(@Param('id') id: string, @Body() body: { approved: boolean; reason?: string }) {
    await this.service.review(id, body.approved, body.reason);
    return { code: 0, message: body.approved ? '已通过' : '已拒绝', data: null };
  }
}

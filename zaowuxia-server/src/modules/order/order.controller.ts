import { Controller, Get, Post, Put, Param, Query, Body } from '@nestjs/common';
import { OrderService } from './order.service';

@Controller()
export class OrderController {
  constructor(private readonly service: OrderService) {}

  @Post('orders')
  async submit(@Body() body: any) {
    return { code: 0, message: 'ok', data: await this.service.submit(body) };
  }

  @Get('orders')
  async findAll(@Query('status') status?: string) {
    return { code: 0, message: 'ok', data: await this.service.findAll(status) };
  }

  @Get('orders/:id')
  async findOne(@Param('id') id: string) {
    const order = await this.service.findOne(id);
    if (!order) return { code: 404, message: '订单不存在', data: null };
    return { code: 0, message: 'ok', data: order };
  }

  @Put('orders/:id/cancel')
  async cancel(@Param('id') id: string) {
    await this.service.cancel(id);
    return { code: 0, message: 'ok', data: null };
  }

  /** 发起支付——返回二维码链接 */
  @Post('orders/:id/pay')
  async pay(@Param('id') id: string) {
    return { code: 0, message: 'ok', data: { qrCodeUrl: `https://picsum.photos/seed/qr/300/300` } };
  }

  /** 确认支付——模拟付款成功后更新订单状态 */
  @Post('orders/:id/pay/confirm')
  async confirmPay(@Param('id') id: string) {
    const order = await this.service.findOne(id);
    if (!order) return { code: 404, message: '订单不存在', data: null };
    if (order.status !== 'pending_payment') return { code: 400, message: '订单状态不允许支付', data: null };
    order.status = 'pending_ship';
    await this.service.save(order);
    return { code: 0, message: '支付成功', data: null };
  }

  /** 确认收货 */
  @Put('orders/:id/receive')
  async confirmReceive(@Param('id') id: string) {
    await this.service.confirmReceive(id);
    return { code: 0, message: '已确认收货', data: null };
  }

  /* ==================== 管理端 ==================== */

  @Get('admin/orders')
  async adminFindAll(@Query() query: any) {
    return { code: 0, message: 'ok', data: await this.service.adminFindAll(query) };
  }

  @Get('admin/dashboard')
  async adminDashboard(@Query('range') range?: string) {
    return { code: 0, message: 'ok', data: await this.service.adminDashboard(range as any) };
  }

  @Post('admin/orders/:id/ship')
  async adminShip(@Param('id') id: string, @Body() body: { company: string; trackingNo: string }) {
    await this.service.adminShip(id, body.company, body.trackingNo);
    return { code: 0, message: '发货成功', data: null };
  }
}

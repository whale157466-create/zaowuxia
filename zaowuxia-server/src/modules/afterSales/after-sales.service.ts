import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AfterSales } from './after-sales.entity';
import { Order } from '../order/order.entity';

@Injectable()
export class AfterSalesService {
  private readonly DEMO_USER_ID = 'demo-user-001';

  constructor(
    @InjectRepository(AfterSales) private repo: Repository<AfterSales>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
  ) {}

  /** 用户提交售后申请 */
  async submit(body: {
    orderId: string; type: string; reason: string; images: string[];
  }) {
    const order = await this.orderRepo.findOne({
      where: { id: body.orderId, userId: this.DEMO_USER_ID },
    });
    if (!order) throw new BadRequestException('订单不存在');
    if (order.status !== 'completed') throw new BadRequestException('仅已完成订单可申请售后');

    // 检查是否已有售后记录
    const existing = await this.repo.findOne({ where: { orderId: body.orderId } });
    if (existing) throw new BadRequestException('该订单已有售后申请');

    const refundAmount = order.totalAmount; // 默认退全款
    return this.repo.save(
      this.repo.create({
        orderId: body.orderId,
        userId: this.DEMO_USER_ID,
        type: body.type,
        reason: body.reason,
        images: body.images || [],
        refundAmount,
        status: 'reviewing',
      }),
    );
  }

  /** 用户查询售后列表 */
  async findAll(orderId?: string): Promise<AfterSales[]> {
    const where: any = { userId: this.DEMO_USER_ID };
    if (orderId) where.orderId = orderId;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  /** 管理端：审核售后 */
  async review(id: string, approved: boolean, rejectReason?: string) {
    const record = await this.repo.findOne({ where: { id } });
    if (!record) throw new BadRequestException('售后申请不存在');
    if (record.status !== 'reviewing') throw new BadRequestException('该申请已审核过');

    record.status = approved ? 'approved' : 'rejected';
    if (!approved && rejectReason) record.rejectReason = rejectReason;
    return this.repo.save(record);
  }
}

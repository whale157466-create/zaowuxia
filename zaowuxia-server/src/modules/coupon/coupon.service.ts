import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Coupon } from './coupon.entity';

const SEED_COUPONS = [
  { name: '新人专享券', discount: 10, minAmount: 50, expireAt: '2026-12-31', used: false },
  { name: '满100减20', discount: 20, minAmount: 100, expireAt: '2026-12-31', used: false },
  { name: '满200减50', discount: 50, minAmount: 200, expireAt: '2026-09-01', used: false },
];

@Injectable()
export class CouponService implements OnModuleInit {
  private readonly DEMO_USER_ID = 'demo-user-001';

  constructor(@InjectRepository(Coupon) private repo: Repository<Coupon>) {}

  async onModuleInit() {
    const count = await this.repo.count();
    if (count === 0) {
      for (const d of SEED_COUPONS) {
        await this.repo.save(this.repo.create({ ...d, userId: this.DEMO_USER_ID }));
      }
      console.log(`✓ 播种 ${SEED_COUPONS.length} 张优惠券`);
    }
  }

  async findAll(amount?: number): Promise<Coupon[]> {
    const where: any = { userId: this.DEMO_USER_ID, used: false };
    // 筛选满足最低消费门槛的券
    const list = await this.repo.find({ where, order: { discount: 'DESC' } });
    if (amount !== undefined) {
      return list.filter(c => Number(c.minAmount) <= amount);
    }
    return list;
  }
}

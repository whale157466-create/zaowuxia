import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from './shop.entity';

const SEED_SHOPS = [
  { name: '黏土手作小铺', description: '专注于微缩黏土甜品制作，提供全套材料与教程', logo: 'https://picsum.photos/seed/shop1/200/200' },
  { name: '篆刻工艺坊', description: '传统篆刻工具与材料，让每一刀都有温度', logo: 'https://picsum.photos/seed/shop2/200/200' },
];

@Injectable()
export class ShopService implements OnModuleInit {
  private readonly DEMO_USER_ID = 'demo-user-001';

  constructor(@InjectRepository(Shop) private repo: Repository<Shop>) {}

  async onModuleInit() {
    const count = await this.repo.count();
    if (count === 0) {
      for (const d of SEED_SHOPS) {
        await this.repo.save(this.repo.create({ ...d, userId: this.DEMO_USER_ID }));
      }
      console.log(`✓ 播种 ${SEED_SHOPS.length} 家店铺`);
    }
  }

  async findAll() {
    return this.repo.find({ where: { status: 'on' }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async findByUser(userId: string) {
    return this.repo.findOne({ where: { userId, status: 'on' } });
  }
}

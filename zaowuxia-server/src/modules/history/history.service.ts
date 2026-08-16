import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { History } from './history.entity';
import { Product } from '../product/product.entity';

@Injectable()
export class HistoryService {
  private readonly DEMO_USER_ID = 'demo-user-001';

  constructor(
    @InjectRepository(History) private repo: Repository<History>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
  ) {}

  async findAll() {
    return this.repo.find({ where: { userId: this.DEMO_USER_ID }, order: { createdAt: 'DESC' }, take: 50 });
  }

  async record(productId: string) {
    const p = await this.productRepo.findOne({ where: { id: productId } });
    if (!p) throw new BadRequestException('商品不存在');
    // 同一商品去重：删除旧记录再插入，保证最近浏览排在最前
    await this.repo.delete({ userId: this.DEMO_USER_ID, productId });
    return this.repo.save(this.repo.create({
      userId: this.DEMO_USER_ID, productId: p.id, productName: p.name,
      price: p.skus[0]?.price || 0, image: p.images[0] || '',
    }));
  }

  async clear() {
    await this.repo.delete({ userId: this.DEMO_USER_ID });
  }
}

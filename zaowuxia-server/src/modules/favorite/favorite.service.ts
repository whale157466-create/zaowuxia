import { Injectable, OnApplicationBootstrap, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './favorite.entity';
import { Product } from '../product/product.entity';

@Injectable()
export class FavoriteService implements OnApplicationBootstrap {
  private readonly DEMO_USER_ID = 'demo-user-001';

  constructor(
    @InjectRepository(Favorite) private repo: Repository<Favorite>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
  ) {}

  // 用 OnApplicationBootstrap 确保商品已先播种，收藏能正确关联
  async onApplicationBootstrap() {
    const count = await this.repo.count();
    if (count === 0) {
      const products = await this.productRepo.find({ take: 3 });
      for (const p of products) {
        await this.repo.save(this.repo.create({
          userId: this.DEMO_USER_ID, productId: p.id, productName: p.name,
          categoryName: p.categoryName, difficulty: p.difficulty,
          price: p.skus[0]?.price || 0, image: p.images[0] || '', status: p.status,
        }));
      }
      console.log(`✓ 播种 ${products.length} 条收藏`);
    }
  }

  async findAll() {
    return this.repo.find({ where: { userId: this.DEMO_USER_ID }, order: { createdAt: 'DESC' } });
  }

  async add(productId: string) {
    const exist = await this.repo.findOne({ where: { userId: this.DEMO_USER_ID, productId } });
    if (exist) return exist;
    const p = await this.productRepo.findOne({ where: { id: productId } });
    if (!p) throw new BadRequestException('商品不存在');
    return this.repo.save(this.repo.create({
      userId: this.DEMO_USER_ID, productId: p.id, productName: p.name,
      categoryName: p.categoryName, difficulty: p.difficulty,
      price: p.skus[0]?.price || 0, image: p.images[0] || '', status: p.status,
    }));
  }

  async remove(productId: string) {
    await this.repo.delete({ userId: this.DEMO_USER_ID, productId });
  }
}

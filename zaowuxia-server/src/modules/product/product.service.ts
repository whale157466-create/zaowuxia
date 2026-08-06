import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Product } from './product.entity';

const SEED_DATA = [
  { name: '微缩蛋糕·草莓奶油杯', categoryId: 'c1', categoryName: '微缩蛋糕', difficulty: 'beginner', images: ['https://picsum.photos/seed/p1/400/400'], description: '<h3>材料清单</h3><ul><li>超轻粘土 x3色</li><li>树脂杯托 x1</li></ul>', skus: [{ id: 's1a', name: '基础套装', price: 39.9, stock: 50 }, { id: 's1b', name: '豪华套装', price: 69.9, stock: 20 }], status: 'on' },
  { name: '篆刻入门·姓氏印章', categoryId: 'c2', categoryName: '篆刻入门', difficulty: 'intermediate', images: ['https://picsum.photos/seed/p2/400/400'], description: '<h3>材料清单</h3><ul><li>寿山石章料 x1</li><li>篆刻刀 x1</li></ul>', skus: [{ id: 's2a', name: '标准套装', price: 89.0, stock: 30 }], status: 'on' },
  { name: '热缩片耳环·星空系列', categoryId: 'c3', categoryName: '热缩片耳环', difficulty: 'beginner', images: ['https://picsum.photos/seed/p3/400/400'], description: '<h3>材料清单</h3><ul><li>热缩片 x5张</li><li>耳钩配件 x2对</li></ul>', skus: [{ id: 's3a', name: '单色套装', price: 29.9, stock: 0 }, { id: 's3b', name: '混色套装', price: 49.9, stock: 40 }], status: 'on' },
  { name: '微缩蛋糕·马卡龙塔', categoryId: 'c1', categoryName: '微缩蛋糕', difficulty: 'advanced', images: ['https://picsum.photos/seed/p4/400/400'], description: '高级手工项目', skus: [{ id: 's4a', name: '单层塔套装', price: 99.0, stock: 15 }], status: 'off' },
  { name: '超轻粘土补充装', categoryId: 'c1', categoryName: '微缩蛋糕', difficulty: 'beginner', images: ['https://picsum.photos/seed/p5/400/400'], description: '手工必备材料', skus: [{ id: 's5a', name: '3色装', price: 15.0, stock: 100 }], status: 'on' },
  { name: '塑形工具套装', categoryId: 'c1', categoryName: '微缩蛋糕', difficulty: 'beginner', images: ['https://picsum.photos/seed/p6/400/400'], description: '专业塑形工具五件套', skus: [{ id: 's6a', name: '5件套', price: 25.0, stock: 40 }], status: 'on' },
];

@Injectable()
export class ProductService implements OnModuleInit {
  constructor(@InjectRepository(Product) private repo: Repository<Product>) {}

  async onModuleInit() {
    const count = await this.repo.count();
    if (count === 0) {
      for (const d of SEED_DATA) { await this.repo.save(this.repo.create(d)); }
      console.log(`✓ 播种 ${SEED_DATA.length} 件商品`);
    }
  }

  async findAll(q: { keyword?: string; categoryId?: string; difficulty?: string; sort?: string; page?: number; pageSize?: number }) {
    const where: FindOptionsWhere<Product> = { status: 'on' };
    if (q.keyword) where.name = Like(`%${q.keyword}%`);
    if (q.categoryId) where.categoryId = q.categoryId;
    if (q.difficulty) where.difficulty = q.difficulty;
    const [list, total] = await this.repo.findAndCount({ where, order: { createdAt: 'DESC' } as any, skip: ((q.page || 1) - 1) * (q.pageSize || 10), take: q.pageSize || 10 });
    if (q.sort === 'price_asc') list.sort((a, b) => (a.skus[0]?.price || 0) - (b.skus[0]?.price || 0));
    if (q.sort === 'price_desc') list.sort((a, b) => (b.skus[0]?.price || 0) - (a.skus[0]?.price || 0));
    return { list, total, page: q.page || 1, pageSize: q.pageSize || 10 };
  }

  async findOne(id: string) { return this.repo.findOne({ where: { id } }); }

  async findCategories() {
    const products = await this.repo.find({ where: { status: 'on' }, select: ['categoryId', 'categoryName'] as any });
    const map = new Map<string, string>();
    const icons = ['🍰', '🔖', '💎', '🧵', '✂️'];
    let i = 0;
    products.forEach(p => { if (!map.has(p.categoryId)) map.set(p.categoryId, p.categoryName); });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name, icon: icons[i++ % icons.length] }));
  }

  async findKitItems(productId: string) {
    const product = await this.repo.findOne({ where: { id: productId } });
    if (!product) return [];
    const related = await this.repo.find({ where: { categoryId: product.categoryId, status: 'on' }, take: 5 });
    return related.filter(p => p.id !== productId).map(p => ({
      productId: p.id, productName: p.name, skuId: p.skus[0]?.id, skuName: p.skus[0]?.name || '',
      price: p.skus[0]?.price || 0, stock: p.skus[0]?.stock || 0, quantity: 1, type: 'material' as const, checked: true,
    }));
  }
}

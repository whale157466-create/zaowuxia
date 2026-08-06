import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './cart.entity';
import { Product } from '../product/product.entity';

@Injectable()
export class CartService {
  // 演示用固定用户ID（实际项目从 JWT 中取当前用户）
  private readonly DEMO_USER_ID = 'demo-user-001';

  constructor(
    @InjectRepository(CartItem) private cartRepo: Repository<CartItem>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
  ) {}

  async findAll(): Promise<CartItem[]> {
    const items = await this.cartRepo.find({ where: { userId: this.DEMO_USER_ID }, order: { createdAt: 'DESC' } });
    return items.map(item => ({
      ...item,
      invalid: item.stock === 0, // 售罄标记
    })) as any;
  }

  async add(skuId: string, quantity: number) {
    // 根据 skuId 查商品
    const product = await this.productRepo.findOne({
      where: { status: 'on' },
    });
    // 简化处理：遍历所有商品找到包含此 sku 的
    const allProducts = await this.productRepo.find({ where: { status: 'on' } });
    let found: Product | null = null;
    let foundSku: any = null;
    for (const p of allProducts) {
      foundSku = p.skus.find(s => s.id === skuId);
      if (foundSku) { found = p; break; }
    }
    if (!found || !foundSku) throw new BadRequestException('商品不存在或已下架');
    if (foundSku.stock < quantity) throw new BadRequestException('库存不足');

    // 检查购物车是否已有同 SKU，有则合并
    const existing = await this.cartRepo.findOne({
      where: { userId: this.DEMO_USER_ID, skuId },
    });
    if (existing) {
      existing.quantity += quantity;
      if (existing.quantity > foundSku.stock) throw new BadRequestException('超出库存上限');
      return this.cartRepo.save(existing);
    }

    return this.cartRepo.save(
      this.cartRepo.create({
        userId: this.DEMO_USER_ID, productId: found.id,
        productName: found.name, productImage: found.images[0],
        skuId: foundSku.id, skuName: foundSku.name,
        price: foundSku.price, quantity, stock: foundSku.stock,
        checked: true,
      }),
    );
  }

  async update(id: string, body: Partial<CartItem>) {
    const item = await this.cartRepo.findOne({ where: { id, userId: this.DEMO_USER_ID } });
    if (!item) throw new BadRequestException('购物车商品不存在');
    if (body.quantity !== undefined && body.quantity > item.stock) throw new BadRequestException('超出库存上限');
    Object.assign(item, body);
    return this.cartRepo.save(item);
  }

  async remove(id: string) {
    await this.cartRepo.delete({ id, userId: this.DEMO_USER_ID });
  }

  async batchAdd(items: { skuId: string; quantity: number }[]) {
    for (const item of items) {
      await this.add(item.skuId, item.quantity);
    }
  }
}

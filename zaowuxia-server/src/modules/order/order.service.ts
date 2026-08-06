import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { CartItem } from '../cart/cart.entity';
import { Product } from '../product/product.entity';

@Injectable()
export class OrderService {
  private readonly DEMO_USER_ID = 'demo-user-001';

  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(CartItem) private cartRepo: Repository<CartItem>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
  ) {}

  async submit(body: {
    items: { skuId: string; quantity: number }[];
    addressId: string;
    couponId?: string;
    remark?: string;
  }) {
    // 1. 校验库存并计算金额
    let productAmount = 0;
    const orderItems: any[] = [];
    const allProducts = await this.productRepo.find({ where: { status: 'on' } });

    for (const item of body.items) {
      let foundProduct: Product | null = null;
      let foundSku: any = null;
      for (const p of allProducts) {
        foundSku = p.skus.find(s => s.id === item.skuId);
        if (foundSku) { foundProduct = p; break; }
      }
      if (!foundProduct || !foundSku) throw new BadRequestException(`商品 ${item.skuId} 不存在或已下架`);
      if (foundSku.stock < item.quantity) throw new BadRequestException(`${foundProduct.name} 库存不足`);

      productAmount += foundSku.price * item.quantity;
      orderItems.push({
        productId: foundProduct.id, productName: foundProduct.name,
        productImage: foundProduct.images[0],
        skuId: foundSku.id, skuName: foundSku.name,
        price: foundSku.price, quantity: item.quantity,
      });

      // 扣减库存
      foundSku.stock -= item.quantity;
      await this.productRepo.save(foundProduct);
    }

    // 2. 计算金额（后端统一算，前端不可信）
    const discountAmount = 0; // 优惠券逻辑后续做
    const freight = productAmount >= 99 ? 0 : 8;
    const totalAmount = productAmount - discountAmount + freight;

    // 3. 生成订单号
    const orderNo = 'Z' + Date.now();

    // 4. 默认地址（简化，实际从地址表取）
    const address = {
      recipient: '演示用户', phone: '13800138000',
      province: '广东省', city: '深圳市', district: '南山区', detail: '科技园路1号',
    };

    // 5. 保存订单
    const order = await this.orderRepo.save(
      this.orderRepo.create({
        orderNo, userId: this.DEMO_USER_ID,
        items: orderItems, address,
        productAmount, discountAmount, freight, totalAmount,
        status: 'pending_payment', remark: body.remark,
        couponId: body.couponId,
        expireAt: new Date(Date.now() + 30 * 60 * 1000), // 30分钟过期
      }),
    );

    // 6. 清空购物车中已下单的商品
    const skuIds = body.items.map(i => i.skuId);
    await this.cartRepo
      .createQueryBuilder()
      .delete()
      .where('userId = :uid', { uid: this.DEMO_USER_ID })
      .andWhere('skuId IN (:...skuIds)', { skuIds })
      .execute();

    return { orderId: order.id, orderNo: order.orderNo, totalAmount: order.totalAmount };
  }

  async findAll(status?: string) {
    const where: any = { userId: this.DEMO_USER_ID };
    if (status && status !== 'after_sales') where.status = status;
    return this.orderRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    return this.orderRepo.findOne({ where: { id } });
  }

  async save(order: Order) {
    return this.orderRepo.save(order);
  }

  async cancel(id: string) {
    const order = await this.orderRepo.findOne({ where: { id, userId: this.DEMO_USER_ID } });
    if (!order) throw new BadRequestException('订单不存在');
    if (order.status !== 'pending_payment') throw new BadRequestException('仅待付款订单可取消');
    order.status = 'cancelled';
    return this.orderRepo.save(order);
  }
}

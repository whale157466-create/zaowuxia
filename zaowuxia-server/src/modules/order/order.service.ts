import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { CartItem } from '../cart/cart.entity';
import { Product } from '../product/product.entity';
import { User } from '../user/user.entity';

@Injectable()
export class OrderService {
  private readonly DEMO_USER_ID = 'demo-user-001';

  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(CartItem) private cartRepo: Repository<CartItem>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(User) private userRepo: Repository<User>,
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

  /** 用户确认收货 */
  async confirmReceive(id: string) {
    const order = await this.orderRepo.findOne({ where: { id, userId: this.DEMO_USER_ID } });
    if (!order) throw new BadRequestException('订单不存在');
    if (order.status !== 'pending_receive') throw new BadRequestException('仅待收货订单可确认收货');
    order.status = 'completed';
    // 模拟签收物流轨迹
    order.logistics = {
      ...(order.logistics || { company: '顺丰速运', trackingNo: 'SF' + Date.now() }),
      traces: [
        ...(order.logistics?.traces || [
          { time: new Date(Date.now() - 86400000).toISOString(), desc: '已揽件' },
          { time: new Date(Date.now() - 43200000).toISOString(), desc: '运输中' },
        ]),
        { time: new Date().toISOString(), desc: '已签收' },
      ],
    };
    return this.orderRepo.save(order);
  }

  /** 管理端：订单列表 */
  async adminFindAll(params: { status?: string; keyword?: string; page?: number; pageSize?: number }) {
    const where: any = {};
    if (params.status) where.status = params.status;
    const [list, total] = await this.orderRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: ((params.page || 1) - 1) * (params.pageSize || 10),
      take: params.pageSize || 10,
    });
    // 关键字搜索（订单号模糊匹配）
    let filtered = list;
    if (params.keyword) {
      filtered = list.filter(o => o.orderNo.includes(params.keyword));
    }
    return { list: filtered, total: params.keyword ? filtered.length : total, page: params.page || 1, pageSize: params.pageSize || 10 };
  }

  /** 管理端：发货 */
  async adminShip(id: string, company: string, trackingNo: string) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new BadRequestException('订单不存在');
    if (order.status !== 'pending_ship') throw new BadRequestException('仅待发货订单可发货');
    order.status = 'pending_receive';
    order.logistics = { company, trackingNo, traces: [{ time: new Date().toISOString(), desc: '已发货' }] };
    return this.orderRepo.save(order);
  }

  /** 管理端：数据看板 */
  async adminDashboard(range: 'today' | 'week' | 'month' = 'week') {
    const days = range === 'today' ? 1 : range === 'week' ? 7 : 30;
    const now = Date.now();
    const curStart = now - days * 86400000;
    const prevStart = now - 2 * days * 86400000;

    const [allOrders, productCount, userCount] = await Promise.all([
      this.orderRepo.find(),
      this.productRepo.count({ where: { status: 'on' } }),
      this.userRepo.count(),
    ]);

    const t = (o: Order) => new Date(o.createdAt).getTime();
    const sum = (list: Order[]) => list.filter(o => o.status !== 'cancelled').reduce((s, o) => s + Number(o.totalAmount || 0), 0);

    const curOrders = allOrders.filter(o => t(o) >= curStart);
    const prevOrders = allOrders.filter(o => t(o) >= prevStart && t(o) < curStart);
    const curCount = curOrders.length, prevCount = prevOrders.length;
    const curRevenue = sum(curOrders), prevRevenue = sum(prevOrders);
    const orderTrend = prevCount === 0 ? 0 : Math.round(((curCount - prevCount) / prevCount) * 100);
    const revenueTrend = prevRevenue === 0 ? 0 : Math.round(((curRevenue - prevRevenue) / prevRevenue) * 100);

    // 近7天趋势
    const trend: { date: string; count: number; amount: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const dayOrders = allOrders.filter(o => { const x = t(o); return x >= start && x < start + 86400000; });
      trend.push({
        date: `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        count: dayOrders.length,
        amount: sum(dayOrders),
      });
    }

    // 分类销售占比 + 热门商品
    const validOrders = allOrders.filter(o => o.status !== 'cancelled');
    const products = await this.productRepo.find();
    const catMap = new Map<string, { name: string; count: number; amount: number }>();
    const hotMap = new Map<string, { name: string; sales: number; amount: number }>();
    for (const o of validOrders) {
      for (const it of o.items || []) {
        const p = products.find(x => x.id === it.productId);
        const catId = p?.categoryId || 'other';
        if (!catMap.has(catId)) catMap.set(catId, { name: p?.categoryName || '其他', count: 0, amount: 0 });
        const c = catMap.get(catId)!;
        c.count += it.quantity || 1;
        c.amount += Number(it.price || 0) * (it.quantity || 1);

        if (!hotMap.has(it.productName)) hotMap.set(it.productName, { name: it.productName, sales: 0, amount: 0 });
        const h = hotMap.get(it.productName)!;
        h.sales += it.quantity || 1;
        h.amount += Number(it.price || 0) * (it.quantity || 1);
      }
    }
    const totalCatAmount = Array.from(catMap.values()).reduce((s, c) => s + c.amount, 0) || 1;
    const categorySales = Array.from(catMap.values())
      .map(c => ({ name: c.name, count: c.count, amount: Math.round(c.amount * 100) / 100, percent: Math.round((c.amount / totalCatAmount) * 100) }))
      .sort((a, b) => b.amount - a.amount);

    const recentOrders = [...allOrders]
      .sort((a, b) => t(b) - t(a))
      .slice(0, 5)
      .map(o => ({
        orderNo: o.orderNo,
        user: o.address?.recipient || '—',
        item: o.items?.[0]?.productName || '—',
        amount: Number(o.totalAmount || 0),
        status: o.status,
        time: o.createdAt ? `${String(new Date(o.createdAt).getHours()).padStart(2, '0')}:${String(new Date(o.createdAt).getMinutes()).padStart(2, '0')}` : '—',
      }));

    const hotProducts = Array.from(hotMap.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)
      .map((h, i) => ({ rank: i + 1, name: h.name, sales: h.sales, amount: Math.round(h.amount * 100) / 100 }));

    return {
      overview: {
        orders: curCount,
        revenue: Math.round(curRevenue * 100) / 100,
        users: userCount,
        products: productCount,
        orderTrend,
        revenueTrend,
      },
      trend,
      categorySales,
      recentOrders,
      hotProducts,
    };
  }
}

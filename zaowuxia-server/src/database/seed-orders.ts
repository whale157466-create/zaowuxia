/**
 * 种子订单脚本 — `npm run seed:orders` 填充演示订单，让管理端看板/订单列表有真实数据。
 * 注意：演示用途，重跑会清空订单表后重建（跨最近 7 天，含一笔「已取消」用于验证趋势排除逻辑）。
 * 商品按 SKU id 动态解析，避免硬编码 UUID 主键失效。
 */
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';
import { Order } from '../modules/order/order.entity';
import { Product } from '../modules/product/product.entity';

const DEMO_USER_ID = 'demo-user-001';

type OrderSpec = {
  orderNo: string;
  skuLines: { skuId: string; quantity: number }[];
  recipient: string;
  status: string;
  daysAgo: number; // 0=今天，1=昨天，…
};

const ORDERS: OrderSpec[] = [
  // 今天
  { orderNo: 'Z202608160001', skuLines: [{ skuId: 's1a', quantity: 1 }, { skuId: 's6a', quantity: 1 }], recipient: '手工爱好者', status: 'completed', daysAgo: 0 },
  { orderNo: 'Z202608160002', skuLines: [{ skuId: 's2a', quantity: 1 }, { skuId: 's5a', quantity: 2 }], recipient: '创意达人', status: 'pending_ship', daysAgo: 0 },
  { orderNo: 'Z202608160003', skuLines: [{ skuId: 's3b', quantity: 1 }], recipient: 'DIY小能手', status: 'pending_payment', daysAgo: 0 },
  { orderNo: 'Z202608160004', skuLines: [{ skuId: 's1b', quantity: 1 }], recipient: '手工爱好者', status: 'cancelled', daysAgo: 0 },
  // 昨天
  { orderNo: 'Z202608150005', skuLines: [{ skuId: 's2a', quantity: 1 }, { skuId: 's6a', quantity: 1 }], recipient: '创意达人', status: 'completed', daysAgo: 1 },
  { orderNo: 'Z202608150006', skuLines: [{ skuId: 's3b', quantity: 2 }], recipient: 'DIY小能手', status: 'pending_receive', daysAgo: 1 },
  // 2 天前
  { orderNo: 'Z202608140007', skuLines: [{ skuId: 's5a', quantity: 3 }], recipient: '手作星人', status: 'completed', daysAgo: 2 },
  { orderNo: 'Z202608140008', skuLines: [{ skuId: 's1a', quantity: 2 }], recipient: '手工爱好者', status: 'pending_ship', daysAgo: 2 },
  // 3 天前
  { orderNo: 'Z202608130009', skuLines: [{ skuId: 's2a', quantity: 1 }, { skuId: 's5a', quantity: 1 }], recipient: '创意达人', status: 'completed', daysAgo: 3 },
  // 4 天前
  { orderNo: 'Z202608120010', skuLines: [{ skuId: 's6a', quantity: 1 }, { skuId: 's5a', quantity: 1 }], recipient: '手作星人', status: 'completed', daysAgo: 4 },
  // 5 天前
  { orderNo: 'Z202608110011', skuLines: [{ skuId: 's1a', quantity: 1 }], recipient: 'DIY小能手', status: 'completed', daysAgo: 5 },
  // 6 天前
  { orderNo: 'Z202608100012', skuLines: [{ skuId: 's3b', quantity: 1 }], recipient: '手工爱好者', status: 'completed', daysAgo: 6 },
];

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const ds = app.get(DataSource);
  const orderRepo = ds.getRepository(Order);
  const productRepo = ds.getRepository(Product);

  // 建立 skuId → 商品信息 映射
  const products = await productRepo.find();
  const skuMap = new Map<string, { productId: string; productName: string; productImage: string; skuName: string; price: number }>();
  for (const p of products) {
    for (const s of p.skus) {
      skuMap.set(s.id, { productId: p.id, productName: p.name, productImage: p.images?.[0] || '', skuName: s.name, price: s.price });
    }
  }

  // 清空旧订单后重建（演示脚本）
  await orderRepo.clear();

  const saved: Order[] = [];
  for (const o of ORDERS) {
    const items: Order['items'] = [];
    let productAmount = 0;
    for (const line of o.skuLines) {
      const sku = skuMap.get(line.skuId);
      if (!sku) throw new Error(`SKU ${line.skuId} 不存在，请先运行 npm run seed 填充商品`);
      items.push({
        productId: sku.productId, productName: sku.productName, productImage: sku.productImage,
        skuId: line.skuId, skuName: sku.skuName, price: sku.price, quantity: line.quantity,
      });
      productAmount += sku.price * line.quantity;
    }
    const freight = productAmount >= 99 ? 0 : 8;
    const totalAmount = productAmount + freight;

    const order = orderRepo.create({
      orderNo: o.orderNo, userId: DEMO_USER_ID, items,
      address: { recipient: o.recipient, phone: '13800138000', province: '广东省', city: '深圳市', district: '南山区', detail: '科技园路1号' },
      productAmount, discountAmount: 0, freight, totalAmount, status: o.status,
    });
    saved.push(await orderRepo.save(order));
  }

  // 手动回填 createdAt 到最近 7 天（@CreateDateColumn 插入时会覆盖为当前时间）
  for (let i = 0; i < saved.length; i++) {
    const target = new Date(Date.now() - ORDERS[i].daysAgo * 86400000);
    await ds.query('UPDATE orders SET createdAt = ? WHERE id = ?', [target, saved[i].id]);
  }

  console.log(`种子订单填充完成：${saved.length} 笔订单（跨最近 7 天）`);
  await app.close();
}

seed().catch((e) => { console.error(e); process.exit(1); });

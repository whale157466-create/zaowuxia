/**
 * 种子数据脚本 — 首次连上 MySQL 后运行 `npm run seed` 填充演示数据。
 * 使用 DataSource（TypeORM 0.3+）替代已废弃的 getConnection。
 */
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { AppModule } from '../app.module';
import { User } from '../modules/user/user.entity';
import { Product } from '../modules/product/product.entity';
import { Shop } from '../modules/shop/shop.entity';
import { Tutorial } from '../modules/tutorial/tutorial.entity';
import { Coupon } from '../modules/coupon/coupon.entity';
import { Address } from '../modules/address/address.entity';
import { CartItem } from '../modules/cart/cart.entity';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const ds = app.get(DataSource);

  const productRepo = ds.getRepository(Product);
  if ((await productRepo.count()) > 0) {
    console.log('数据库已有数据，跳过种子填充（如需重置请清空数据库后重跑）');
    await app.close();
    return;
  }

  // 1. 用户（演示账号：admin / admin123、test / test123）
  const userRepo = ds.getRepository(User);
  await userRepo.save([
    userRepo.create({ id: 'user-admin', nickname: 'admin', email: 'admin', password: await bcrypt.hash('admin123', 10), role: 'admin' }),
    userRepo.create({ id: 'user-test', nickname: 'test', email: 'test', password: await bcrypt.hash('test123', 10), role: 'user' }),
    userRepo.create({ id: 'user-demo', nickname: '手工爱好者', openId: 'wx_openid_demo', password: '', role: 'user' }),
  ]);

  // 2. 店铺
  const shopRepo = ds.getRepository(Shop);
  await shopRepo.save([
    shopRepo.create({ id: 'shop1', userId: 'user-demo', name: '黏土手作小铺', description: '专注于微缩黏土甜品制作，提供全套材料与教程', logo: 'https://picsum.photos/seed/shop1/200/200', status: 'on' }),
    shopRepo.create({ id: 'shop2', userId: 'user-demo', name: '篆刻工艺坊', description: '传统篆刻工具与材料，让每一刀都有温度', logo: 'https://picsum.photos/seed/shop2/200/200', status: 'on' }),
  ]);

  // 3. 商品
  await productRepo.save([
    productRepo.create({
      id: 'p1', name: '微缩蛋糕·草莓奶油杯', categoryId: 'c1', categoryName: '微缩蛋糕', difficulty: 'beginner',
      images: ['https://picsum.photos/seed/p1/400/400'],
      description: '<h3>材料清单</h3><ul><li>超轻粘土 x3色</li><li>树脂杯托 x1</li></ul><h3>制作步骤</h3><p>1. 揉制粘土成型…</p><p>2. 分层组装到杯托…</p><p>3. 用亮光漆封层</p>',
      skus: [{ id: 's1a', name: '基础套装', price: 39.9, stock: 50 }, { id: 's1b', name: '豪华套装（含展示盒）', price: 69.9, stock: 20 }],
      shopId: 'shop1', status: 'on',
    }),
    productRepo.create({
      id: 'p2', name: '篆刻入门·姓氏印章', categoryId: 'c2', categoryName: '篆刻入门', difficulty: 'intermediate',
      images: ['https://picsum.photos/seed/p2/400/400'],
      description: '<h3>材料清单</h3><ul><li>寿山石章料 x1</li><li>篆刻刀 x1</li><li>印泥 x1</li></ul><h3>制作步骤</h3><p>1. 在章料上设计印稿…</p><p>2. 用篆刻刀雕刻…</p><p>3. 修整打磨</p>',
      skus: [{ id: 's2a', name: '标准套装', price: 89.0, stock: 30 }],
      shopId: 'shop2', status: 'on',
    }),
    productRepo.create({
      id: 'p3', name: '热缩片耳环·星空系列', categoryId: 'c3', categoryName: '热缩片耳环', difficulty: 'beginner',
      images: ['https://picsum.photos/seed/p3/400/400'],
      description: '<h3>材料清单</h3><ul><li>热缩片 x5张</li><li>耳钩配件 x2对</li><li>彩色铅笔 x1套</li></ul><h3>制作步骤</h3><p>1. 在热缩片上画图案…</p><p>2. 放入烤箱加热…</p><p>3. 组装耳钩</p>',
      skus: [{ id: 's3a', name: '单色套装', price: 29.9, stock: 0 }, { id: 's3b', name: '混色套装', price: 49.9, stock: 40 }],
      shopId: null, status: 'on',
    }),
    productRepo.create({
      id: 'p4', name: '微缩蛋糕·马卡龙塔', categoryId: 'c1', categoryName: '微缩蛋糕', difficulty: 'advanced',
      images: ['https://picsum.photos/seed/p4/400/400'],
      description: '<h3>材料清单</h3><ul><li>树脂粘土 x5色</li><li>塔架底座 x1</li></ul><h3>制作步骤</h3><p>1. 制作马卡龙饼皮…</p><p>2. 组装塔架…</p><p>3. 装饰成品</p>',
      skus: [{ id: 's4a', name: '单层塔套装', price: 99.0, stock: 15 }],
      shopId: 'shop1', status: 'off', // 故意下架，测试异常状态
    }),
    productRepo.create({
      id: 'p5', name: '超轻粘土补充装（3色）', categoryId: 'c1', categoryName: '微缩蛋糕', difficulty: 'beginner',
      images: ['https://picsum.photos/seed/p5/400/400'],
      description: '<p>手工必备材料，超轻粘土三色补充装。</p>',
      skus: [{ id: 's5a', name: '3色装', price: 15.0, stock: 100 }],
      shopId: 'shop1', status: 'on',
    }),
    productRepo.create({
      id: 'p6', name: '塑形工具套装（5件套）', categoryId: 'c1', categoryName: '微缩蛋糕', difficulty: 'beginner',
      images: ['https://picsum.photos/seed/p6/400/400'],
      description: '<p>专业塑形工具五件套，适合各类手工粘土制作。</p>',
      skus: [{ id: 's6a', name: '5件套', price: 25.0, stock: 40 }],
      shopId: 'shop1', status: 'on',
    }),
  ]);

  // 4. 教程
  const tutorialRepo = ds.getRepository(Tutorial);
  await tutorialRepo.save([
    tutorialRepo.create({
      id: 'tut1', authorId: 'user-demo', authorName: '黏土达人小李', authorAvatar: 'https://picsum.photos/seed/author1/100/100',
      bloggerType: 'merchant', title: '【新手向】5分钟学会做微缩草莓奶油杯',
      description: '超轻粘土零基础入门，手把手教你做出超可爱的微缩蛋糕甜品',
      coverImage: 'https://picsum.photos/seed/tutorial1/800/400', videoUrl: 'https://example.com/video1.mp4',
      content: '<h3>制作步骤</h3><p>第一步：揉制粘土，调出草莓色…</p>',
      bundleName: '草莓奶油杯·博主同款套装',
      bundleItems: [
        { productId: 'p1', productName: '微缩蛋糕·草莓奶油杯', productImage: 'https://picsum.photos/seed/p1/400/400', skuId: 's1a', skuName: '基础套装', price: 39.9, stock: 50 },
        { productId: 'p5', productName: '超轻粘土补充装（3色）', productImage: 'https://picsum.photos/seed/p5/400/400', skuId: 's5a', skuName: '3色装', price: 15.0, stock: 100 },
      ],
      status: 'published',
    }),
    tutorialRepo.create({
      id: 'tut2', authorId: 'user-demo', authorName: '手工爱好者小王', authorAvatar: 'https://picsum.photos/seed/author2/100/100',
      bloggerType: 'hobbyist', title: '入坑手作！我最近发现的宝藏手工材料',
      description: '分享几个我用过真的好用的手工材料，新手不踩坑',
      coverImage: 'https://picsum.photos/seed/tutorial2/800/400', videoUrl: '',
      content: '<h3>我的手工心得</h3><p>作为一个入坑两年的手作爱好者…</p>',
      recommendationItems: [
        { productId: 'p2', productName: '篆刻入门·姓氏印章', productImage: 'https://picsum.photos/seed/p2/400/400', skuId: 's2a', skuName: '标准套装', price: 89, shopName: '篆刻工艺坊' },
        { productId: 'p3', productName: '热缩片耳环·星空系列', productImage: 'https://picsum.photos/seed/p3/400/400', skuId: 's3a', skuName: '单色套装', price: 29.9, shopName: '篆刻工艺坊' },
      ],
      materialItems: [
        { productId: 'p5', productName: '超轻粘土补充装（3色）', productImage: 'https://picsum.photos/seed/p5/400/400', skuId: 's5a', skuName: '3色装', price: 15, reason: '制作本教程需要3种基础色粘土' },
        { productId: 'p6', productName: '塑形工具套装（5件套）', productImage: 'https://picsum.photos/seed/p6/400/400', skuId: 's6a', skuName: '5件套', price: 25, reason: '基础塑形必备工具' },
      ],
      status: 'published',
    }),
  ]);

  // 5. 优惠券
  const couponRepo = ds.getRepository(Coupon);
  await couponRepo.save([
    couponRepo.create({ id: 'cp1', userId: 'user-demo', name: '新人专享券', discount: 10, minAmount: 50, expireAt: '2026-12-31', used: false }),
    couponRepo.create({ id: 'cp2', userId: 'user-demo', name: '满100减20', discount: 20, minAmount: 100, expireAt: '2026-12-31', used: false }),
    couponRepo.create({ id: 'cp3', userId: 'user-demo', name: '满200减50', discount: 50, minAmount: 200, expireAt: '2026-09-01', used: false }),
  ]);

  // 6. 地址
  const addressRepo = ds.getRepository(Address);
  await addressRepo.save([
    addressRepo.create({ id: 'addr1', userId: 'user-demo', recipient: '演示用户', phone: '13800138000', province: '广东省', city: '深圳市', district: '南山区', detail: '科技园路1号', isDefault: true }),
    addressRepo.create({ id: 'addr2', userId: 'user-demo', recipient: '演示用户', phone: '13800138000', province: '北京市', city: '北京市', district: '朝阳区', detail: '望京SOHO 12层', isDefault: false }),
  ]);

  // 7. 购物车
  const cartRepo = ds.getRepository(CartItem);
  await cartRepo.save([
    cartRepo.create({ id: 'cart1', userId: 'user-demo', productId: 'p1', productName: '微缩蛋糕·草莓奶油杯', productImage: 'https://picsum.photos/seed/p1/400/400', skuId: 's1a', skuName: '基础套装', price: 39.9, quantity: 2, stock: 50, checked: true }),
    cartRepo.create({ id: 'cart2', userId: 'user-demo', productId: 'p5', productName: '超轻粘土补充装（3色）', productImage: 'https://picsum.photos/seed/p5/400/400', skuId: 's5a', skuName: '3色装', price: 15, quantity: 1, stock: 100, checked: true }),
  ]);

  console.log('种子数据填充完成：3 用户 / 2 店铺 / 6 商品 / 2 教程 / 3 优惠券 / 2 地址 / 2 购物车');
  await app.close();
}

seed().catch((e) => { console.error(e); process.exit(1); });

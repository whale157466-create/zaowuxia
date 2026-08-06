import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getConnection } from 'typeorm';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const conn = app.get(getConnection);
  const repo = conn.getRepository('Product');

  const count = await repo.count();
  if (count > 0) {
    console.log('数据库已有数据，跳过种子填充');
    await app.close();
    return;
  }

  await repo.save([
    repo.create({
      name: '微缩蛋糕·草莓奶油杯', categoryId: 'c1', categoryName: '微缩蛋糕',
      difficulty: 'beginner', images: ['https://picsum.photos/seed/p1/400/400'],
      description: '<h3>材料清单</h3><ul><li>超轻粘土 x3色</li><li>树脂杯托 x1</li></ul><h3>制作步骤</h3><p>1. 揉制粘土成型…</p><p>2. 分层组装到杯托…</p><p>3. 用亮光漆封层</p>',
      skus: [
        { id: 's1a', name: '基础套装', price: 39.9, stock: 50 },
        { id: 's1b', name: '豪华套装（含展示盒）', price: 69.9, stock: 20 },
      ],
      status: 'on',
    }),
    repo.create({
      name: '篆刻入门·姓氏印章', categoryId: 'c2', categoryName: '篆刻入门',
      difficulty: 'intermediate', images: ['https://picsum.photos/seed/p2/400/400'],
      description: '<h3>材料清单</h3><ul><li>寿山石章料 x1</li><li>篆刻刀 x1</li><li>印泥 x1</li></ul><h3>制作步骤</h3><p>1. 在章料上设计印稿…</p><p>2. 用篆刻刀雕刻…</p><p>3. 修整打磨</p>',
      skus: [{ id: 's2a', name: '标准套装', price: 89.0, stock: 30 }],
      status: 'on',
    }),
    repo.create({
      name: '热缩片耳环·星空系列', categoryId: 'c3', categoryName: '热缩片耳环',
      difficulty: 'beginner', images: ['https://picsum.photos/seed/p3/400/400'],
      description: '<h3>材料清单</h3><ul><li>热缩片 x5张</li><li>耳钩配件 x2对</li><li>彩色铅笔 x1套</li></ul><h3>制作步骤</h3><p>1. 在热缩片上画图案…</p><p>2. 放入烤箱加热…</p><p>3. 组装耳钩</p>',
      skus: [
        { id: 's3a', name: '单色套装', price: 29.9, stock: 0 },
        { id: 's3b', name: '混色套装', price: 49.9, stock: 40 },
      ],
      status: 'on',
    }),
    repo.create({
      name: '微缩蛋糕·马卡龙塔', categoryId: 'c1', categoryName: '微缩蛋糕',
      difficulty: 'advanced', images: ['https://picsum.photos/seed/p4/400/400'],
      description: '<h3>材料清单</h3><ul><li>树脂粘土 x5色</li><li>塔架底座 x1</li></ul><h3>制作步骤</h3><p>1. 制作马卡龙饼皮…</p><p>2. 组装塔架…</p><p>3. 装饰成品</p>',
      skus: [{ id: 's4a', name: '单层塔套装', price: 99.0, stock: 15 }],
      status: 'off', // 故意设置一个下架商品测试异常状态
    }),
    repo.create({
      name: '超轻粘土补充装（3色）', categoryId: 'c1', categoryName: '微缩蛋糕',
      difficulty: 'beginner', images: ['https://picsum.photos/seed/p5/400/400'],
      description: '<p>手工必备材料，超轻粘土三色补充装。</p>',
      skus: [{ id: 's5a', name: '3色装', price: 15.0, stock: 100 }],
      status: 'on',
    }),
    repo.create({
      name: '塑形工具套装（5件套）', categoryId: 'c1', categoryName: '微缩蛋糕',
      difficulty: 'beginner', images: ['https://picsum.photos/seed/p6/400/400'],
      description: '<p>专业塑形工具五件套，适合各类手工粘土制作。</p>',
      skus: [{ id: 's6a', name: '5件套', price: 25.0, stock: 40 }],
      status: 'on',
    }),
  ]);
  console.log('种子数据已填充：6 个商品');
  await app.close();
}

seed().catch(e => { console.error(e); process.exit(1); });

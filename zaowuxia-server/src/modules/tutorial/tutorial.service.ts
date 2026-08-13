import { Injectable, BadRequestException, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tutorial, BundleItem, RecommendationItem, MaterialItem } from './tutorial.entity';
import { Product } from '../product/product.entity';
import { Shop } from '../shop/shop.entity';

@Injectable()
export class TutorialService implements OnApplicationBootstrap {
  private readonly DEMO_USER_ID = 'demo-user-001';

  constructor(
    @InjectRepository(Tutorial) private repo: Repository<Tutorial>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Shop) private shopRepo: Repository<Shop>,
  ) {}

  async onApplicationBootstrap() {
    const count = await this.repo.count();
    if (count > 0) return;

    // 获取种子数据
    const shops = await this.shopRepo.find();
    const products = await this.productRepo.find({ where: { status: 'on' } });

    if (shops.length === 0 || products.length < 2) return;

    const shop1 = shops[0]; // 黏土手作小铺
    const shop1Products = products.filter(p => p.categoryId === 'c1'); // 微缩蛋糕类

    // ===== 商家博主教程：博主同款套装 =====
    if (shop1Products.length >= 2) {
      const bundleItems: BundleItem[] = shop1Products.slice(0, 2).map(p => ({
        productId: p.id, productName: p.name,
        productImage: p.images[0],
        skuId: p.skus[0].id, skuName: p.skus[0].name,
        price: p.skus[0].price, stock: p.skus[0].stock,
      }));

      await this.repo.save(this.repo.create({
        authorId: this.DEMO_USER_ID,
        authorName: '黏土达人小李',
        authorAvatar: 'https://picsum.photos/seed/author1/100/100',
        bloggerType: 'merchant',
        title: '【新手向】5分钟学会做微缩草莓奶油杯',
        description: '超轻粘土零基础入门，手把手教你做出超可爱的微缩蛋糕甜品',
        coverImage: 'https://picsum.photos/seed/tutorial1/800/400',
        videoUrl: 'https://example.com/video1.mp4',
        content: '<h3>制作步骤</h3><p>第一步：揉制粘土，调出草莓色…</p>',
        bundleName: '草莓奶油杯·博主同款套装',
        bundleItems,
        status: 'published',
      }));
    }

    // ===== 纯爱好博主教程：种草推荐 + 算法材料清单 =====
    const otherProducts = products.filter(p => p.categoryId !== 'c1');
    if (otherProducts.length >= 2) {
      const recItems: RecommendationItem[] = otherProducts.slice(0, 2).map(p => ({
        productId: p.id, productName: p.name,
        productImage: p.images[0],
        skuId: p.skus[0].id, skuName: p.skus[0].name,
        price: p.skus[0].price,
        shopName: shops.length > 1 ? shops[1].name : shops[0].name,
      }));

      // 算法自动生成材料清单
      const materialItems: MaterialItem[] = [
        { productId: 'auto-1', productName: '超轻粘土基础色套装', productImage: 'https://picsum.photos/seed/mat1/200/200', skuId: 's5a', skuName: '3色装', price: 15.0, reason: '制作本教程需要3种基础色粘土' },
        { productId: 'auto-2', productName: '塑形工具套装', productImage: 'https://picsum.photos/seed/mat2/200/200', skuId: 's6a', skuName: '5件套', price: 25.0, reason: '基础塑形必备工具' },
      ];

      await this.repo.save(this.repo.create({
        authorId: this.DEMO_USER_ID,
        authorName: '手工爱好者小王',
        authorAvatar: 'https://picsum.photos/seed/author2/100/100',
        bloggerType: 'hobbyist',
        title: '入坑手作！我最近发现的宝藏手工材料',
        description: '分享几个我用过真的好用的手工材料，新手不踩坑',
        coverImage: 'https://picsum.photos/seed/tutorial2/800/400',
        content: '<h3>我的手工心得</h3><p>作为一个入坑两年的手作爱好者…</p>',
        recommendationItems: recItems,
        materialItems,
        status: 'published',
      }));
    }

    console.log('✓ 播种教程数据');
  }

  async findAll(bloggerType?: string) {
    const where: any = { status: 'published' };
    if (bloggerType) where.bloggerType = bloggerType;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async create(body: {
    authorId: string; authorName: string; authorAvatar: string;
    bloggerType: 'merchant' | 'hobbyist';
    title: string; description?: string; coverImage?: string;
    videoUrl?: string; content?: string;
    bundleName?: string; bundleItems?: BundleItem[];
    recommendationItems?: RecommendationItem[];
  }) {
    if (body.bloggerType === 'merchant') {
      if (!body.bundleName || !body.bundleItems?.length) {
        throw new BadRequestException('商家博主必须配置博主同款套装');
      }
    }
    return this.repo.save(this.repo.create(body));
  }

  /** 商家博主更新套装 */
  async updateBundle(id: string, bundleName: string, bundleItems: BundleItem[]) {
    const tutorial = await this.repo.findOne({ where: { id } });
    if (!tutorial) throw new BadRequestException('教程不存在');
    if (tutorial.bloggerType !== 'merchant') throw new BadRequestException('仅商家博主可配置套装');
    tutorial.bundleName = bundleName;
    tutorial.bundleItems = bundleItems;
    return this.repo.save(tutorial);
  }

  /** 纯爱好博主更新种草推荐 */
  async updateRecommendations(id: string, items: RecommendationItem[]) {
    const tutorial = await this.repo.findOne({ where: { id } });
    if (!tutorial) throw new BadRequestException('教程不存在');
    if (tutorial.bloggerType !== 'hobbyist') throw new BadRequestException('仅纯爱好博主可配置种草推荐');
    tutorial.recommendationItems = items;
    return this.repo.save(tutorial);
  }

  /**
   * 纯爱好博主不能修改算法材料清单。
   * 前端直接隐藏编辑按钮即可；后端不提供 materialItems 的修改接口。
   */
}

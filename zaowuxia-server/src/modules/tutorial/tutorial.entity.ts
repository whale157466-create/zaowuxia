import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

/** 博主同款套装中的单品 */
export interface BundleItem {
  productId: string; productName: string; productImage: string;
  skuId: string; skuName: string; price: number; stock: number;
}

/** 博主种草推荐中的单品 */
export interface RecommendationItem {
  productId: string; productName: string; productImage: string;
  skuId: string; skuName: string; price: number;
  shopName: string; // 来自哪家店铺
}

/** 算法生成的推荐材料 */
export interface MaterialItem {
  productId: string; productName: string; productImage: string;
  skuId: string; skuName: string; price: number;
  reason: string; // 算法推荐理由
}

@Entity('tutorials')
export class Tutorial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  authorId: string;

  @Column()
  authorName: string;

  @Column()
  authorAvatar: string;

  /** 'merchant' = 商家博主 | 'hobbyist' = 纯爱好博主 */
  @Column()
  bloggerType: 'merchant' | 'hobbyist';

  @Column()
  title: string;

  @Column({ default: '' })
  description: string;

  @Column({ default: '' })
  coverImage: string;

  @Column({ default: '' })
  videoUrl: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  // ===== 商家博主专属：博主同款套装 =====
  @Column({ nullable: true })
  bundleName: string; // 套装名称，如"草莓奶油杯·博主同款套装"

  @Column({ type: 'simple-json', nullable: true })
  bundleItems: BundleItem[]; // 套装内商品（仅限自家店铺）

  // ===== 纯爱好博主专属：博主种草推荐 =====
  @Column({ type: 'simple-json', nullable: true })
  recommendationItems: RecommendationItem[]; // 手动挑选的平台商品

  // ===== 算法自动生成的材料清单（纯爱好博主不可修改）=====
  @Column({ type: 'simple-json', nullable: true })
  materialItems: MaterialItem[];

  @Column({ default: 'published' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}

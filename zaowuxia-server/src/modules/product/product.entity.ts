import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  categoryId: string;

  @Column()
  categoryName: string;

  @Column({ default: 'beginner' })
  difficulty: string;

  @Column({ type: 'simple-json' }) // 图片URL数组 → 存JSON
  images: string[];

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'simple-json' }) // SKU数组 → 存JSON
  skus: { id: string; name: string; price: number; stock: number }[];

  @Column({ nullable: true })
  shopId: string; // 所属店铺（商家博主发布商品时关联）

  @Column({ default: 'on' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}

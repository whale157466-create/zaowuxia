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

  @Column({ default: 'on' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}

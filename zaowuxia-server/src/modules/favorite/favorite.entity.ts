import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('favorites')
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  productId: string;

  @Column()
  productName: string;

  @Column()
  categoryName: string;

  @Column()
  difficulty: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column()
  image: string;

  @Column({ default: 'on' })
  status: string; // 商品状态快照

  @CreateDateColumn()
  createdAt: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  productId: string;

  @Column()
  productName: string;

  @Column()
  productImage: string;

  @Column()
  skuId: string;

  @Column()
  skuName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ default: 1 })
  quantity: number;

  @Column({ default: 0 })
  stock: number;

  @Column({ default: true })
  checked: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

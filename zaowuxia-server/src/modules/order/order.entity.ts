import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderNo: string;

  @Column()
  userId: string;

  @Column({ type: 'simple-json' })
  items: { productId: string; productName: string; productImage: string; skuId: string; skuName: string; price: number; quantity: number }[];

  @Column({ type: 'simple-json' })
  address: { recipient: string; phone: string; province: string; city: string; district: string; detail: string };

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  productAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  freight: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ default: 'pending_payment' })
  status: string;

  @Column({ nullable: true })
  remark: string;

  @Column({ nullable: true })
  couponId: string;

  @Column({ nullable: true })
  expireAt: Date;

  @Column({ type: 'simple-json', nullable: true })
  logistics: { company: string; trackingNo: string; traces: { time: string; desc: string }[] };

  @CreateDateColumn()
  createdAt: Date;
}

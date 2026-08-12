import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('after_sales')
export class AfterSales {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderId: string;

  @Column()
  userId: string;

  @Column()
  type: string; // 'refund' | 'return' | 'reissue'

  @Column()
  reason: string;

  @Column({ type: 'simple-json', nullable: true })
  images: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  refundAmount: number;

  @Column({ default: 'reviewing' })
  status: string; // 'reviewing' | 'approved' | 'processing' | 'completed' | 'rejected'

  @Column({ nullable: true })
  rejectReason: string;

  @CreateDateColumn()
  createdAt: Date;
}

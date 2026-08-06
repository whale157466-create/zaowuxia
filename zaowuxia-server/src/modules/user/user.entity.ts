import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  openId: string;

  @Column()
  nickname: string;

  @Column({ default: '' })
  avatar: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column() // 密码哈希
  password: string;

  @Column({ default: 'user' }) // 'user' | 'admin'
  role: string;

  @CreateDateColumn()
  createdAt: Date;
}

import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './address.entity';

const SEED_ADDRESSES = [
  { recipient: '演示用户', phone: '13800138000', province: '广东省', city: '深圳市', district: '南山区', detail: '科技园路1号', isDefault: true },
  { recipient: '演示用户', phone: '13800138000', province: '北京市', city: '北京市', district: '朝阳区', detail: '望京SOHO 12层', isDefault: false },
];

@Injectable()
export class AddressService implements OnModuleInit {
  private readonly DEMO_USER_ID = 'demo-user-001';

  constructor(@InjectRepository(Address) private repo: Repository<Address>) {}

  async onModuleInit() {
    const count = await this.repo.count();
    if (count === 0) {
      for (const d of SEED_ADDRESSES) {
        await this.repo.save(this.repo.create({ ...d, userId: this.DEMO_USER_ID }));
      }
      console.log(`✓ 播种 ${SEED_ADDRESSES.length} 条地址`);
    }
  }

  async findAll(): Promise<Address[]> {
    return this.repo.find({ where: { userId: this.DEMO_USER_ID }, order: { isDefault: 'DESC', createdAt: 'DESC' } });
  }

  async create(body: Partial<Address>): Promise<Address> {
    // 设为默认时先取消其他默认
    if (body.isDefault) {
      await this.repo.update({ userId: this.DEMO_USER_ID, isDefault: true }, { isDefault: false });
    }
    return this.repo.save(this.repo.create({ ...body, userId: this.DEMO_USER_ID }));
  }

  async update(id: string, body: Partial<Address>): Promise<Address> {
    const addr = await this.repo.findOne({ where: { id, userId: this.DEMO_USER_ID } });
    if (!addr) throw new BadRequestException('地址不存在');
    if (body.isDefault) {
      await this.repo.update({ userId: this.DEMO_USER_ID, isDefault: true }, { isDefault: false });
    }
    Object.assign(addr, body);
    return this.repo.save(addr);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete({ id, userId: this.DEMO_USER_ID });
  }
}

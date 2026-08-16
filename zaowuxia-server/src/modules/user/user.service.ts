import { Injectable, OnModuleInit, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService implements OnModuleInit {
  private readonly DEMO_USER_ID = 'demo-user-001';

  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  // users 表迁移后为空，确保演示用户存在
  async onModuleInit() {
    const user = await this.repo.findOne({ where: { id: this.DEMO_USER_ID } });
    if (!user) {
      await this.repo.save(this.repo.create({ id: this.DEMO_USER_ID, nickname: '手工爱好者', avatar: '', password: '', role: 'user' }));
      console.log('✓ 播种演示用户 demo-user-001');
    }
  }

  async getProfile() {
    const user = await this.repo.findOne({ where: { id: this.DEMO_USER_ID } });
    return { id: user?.id, nickname: user?.nickname || '', avatar: user?.avatar || '', role: user?.role || 'user' };
  }

  async updateProfile(body: { nickname?: string; avatar?: string }) {
    const user = await this.repo.findOne({ where: { id: this.DEMO_USER_ID } });
    if (!user) throw new BadRequestException('用户不存在');
    if (body.nickname !== undefined) user.nickname = body.nickname;
    if (body.avatar !== undefined) user.avatar = body.avatar;
    await this.repo.save(user);
    return { id: user.id, nickname: user.nickname, avatar: user.avatar, role: user.role };
  }
}

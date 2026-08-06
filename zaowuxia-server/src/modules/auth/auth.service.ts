import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  /** 微信扫码登录——没有账号就自动注册 */
  async wechatLogin(code: string) {
    // 实际项目：用 code 换 openId，这里直接 mock
    const openId = 'wx_openid_' + code.slice(-8);
    let user = await this.userRepo.findOne({ where: { openId } });
    if (!user) {
      user = await this.userRepo.save(
        this.userRepo.create({ openId, nickname: '手工爱好者', password: '', role: 'user' }),
      );
    }
    const token = this.jwtService.sign({ sub: user.id, role: user.role });
    return { token, role: user.role };
  }

  /** 统一账号密码登录 */
  async passwordLogin(account: string, password: string) {
    let user = await this.userRepo.findOne({
      where: [{ email: account }, { phone: account }],
    });
    if (!user) {
      // 演示用：首次登录自动注册
      const isAdmin = account.toLowerCase().includes('admin');
      const hashed = await bcrypt.hash(password, 10);
      user = await this.userRepo.save(
        this.userRepo.create({ nickname: account, email: account, password: hashed, role: isAdmin ? 'admin' : 'user' }),
      );
    } else {
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new UnauthorizedException('密码错误');
    }
    const token = this.jwtService.sign({ sub: user.id, role: user.role });
    return { token, role: user.role };
  }
}

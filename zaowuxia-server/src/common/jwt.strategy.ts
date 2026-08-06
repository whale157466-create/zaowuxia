import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'zaowuxia-secret-key', // 生产环境应放环境变量
    });
  }

  async validate(payload: { sub: string; role: string }) {
    return { userId: payload.sub, role: payload.role };
  }
}

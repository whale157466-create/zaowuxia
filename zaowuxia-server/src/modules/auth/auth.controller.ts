import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('user/login/wechat')
  async wechatLogin(@Body('code') code: string) {
    const data = await this.authService.wechatLogin(code);
    return { code: 0, message: 'ok', data };
  }

  @Post('user/login/password')
  async passwordLogin(@Body() body: { account: string; password: string }) {
    const data = await this.authService.passwordLogin(body.account, body.password);
    return { code: 0, message: 'ok', data };
  }
}

import { Controller, Get, Put, Body } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get('profile')
  async getProfile() {
    return { code: 0, message: 'ok', data: await this.service.getProfile() };
  }

  @Put('profile')
  async updateProfile(@Body() body: { nickname?: string; avatar?: string }) {
    return { code: 0, message: 'ok', data: await this.service.updateProfile(body) };
  }
}

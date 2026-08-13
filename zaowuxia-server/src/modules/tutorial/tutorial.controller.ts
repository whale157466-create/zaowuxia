import { Controller, Get, Post, Put, Param, Query, Body } from '@nestjs/common';
import { TutorialService } from './tutorial.service';

@Controller('tutorials')
export class TutorialController {
  constructor(private readonly service: TutorialService) {}

  /** 教程列表，支持按博主类型筛选 */
  @Get()
  async findAll(@Query('bloggerType') bloggerType?: string) {
    return { code: 0, message: 'ok', data: await this.service.findAll(bloggerType) };
  }

  /** 教程详情（含套装/种草/材料清单） */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const tutorial = await this.service.findOne(id);
    if (!tutorial) return { code: 404, message: '教程不存在', data: null };
    return { code: 0, message: 'ok', data: tutorial };
  }

  /** 发布教程 */
  @Post()
  async create(@Body() body: any) {
    return { code: 0, message: '发布成功', data: await this.service.create(body) };
  }

  /** 商家博主更新套装 */
  @Put(':id/bundle')
  async updateBundle(@Param('id') id: string, @Body() body: { bundleName: string; bundleItems: any[] }) {
    return { code: 0, message: 'ok', data: await this.service.updateBundle(id, body.bundleName, body.bundleItems) };
  }

  /** 纯爱好博主更新种草推荐 */
  @Put(':id/recommendations')
  async updateRecommendations(@Param('id') id: string, @Body() body: { items: any[] }) {
    return { code: 0, message: 'ok', data: await this.service.updateRecommendations(id, body.items) };
  }
}

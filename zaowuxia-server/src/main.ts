import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 允许前端跨域请求
  app.enableCors({ origin: 'http://localhost:5173', credentials: true });

  // 全局路径前缀（前端请求 /api/xxx 会到这里）
  app.setGlobalPrefix('api');

  await app.listen(8080);
  console.log('造物匣后端已启动 → http://localhost:8080/api');
}
bootstrap();

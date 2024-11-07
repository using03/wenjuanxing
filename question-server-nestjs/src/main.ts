import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './transform/transform.interceptor';
import { HttpExceptionFilter } from './http-exeption/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api'); // 路由全局的前缀

  app.useGlobalInterceptors(new TransformInterceptor()); // 全局拦截器

  app.useGlobalFilters(new HttpExceptionFilter()); // 全局过滤器

  // await app.listen(process.env.PORT ?? 3005); // 端口

  app.enableCors(); // 跨域 （前端端口不是3005）

  await app.listen(3005); // 端口
}
bootstrap();

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configureApplication } from './configure-application';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  configureApplication(app);
  app.enableShutdownHooks();
  const config = new DocumentBuilder()
    .setTitle('WenLock • Usuários')
    .setDescription(
      'API do teste técnico. CRUD com validação, busca por nome e paginação. Ambiente de demonstração local sem autenticação.',
    )
    .setVersion('1.0.0')
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));
  const port = Number(process.env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT inválida.');
  await app.listen(port, process.env.HOST ?? '127.0.0.1');
}

bootstrap().catch(() => {
  console.error(
    'Não foi possível iniciar a API. Verifique a configuração e a disponibilidade do banco.',
  );
  process.exitCode = 1;
});

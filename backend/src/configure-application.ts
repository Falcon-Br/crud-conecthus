import { INestApplication } from '@nestjs/common';
import { json } from 'express';
import helmet from 'helmet';
import { bodyParserErrorHandler } from './common/api-error';

export function configureApplication(app: INestApplication): void {
  app.use(json({ limit: '16kb' }));
  app.use(bodyParserErrorHandler);
  app.use(helmet());
  app.enableCors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' });
  app.setGlobalPrefix('api');
}

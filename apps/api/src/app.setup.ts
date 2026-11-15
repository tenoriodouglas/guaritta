import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';

/** HTTP pipeline shared by the server bootstrap and e2e tests. */
export function configureApp(app: NestExpressApplication): void {
  app.use(helmet());
  // Camera snapshots may be sent as base64 JSON.
  app.useBodyParser('json', { limit: '5mb' });
  app.enableCors();
  app.enableShutdownHooks();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
}

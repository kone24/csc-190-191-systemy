import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import 'dotenv/config';

function normalizeOrigin(url: string) {
  return url.replace(/\/+$/, '');
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const frontendUrl = normalizeOrigin(
    process.env.FRONTEND_URL || 'http://localhost:3000',
  );

  app.use(cookieParser());
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Backend running on port ${port}`);
}

bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.enableCors({
<<<<<<< HEAD
    origin: 'http://localhost:3001',    // frontend
=======
    origin: 'http://localhost:3001',
>>>>>>> main
    credentials: true,
  });

  await app.listen(3000);
  console.log('Backend running on http://localhost:3000');
}

bootstrap();
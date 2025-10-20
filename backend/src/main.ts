import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000', // Allow frontend access
    credentials: true,

  });
  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  const url = await app.getUrl();
  console.log(`Server is running on: ${url}`);
}
bootstrap();

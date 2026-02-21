import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule } from './clients/clients.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Client } from './clients/entities/client.entity';
import { WebhookModule } from './webhook/webhook.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    ClientsModule,
    WebhookModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || (() => { throw new Error('DB_HOST is required') })(),
      port: parseInt(process.env.DB_PORT || (() => { throw new Error('DB_PORT is required') })()),
      username: process.env.DB_USER || (() => { throw new Error('DB_USER is required') })(),
      password: process.env.DB_PASSWORD || (() => { throw new Error('DB_PASSWORD is required') })(),
      database: process.env.DB_NAME || (() => { throw new Error('DB_NAME is required') })(),
      entities: [Client],
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
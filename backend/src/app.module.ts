import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule } from './clients/clients.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Client } from './clients/entities/client.entity';
import { WebhookModule } from './webhook/webhook.module';

@Module({
  imports: [
    AuthModule,
    ClientsModule,
    WebhookModule,
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: 'localhost',
    //   port: 5432,
    //   username: 'postgres',
    //   password: '8400',
    //   database: 'headword_db',
    //   entities: [Client],
    //   synchronize: false, // adjust if needed
    // }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
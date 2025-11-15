import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule } from './auth/clients/clients.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Client } from './auth/clients/entities/client.entity';

@Module({
  imports: [
    AuthModule,
    ClientsModule,
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

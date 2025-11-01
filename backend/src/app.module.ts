// Not functioning yet, couldn't get database entries to work, just using test data in a static json
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { ClientsModule } from './auth/clients/clients.module';
import { AuthModule } from './auth/auth.module';
import { Client } from './auth/clients/entities/client.entity';

@Module({
  imports: [
    AuthModule,
    ClientsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '8400',
      database: 'headword_db',
      entities: [Client],
      synchronize: false, 
    }),
  ],
})
export class AppModule {}

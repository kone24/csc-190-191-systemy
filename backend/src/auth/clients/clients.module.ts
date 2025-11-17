import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { Client } from './entities/client.entity';

@Module({
  imports: [
    // TypeOrmModule.forFeature([Client])  // Commented out - using JSON file instead
  ],
  providers: [ClientsService],
  controllers: [ClientsController],
})
export class ClientsModule {}

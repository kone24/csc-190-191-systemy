import { Module } from '@nestjs/common';
import { ClientsSupabaseService } from './clients.supabase.service';
import { ClientsController } from './clients.controller';

@Module({
  imports: [],
  providers: [ClientsSupabaseService],
  controllers: [ClientsController],
  exports: [ClientsSupabaseService],
})
export class ClientsModule { }

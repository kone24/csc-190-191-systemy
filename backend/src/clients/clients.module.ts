import { Module } from '@nestjs/common';
import { ClientsSupabaseService } from './clients.supabase.service';
import { ClientsController } from './clients.controller';
import { SupabaseModule } from 'src/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [ClientsSupabaseService],
  controllers: [ClientsController],
  exports: [ClientsSupabaseService],
})
export class ClientsModule {}

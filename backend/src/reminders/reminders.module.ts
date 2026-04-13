import { Module } from '@nestjs/common';
import { RemindersController } from './reminders.controller';
import { RemindersService } from './reminders.service';
import { RemindersSupabaseService } from './reminders.supabase.service';

@Module({
  controllers: [RemindersController],
  providers: [RemindersService, RemindersSupabaseService],
  exports: [RemindersService],
})
export class RemindersModule {}
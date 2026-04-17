import { Module } from '@nestjs/common';
import { InvoicesSupabaseService } from './invoices.supabase.service';
import { InvoicesController } from './invoices.controller';
import { InvoiceOverdueProcessor } from './invoice-overdue.processor';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [UsersModule, NotificationsModule],
    providers: [InvoicesSupabaseService, InvoiceOverdueProcessor],
    controllers: [InvoicesController],
    exports: [InvoicesSupabaseService],
})
export class InvoicesModule {}

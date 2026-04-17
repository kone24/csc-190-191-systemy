import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule } from './clients/clients.module';
import { VendorsModule } from './vendors/vendors.module';
import { ProjectsModule } from './projects/projects.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebhookModule } from './webhook/webhook.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditModule } from './audit/audit.module';
import { LeadsModule } from './leads/leads.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { UsersModule } from './users/users.module';
import { RemindersModule } from './reminders/reminders.module';
import { TestController } from './test.controller';
import { MailModule } from './mail/mail.module';
import { GanttEntryModule } from './gantt-entry/gantt-entry.module';
import { InvoicesModule } from './invoices/invoices.module';
import { RecommendationsModule } from './recommendations/recommendations.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    AuditModule,
    NotificationsModule,
    RemindersModule,
    AuthModule,
    ClientsModule,
    VendorsModule,
    ProjectsModule,
    WebhookModule,
    LeadsModule,
    AnalyticsModule,
    UsersModule,
    MailModule,
    GanttEntryModule,
    InvoicesModule,
    RecommendationsModule,
  ],
  controllers: [AppController, TestController],
  providers: [AppService],
})
export class AppModule { }
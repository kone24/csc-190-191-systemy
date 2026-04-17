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
import { GanttEntryModule } from './gantt-entry/gantt-entry.module';
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
    AuthModule,
    ClientsModule,
    VendorsModule,
    ProjectsModule,
    WebhookModule,
    LeadsModule,
    AnalyticsModule,
    ProjectsModule,
    UsersModule,
    GanttEntryModule,
    RecommendationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
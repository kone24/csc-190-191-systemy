import { Body, Controller, Post, Get } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { IsBoolean, IsISO8601, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateFollowUpReminderDto {
  @IsString()
  userId!: string;

  @IsString()
  clientId!: string;

  @IsString()
  interactionId!: string;

  @IsISO8601()
  baseTimeISO!: string;

  @IsInt()
  @Min(0)
  followUpDays!: number;

  @IsOptional()
  @IsBoolean()
  sendEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  sendDashboard?: boolean;
}

@Controller('reminders')
export class RemindersController {
  constructor(private readonly reminders: RemindersService) {}

  @Post('followup')
  createFollowUp(@Body() dto: CreateFollowUpReminderDto) {
    const reminder = this.reminders.createFollowUpReminder({
      userId: dto.userId,
      clientId: dto.clientId,
      interactionId: dto.interactionId,
      baseTimeISO: dto.baseTimeISO,
      followUpDays: dto.followUpDays,
      sendEmail: dto.sendEmail ?? true,
      sendDashboard: dto.sendDashboard ?? true,
    });

    return { reminder };
  }

  // 👇 ADD THIS METHOD RIGHT HERE (inside the class)
  @Get()
  listAll() {
    return { reminders: this.reminders.listAll() };
  }
}
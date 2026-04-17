import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';

@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  create(@Body() dto: CreateReminderDto) {
    return this.remindersService.create(dto);
  }

  @Post('followup')
  createFollowUpReminder(
    @Body()
    body: {
      userId: string;
      clientId: string;
      interactionId: string;
      followUpDays: number;
      baseTimeISO: string;
      sendEmail: boolean;
      sendDashboard: boolean;
    },
  ) {
    return this.remindersService.createFollowUpReminder(body);
  }

  @Get()
  findAll() {
    return this.remindersService.findAll();
  }

  @Get('dashboard/due')
async getDueReminders() {
  const items = await this.remindersService.getDueReminders();
  return { ok: true, items };
}

  @Get('client/:clientId')
  findByClient(@Param('clientId') clientId: string) {
    return this.remindersService.findByClient(clientId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateReminderDto) {
    return this.remindersService.update(id, dto);
  }

  @Patch(':id/complete')
  markCompleted(@Param('id') id: string) {
    return this.remindersService.markCompleted(id);
  }
}
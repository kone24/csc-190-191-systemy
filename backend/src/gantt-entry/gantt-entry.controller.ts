import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { GanttEntryService } from './gantt-entry.service';
import { CreateGanttEntryDto, UpdateGanttEntryDto } from './dto/gantt-entry.dto';

@Controller()
export class GanttEntryController {
    constructor(private readonly ganttEntryService: GanttEntryService) {}

    @Get('gantt-entries')
    async list() {
        const items = await this.ganttEntryService.findAll();
        return { ok: true, items };
    }

    @Post('gantt-entries')
    async create(@Body() dto: CreateGanttEntryDto) {
        const item = await this.ganttEntryService.create(dto);
        return { ok: true, item };
    }

    @Patch('gantt-entries/:id')
    async update(@Param('id') id: string, @Body() dto: UpdateGanttEntryDto) {
        const item = await this.ganttEntryService.update(id, dto);
        return { ok: true, item };
    }

    @Delete('gantt-entries/:id')
    async remove(@Param('id') id: string) {
        await this.ganttEntryService.remove(id);
        return { ok: true };
    }
}

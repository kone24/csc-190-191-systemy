import { Module } from '@nestjs/common';
import { GanttEntryService } from './gantt-entry.service';
import { GanttEntryController } from './gantt-entry.controller';

@Module({
    imports: [],
    providers: [GanttEntryService],
    controllers: [GanttEntryController],
    exports: [GanttEntryService],
})
export class GanttEntryModule {}

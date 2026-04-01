import { Module } from '@nestjs/common';
import { ProjectsSupabaseService } from './projects.supabase.service';
import { ProjectsController } from './projects.controller';

@Module({
    imports: [],
    providers: [ProjectsSupabaseService],
    controllers: [ProjectsController],
    exports: [ProjectsSupabaseService],
})
export class ProjectsModule { }

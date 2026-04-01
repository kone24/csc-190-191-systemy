import { Controller, Get } from '@nestjs/common';
import { ProjectsSupabaseService } from './projects.supabase.service';

@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsSupabaseService) { }

    @Get()
    async list() {
        return this.projectsService.findAll();
    }
}

import { Controller, Get, Param } from '@nestjs/common';
import { ProjectsService } from './projects.service';

@Controller()
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) {}

    @Get('projects')
    async list() {
        const items = await this.projectsService.findAll();
        return { ok: true, items };
    }

    @Get('projects/:id/phases')
    async getPhases(@Param('id') id: string) {
        const items = await this.projectsService.findPhasesByProjectId(id);
        return { ok: true, items };
    }

    @Get('phases/:id/tasks')
    async getTasks(@Param('id') id: string) {
        const items = await this.projectsService.findTasksByPhaseId(id);
        return { ok: true, items };
    }
}

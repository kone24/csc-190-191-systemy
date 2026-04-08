import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller()
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) {}

    @Get('projects')
    async list() {
        const items = await this.projectsService.findAll();
        return { ok: true, items };
    }

    @Post('projects')
    async create(@Body() dto: CreateProjectDto) {
        const item = await this.projectsService.create(dto);
        return { ok: true, item };
    }

    @Patch('projects/:id')
    async update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
        const item = await this.projectsService.update(id, dto);
        return { ok: true, item };
    }

    @Delete('projects/:id')
    async remove(@Param('id') id: string) {
        await this.projectsService.remove(id);
        return { ok: true };
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

    @Post('phases/:id/tasks')
    async createTask(@Param('id') id: string, @Body() dto: CreateTaskDto) {
        const item = await this.projectsService.createTask(id, dto);
        return { ok: true, item };
    }

    @Patch('tasks/:id')
    async updateTask(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
        const item = await this.projectsService.updateTask(id, dto);
        return { ok: true, item };
    }

    @Delete('tasks/:id')
    async removeTask(@Param('id') id: string) {
        await this.projectsService.removeTask(id);
        return { ok: true };
    }
}

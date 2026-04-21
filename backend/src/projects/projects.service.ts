import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ProjectResponseDto } from './dto/project-response.dto';
import { PhaseResponseDto } from './dto/phase-response.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class ProjectsService {
    private readonly logger = new Logger(ProjectsService.name);
    private supabase: SupabaseClient;

    constructor(private configService: ConfigService) {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be provided');
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);
        this.logger.log('Supabase client initialized for ProjectsService');
    }

    async findAll(): Promise<ProjectResponseDto[]> {
        try {
            // 1. Fetch all projects
            const { data: projects, error: projectsError } = await this.supabase
                .from('project')
                .select('project_id, name, description, service_type, status, start_date, end_date, budget, client_id, owner_id');

            if (projectsError) {
                this.logger.error('Error fetching projects:', projectsError);
                throw new Error(`Failed to fetch projects: ${projectsError.message}`);
            }

            if (!projects || projects.length === 0) {
                return [];
            }

            // 2. Collect unique client IDs and owner IDs
            const clientIds = [...new Set(projects.map(p => p.client_id).filter(Boolean))];
            const ownerIds = [...new Set(projects.map(p => p.owner_id).filter(Boolean))];
            const projectIds = projects.map(p => p.project_id);

            // 3. Batch-fetch clients, users, and task counts in parallel
            const [clientsResult, usersResult, tasksResult] = await Promise.all([
                clientIds.length > 0
                    ? this.supabase.from('clients').select('id, first_name, last_name').in('id', clientIds)
                    : { data: [], error: null },
                ownerIds.length > 0
                    ? this.supabase.from('users').select('user_id, name').in('user_id', ownerIds)
                    : { data: [], error: null },
                this.supabase.from('task').select('project_id').in('project_id', projectIds),
            ]);

            if (clientsResult.error) {
                this.logger.error('Error fetching clients for projects:', clientsResult.error);
                throw new Error(`Failed to fetch clients: ${clientsResult.error.message}`);
            }
            if (usersResult.error) {
                this.logger.error('Error fetching users for projects:', usersResult.error);
                throw new Error(`Failed to fetch users: ${usersResult.error.message}`);
            }
            if (tasksResult.error) {
                this.logger.error('Error fetching tasks for projects:', tasksResult.error);
                throw new Error(`Failed to fetch tasks: ${tasksResult.error.message}`);
            }

            // 4. Build lookup maps
            const clientMap = new Map<string, string>();
            for (const c of clientsResult.data || []) {
                clientMap.set(c.id, `${c.first_name} ${c.last_name}`.trim());
            }

            const ownerMap = new Map<string, string>();
            for (const u of usersResult.data || []) {
                ownerMap.set(u.user_id, u.name);
            }

            const taskCountMap = new Map<string, number>();
            for (const t of tasksResult.data || []) {
                taskCountMap.set(t.project_id, (taskCountMap.get(t.project_id) || 0) + 1);
            }

            // 5. Assemble response
            return projects.map(p => ({
                project_id: p.project_id,
                name: p.name,
                status: p.status,
                service_type: p.service_type,
                start_date: p.start_date,
                end_date: p.end_date,
                client_id: p.client_id,
                client_name: clientMap.get(p.client_id) || null,
                owner_id: p.owner_id,
                owner_name: ownerMap.get(p.owner_id) || null,
                task_count: taskCountMap.get(p.project_id) || 0,
                budget: p.budget ?? null,
                description: p.description ?? null,
            }));
        } catch (error) {
            this.logger.error('Error in findAll method:', error);
            throw error;
        }
    }

    async findPhasesByProjectId(projectId: string): Promise<PhaseResponseDto[]> {
        try {
            const { data: phases, error: phasesError } = await this.supabase
                .from('phase')
                .select('phase_id, project_id, name, order_index, assignee_id')
                .eq('project_id', projectId)
                .order('order_index', { ascending: true });

            if (phasesError) {
                this.logger.error('Error fetching phases:', phasesError);
                throw new Error(`Failed to fetch phases: ${phasesError.message}`);
            }

            if (!phases || phases.length === 0) {
                return [];
            }

            // Batch-fetch assignee names
            const assigneeIds = [...new Set(phases.map(p => p.assignee_id).filter(Boolean))];

            let userMap = new Map<string, string>();
            if (assigneeIds.length > 0) {
                const { data: users, error: usersError } = await this.supabase
                    .from('users')
                    .select('user_id, name')
                    .in('user_id', assigneeIds);

                if (usersError) {
                    this.logger.error('Error fetching users for phases:', usersError);
                    throw new Error(`Failed to fetch users: ${usersError.message}`);
                }

                for (const u of users || []) {
                    userMap.set(u.user_id, u.name);
                }
            }

            return phases.map(p => ({
                phase_id: p.phase_id,
                project_id: p.project_id,
                name: p.name,
                order_index: p.order_index,
                assignee_id: p.assignee_id,
                assignee_name: userMap.get(p.assignee_id) || null,
            }));
        } catch (error) {
            this.logger.error('Error in findPhasesByProjectId method:', error);
            throw error;
        }
    }

    async findTasksByPhaseId(phaseId: string): Promise<TaskResponseDto[]> {
        try {
            const { data: phaseTasks, error: phaseTasksError } = await this.supabase
                .from('task')
                .select('task_id, project_id, phase_id, title, description, priority, status, due_date, assigned_to, assignees')
                .eq('phase_id', phaseId);

            if (phaseTasksError) {
                this.logger.error('Error fetching tasks for phase:', phaseTasksError);
                throw new Error(`Failed to fetch tasks: ${phaseTasksError.message}`);
            }

            if (!phaseTasks || phaseTasks.length === 0) {
                return [];
            }

            // Collect all user IDs: assigned_to + all assignees arrays
            const allUserIds = new Set<string>();
            for (const t of phaseTasks) {
                if (t.assigned_to) allUserIds.add(t.assigned_to);
                for (const uid of t.assignees ?? []) {
                    if (uid) allUserIds.add(uid);
                }
            }

            let userMap = new Map<string, string>();
            if (allUserIds.size > 0) {
                const { data: users, error: usersError } = await this.supabase
                    .from('users')
                    .select('user_id, name')
                    .in('user_id', [...allUserIds]);

                if (usersError) {
                    this.logger.error('Error fetching users for tasks:', usersError);
                    throw new Error(`Failed to fetch users: ${usersError.message}`);
                }

                for (const u of users || []) {
                    userMap.set(u.user_id, u.name);
                }
            }

            return phaseTasks.map(t => ({
                task_id: t.task_id,
                project_id: t.project_id,
                phase_id: t.phase_id,
                title: t.title,
                description: t.description,
                priority: t.priority,
                status: t.status,
                due_date: t.due_date,
                assigned_to: t.assigned_to,
                assignee_name: userMap.get(t.assigned_to) || null,
                assignees: t.assignees ?? [],
                assignee_names: (t.assignees ?? []).map((uid: string) => userMap.get(uid)).filter(Boolean) as string[],
            }));
        } catch (error) {
            this.logger.error('Error in findTasksByPhaseId method:', error);
            throw error;
        }
    }

    async create(dto: CreateProjectDto): Promise<ProjectResponseDto> {
        try {
            // 1. Insert the project
            const { data: project, error: projectError } = await this.supabase
                .from('project')
                .insert({
                    name: dto.name,
                    client_id: dto.client_id,
                    owner_id: dto.owner_id,
                    service_type: dto.service_type ?? null,
                    status: dto.status ?? 'open',
                    start_date: dto.start_date ?? null,
                    end_date: dto.end_date ?? null,
                    budget: dto.budget ?? null,
                    description: dto.description ?? null,
                })
                .select('project_id, name, description, service_type, status, start_date, end_date, budget, client_id, owner_id')
                .single();

            if (projectError) {
                this.logger.error('Error creating project:', projectError);
                throw new Error(`Failed to create project: ${projectError.message}`);
            }

            // 2. Insert 4 default phases
            const defaultPhases = [
                { project_id: project.project_id, name: 'Understand', order_index: 0 },
                { project_id: project.project_id, name: 'Plan', order_index: 1 },
                { project_id: project.project_id, name: 'Build', order_index: 2 },
                { project_id: project.project_id, name: 'Connect', order_index: 3 },
            ];

            const { error: phasesError } = await this.supabase
                .from('phase')
                .insert(defaultPhases);

            if (phasesError) {
                this.logger.error('Error creating default phases:', phasesError);
                throw new Error(`Failed to create default phases: ${phasesError.message}`);
            }

            // 3. Resolve client name and owner name
            const [clientResult, ownerResult] = await Promise.all([
                project.client_id
                    ? this.supabase.from('clients').select('id, first_name, last_name').eq('id', project.client_id).single()
                    : { data: null, error: null },
                project.owner_id
                    ? this.supabase.from('users').select('user_id, name').eq('user_id', project.owner_id).single()
                    : { data: null, error: null },
            ]);

            return {
                project_id: project.project_id,
                name: project.name,
                status: project.status,
                service_type: project.service_type,
                start_date: project.start_date,
                end_date: project.end_date,
                client_id: project.client_id,
                client_name: clientResult.data ? `${clientResult.data.first_name} ${clientResult.data.last_name}`.trim() : null,
                owner_id: project.owner_id,
                owner_name: ownerResult.data?.name ?? null,
                task_count: 0,
                budget: project.budget ?? null,
                description: project.description ?? null,
            };
        } catch (error) {
            this.logger.error('Error in create method:', error);
            throw error;
        }
    }

    async update(projectId: string, dto: UpdateProjectDto): Promise<ProjectResponseDto> {
        try {
            // Build update payload with only provided fields
            const updateData: Record<string, unknown> = {};
            if (dto.name !== undefined) updateData.name = dto.name;
            if (dto.client_id !== undefined) updateData.client_id = dto.client_id;
            if (dto.owner_id !== undefined) updateData.owner_id = dto.owner_id;
            if (dto.service_type !== undefined) updateData.service_type = dto.service_type;
            if (dto.status !== undefined) updateData.status = dto.status;
            if (dto.start_date !== undefined) updateData.start_date = dto.start_date;
            if (dto.end_date !== undefined) updateData.end_date = dto.end_date;
            if (dto.budget !== undefined) updateData.budget = dto.budget;
            if (dto.description !== undefined) updateData.description = dto.description;

            const { data: project, error: projectError } = await this.supabase
                .from('project')
                .update(updateData)
                .eq('project_id', projectId)
                .select('project_id, name, description, service_type, status, start_date, end_date, budget, client_id, owner_id')
                .single();

            if (projectError) {
                this.logger.error('Error updating project:', projectError);
                throw new Error(`Failed to update project: ${projectError.message}`);
            }

            if (!project) {
                throw new NotFoundException(`Project ${projectId} not found`);
            }

            // Resolve client name and owner name
            const [clientResult, ownerResult, tasksResult] = await Promise.all([
                project.client_id
                    ? this.supabase.from('clients').select('id, first_name, last_name').eq('id', project.client_id).single()
                    : { data: null, error: null },
                project.owner_id
                    ? this.supabase.from('users').select('user_id, name').eq('user_id', project.owner_id).single()
                    : { data: null, error: null },
                this.supabase.from('task').select('project_id').eq('project_id', projectId),
            ]);

            return {
                project_id: project.project_id,
                name: project.name,
                status: project.status,
                service_type: project.service_type,
                start_date: project.start_date,
                end_date: project.end_date,
                client_id: project.client_id,
                client_name: clientResult.data ? `${clientResult.data.first_name} ${clientResult.data.last_name}`.trim() : null,
                owner_id: project.owner_id,
                owner_name: ownerResult.data?.name ?? null,
                task_count: tasksResult.data?.length ?? 0,
                budget: project.budget ?? null,
                description: project.description ?? null,
            };
        } catch (error) {
            this.logger.error('Error in update method:', error);
            throw error;
        }
    }

    async remove(projectId: string): Promise<void> {
        try {
            // 1. Get all phase IDs for this project
            const { data: phases, error: phasesError } = await this.supabase
                .from('phase')
                .select('phase_id')
                .eq('project_id', projectId);

            if (phasesError) {
                this.logger.error('Error fetching phases for deletion:', phasesError);
                throw new Error(`Failed to fetch phases: ${phasesError.message}`);
            }

            // 2. Delete all tasks belonging to those phases
            const phaseIds = (phases || []).map(p => p.phase_id);
            if (phaseIds.length > 0) {
                const { error: tasksError } = await this.supabase
                    .from('task')
                    .delete()
                    .in('phase_id', phaseIds);

                if (tasksError) {
                    this.logger.error('Error deleting tasks:', tasksError);
                    throw new Error(`Failed to delete tasks: ${tasksError.message}`);
                }
            }

            // 3. Delete all phases for this project
            const { error: deletePhasesError } = await this.supabase
                .from('phase')
                .delete()
                .eq('project_id', projectId);

            if (deletePhasesError) {
                this.logger.error('Error deleting phases:', deletePhasesError);
                throw new Error(`Failed to delete phases: ${deletePhasesError.message}`);
            }

            // 4. Delete the project itself
            const { error: deleteProjectError } = await this.supabase
                .from('project')
                .delete()
                .eq('project_id', projectId);

            if (deleteProjectError) {
                this.logger.error('Error deleting project:', deleteProjectError);
                throw new Error(`Failed to delete project: ${deleteProjectError.message}`);
            }
        } catch (error) {
            this.logger.error('Error in remove method:', error);
            throw error;
        }
    }

    async createTask(phaseId: string, dto: CreateTaskDto): Promise<TaskResponseDto> {
        try {
            const { data: task, error: taskError } = await this.supabase
                .from('task')
                .insert({
                    phase_id: phaseId,
                    project_id: dto.project_id,
                    title: dto.title,
                    description: dto.description ?? null,
                    priority: dto.priority ?? 0,
                    status: dto.status ?? 'todo',
                    due_date: dto.due_date ?? null,
                    assigned_to: dto.assigned_to ?? null,
                    assignees: dto.assignees ?? [],
                })
                .select('task_id, project_id, phase_id, title, description, priority, status, due_date, assigned_to, assignees')
                .single();

            if (taskError) {
                this.logger.error('Error creating task:', taskError);
                throw new Error(`Failed to create task: ${taskError.message}`);
            }

            // Resolve assignee names
            const allUserIds = new Set<string>();
            if (task.assigned_to) allUserIds.add(task.assigned_to);
            for (const uid of task.assignees ?? []) {
                if (uid) allUserIds.add(uid);
            }

            let userMap = new Map<string, string>();
            if (allUserIds.size > 0) {
                const { data: users, error: usersError } = await this.supabase
                    .from('users')
                    .select('user_id, name')
                    .in('user_id', [...allUserIds]);

                if (usersError) {
                    this.logger.error('Error fetching users for task:', usersError);
                    throw new Error(`Failed to fetch users: ${usersError.message}`);
                }

                for (const u of users || []) {
                    userMap.set(u.user_id, u.name);
                }
            }

            return {
                task_id: task.task_id,
                project_id: task.project_id,
                phase_id: task.phase_id,
                title: task.title,
                description: task.description,
                priority: task.priority,
                status: task.status,
                due_date: task.due_date,
                assigned_to: task.assigned_to,
                assignee_name: userMap.get(task.assigned_to) || null,
                assignees: task.assignees ?? [],
                assignee_names: (task.assignees ?? []).map((uid: string) => userMap.get(uid)).filter(Boolean) as string[],
            };
        } catch (error) {
            this.logger.error('Error in createTask method:', error);
            throw error;
        }
    }

    async updateTask(taskId: string, dto: UpdateTaskDto): Promise<TaskResponseDto> {
        try {
            const updateData: Record<string, unknown> = {};
            if (dto.title !== undefined) updateData.title = dto.title;
            if (dto.description !== undefined) updateData.description = dto.description;
            if (dto.priority !== undefined) updateData.priority = dto.priority;
            if (dto.status !== undefined) updateData.status = dto.status;
            if (dto.due_date !== undefined) updateData.due_date = dto.due_date;
            if (dto.assigned_to !== undefined) updateData.assigned_to = dto.assigned_to;
            if (dto.assignees !== undefined) updateData.assignees = dto.assignees;
            if (dto.phase_id !== undefined) updateData.phase_id = dto.phase_id;

            const { data: task, error: taskError } = await this.supabase
                .from('task')
                .update(updateData)
                .eq('task_id', taskId)
                .select('task_id, project_id, phase_id, title, description, priority, status, due_date, assigned_to, assignees')
                .single();

            if (taskError) {
                this.logger.error('Error updating task:', taskError);
                throw new Error(`Failed to update task: ${taskError.message}`);
            }

            if (!task) {
                throw new NotFoundException(`Task ${taskId} not found`);
            }

            // Resolve assignee names
            const allUserIds = new Set<string>();
            if (task.assigned_to) allUserIds.add(task.assigned_to);
            for (const uid of task.assignees ?? []) {
                if (uid) allUserIds.add(uid);
            }

            let userMap = new Map<string, string>();
            if (allUserIds.size > 0) {
                const { data: users, error: usersError } = await this.supabase
                    .from('users')
                    .select('user_id, name')
                    .in('user_id', [...allUserIds]);

                if (usersError) {
                    this.logger.error('Error fetching users for task:', usersError);
                    throw new Error(`Failed to fetch users: ${usersError.message}`);
                }

                for (const u of users || []) {
                    userMap.set(u.user_id, u.name);
                }
            }

            return {
                task_id: task.task_id,
                project_id: task.project_id,
                phase_id: task.phase_id,
                title: task.title,
                description: task.description,
                priority: task.priority,
                status: task.status,
                due_date: task.due_date,
                assigned_to: task.assigned_to,
                assignee_name: userMap.get(task.assigned_to) || null,
                assignees: task.assignees ?? [],
                assignee_names: (task.assignees ?? []).map((uid: string) => userMap.get(uid)).filter(Boolean) as string[],
            };
        } catch (error) {
            this.logger.error('Error in updateTask method:', error);
            throw error;
        }
    }

    async findDashboardTasks(assignedTo?: string): Promise<{
        task_id: string; title: string; priority: number | null;
        status: string | null; due_date: string | null;
        assigned_to: string | null; assignee_name: string | null;
        project_id: string; project_name: string | null;
    }[]> {
        try {
            let query = this.supabase
                .from('task')
                .select('task_id, project_id, title, priority, status, due_date, assigned_to')
                .neq('status', 'done')
                .order('priority', { ascending: false, nullsFirst: false })
                .order('due_date', { ascending: true, nullsFirst: false })
                .limit(6);

            if (assignedTo) {
                query = query.eq('assigned_to', assignedTo);
            }

            const { data: tasks, error: tasksError } = await query;

            if (tasksError) {
                this.logger.error('Error fetching dashboard tasks:', tasksError);
                throw new Error(`Failed to fetch tasks: ${tasksError.message}`);
            }

            if (!tasks || tasks.length === 0) {
                return [];
            }

            const projectIds = [...new Set(tasks.map(t => t.project_id).filter(Boolean))];
            const assigneeIds = [...new Set(tasks.map(t => t.assigned_to).filter(Boolean))];

            const [projectsResult, usersResult] = await Promise.all([
                projectIds.length > 0
                    ? this.supabase.from('project').select('project_id, name').in('project_id', projectIds)
                    : { data: [], error: null },
                assigneeIds.length > 0
                    ? this.supabase.from('users').select('user_id, name').in('user_id', assigneeIds)
                    : { data: [], error: null },
            ]);

            const projectMap = new Map<string, string>();
            for (const p of projectsResult.data || []) {
                projectMap.set(p.project_id, p.name);
            }

            const userMap = new Map<string, string>();
            for (const u of usersResult.data || []) {
                userMap.set(u.user_id, u.name);
            }

            return tasks.map(t => ({
                task_id: t.task_id,
                title: t.title,
                priority: t.priority,
                status: t.status,
                due_date: t.due_date,
                assigned_to: t.assigned_to,
                assignee_name: t.assigned_to ? (userMap.get(t.assigned_to) ?? null) : null,
                project_id: t.project_id,
                project_name: projectMap.get(t.project_id) ?? null,
            }));
        } catch (error) {
            this.logger.error('Error in findDashboardTasks method:', error);
            throw error;
        }
    }

    async removeTask(taskId: string): Promise<void> {
        try {
            const { error: deleteError } = await this.supabase
                .from('task')
                .delete()
                .eq('task_id', taskId);

            if (deleteError) {
                this.logger.error('Error deleting task:', deleteError);
                throw new Error(`Failed to delete task: ${deleteError.message}`);
            }
        } catch (error) {
            this.logger.error('Error in removeTask method:', error);
            throw error;
        }
    }
}

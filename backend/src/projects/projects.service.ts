import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ProjectResponseDto } from './dto/project-response.dto';
import { PhaseResponseDto } from './dto/phase-response.dto';
import { TaskResponseDto } from './dto/task-response.dto';

@Injectable()
export class ProjectsService {
    private readonly logger = new Logger(ProjectsService.name);
    private supabase: SupabaseClient;

    constructor(private configService: ConfigService) {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be provided');
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
}

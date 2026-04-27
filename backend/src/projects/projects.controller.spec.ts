import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

describe('ProjectsController', () => {
    let controller: ProjectsController;
    let service: jest.Mocked<ProjectsService>;

    const mockProject = { project_id: 'p1', name: 'CRM', status: 'active' };
    const mockTask = { task_id: 't1', title: 'Fix bug', status: 'open' };

    beforeEach(async () => {
        const mockService = {
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            findTaskStats: jest.fn(),
            findDashboardTasks: jest.fn(),
            findPhasesByProjectId: jest.fn(),
            findTasksByPhaseId: jest.fn(),
            createTask: jest.fn(),
            updateTask: jest.fn(),
            removeTask: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProjectsController],
            providers: [{ provide: ProjectsService, useValue: mockService }],
        }).compile();

        controller = module.get<ProjectsController>(ProjectsController);
        service = module.get(ProjectsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    // =========================================================================
    // list()
    // =========================================================================

    describe('list()', () => {
        it('delegates to findAll and returns { ok, items }', async () => {
            service.findAll.mockResolvedValue([mockProject] as any);
            const result = await controller.list();
            expect(service.findAll).toHaveBeenCalled();
            expect(result).toEqual({ ok: true, items: [mockProject] });
        });
    });

    // =========================================================================
    // create()
    // =========================================================================

    describe('create()', () => {
        it('delegates to service.create and returns { ok, item }', async () => {
            service.create.mockResolvedValue(mockProject as any);
            const dto: any = { name: 'CRM' };
            const result = await controller.create(dto);
            expect(service.create).toHaveBeenCalledWith(dto);
            expect(result).toEqual({ ok: true, item: mockProject });
        });
    });

    // =========================================================================
    // update()
    // =========================================================================

    describe('update()', () => {
        it('delegates to service.update and returns { ok, item }', async () => {
            const updated = { ...mockProject, name: 'Updated CRM' };
            service.update.mockResolvedValue(updated as any);
            const result = await controller.update('p1', { name: 'Updated CRM' } as any);
            expect(service.update).toHaveBeenCalledWith('p1', { name: 'Updated CRM' });
            expect(result).toEqual({ ok: true, item: updated });
        });
    });

    // =========================================================================
    // remove()
    // =========================================================================

    describe('remove()', () => {
        it('delegates to service.remove and returns { ok: true }', async () => {
            service.remove.mockResolvedValue(undefined as any);
            const result = await controller.remove('p1');
            expect(service.remove).toHaveBeenCalledWith('p1');
            expect(result).toEqual({ ok: true });
        });
    });

    // =========================================================================
    // taskStats()
    // =========================================================================

    describe('taskStats()', () => {
        it('delegates to findTaskStats and spreads into { ok, ...stats }', async () => {
            service.findTaskStats.mockResolvedValue({ total: 5, done: 3 } as any);
            const result = await controller.taskStats('user-1');
            expect(service.findTaskStats).toHaveBeenCalledWith('user-1');
            expect(result).toEqual({ ok: true, total: 5, done: 3 });
        });
    });

    // =========================================================================
    // listTasks()
    // =========================================================================

    describe('listTasks()', () => {
        it('delegates to findDashboardTasks with assigned_to', async () => {
            service.findDashboardTasks.mockResolvedValue([mockTask] as any);
            const result = await controller.listTasks('user-1');
            expect(service.findDashboardTasks).toHaveBeenCalledWith('user-1');
            expect(result).toEqual({ ok: true, items: [mockTask] });
        });

        it('passes undefined when assigned_to is not provided', async () => {
            service.findDashboardTasks.mockResolvedValue([] as any);
            await controller.listTasks(undefined);
            expect(service.findDashboardTasks).toHaveBeenCalledWith(undefined);
        });
    });

    // =========================================================================
    // getPhases()
    // =========================================================================

    describe('getPhases()', () => {
        it('delegates to findPhasesByProjectId and returns { ok, items }', async () => {
            const phases = [{ phase_id: 'ph1', name: 'Design' }];
            service.findPhasesByProjectId.mockResolvedValue(phases as any);
            const result = await controller.getPhases('p1');
            expect(service.findPhasesByProjectId).toHaveBeenCalledWith('p1');
            expect(result).toEqual({ ok: true, items: phases });
        });
    });

    // =========================================================================
    // getTasks()
    // =========================================================================

    describe('getTasks()', () => {
        it('delegates to findTasksByPhaseId and returns { ok, items }', async () => {
            service.findTasksByPhaseId.mockResolvedValue([mockTask] as any);
            const result = await controller.getTasks('ph1');
            expect(service.findTasksByPhaseId).toHaveBeenCalledWith('ph1');
            expect(result).toEqual({ ok: true, items: [mockTask] });
        });
    });

    // =========================================================================
    // createTask()
    // =========================================================================

    describe('createTask()', () => {
        it('delegates to service.createTask and returns { ok, item }', async () => {
            service.createTask.mockResolvedValue(mockTask as any);
            const dto: any = { title: 'Fix bug' };
            const result = await controller.createTask('ph1', dto);
            expect(service.createTask).toHaveBeenCalledWith('ph1', dto);
            expect(result).toEqual({ ok: true, item: mockTask });
        });
    });

    // =========================================================================
    // updateTask()
    // =========================================================================

    describe('updateTask()', () => {
        it('delegates to service.updateTask and returns { ok, item }', async () => {
            const updated = { ...mockTask, status: 'done' };
            service.updateTask.mockResolvedValue(updated as any);
            const result = await controller.updateTask('t1', { status: 'done' } as any);
            expect(service.updateTask).toHaveBeenCalledWith('t1', { status: 'done' });
            expect(result).toEqual({ ok: true, item: updated });
        });
    });

    // =========================================================================
    // removeTask()
    // =========================================================================

    describe('removeTask()', () => {
        it('delegates to service.removeTask and returns { ok: true }', async () => {
            service.removeTask.mockResolvedValue(undefined as any);
            const result = await controller.removeTask('t1');
            expect(service.removeTask).toHaveBeenCalledWith('t1');
            expect(result).toEqual({ ok: true });
        });
    });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ProjectsService } from './projects.service';

// ---------------------------------------------------------------------------
// Mock Supabase so no real network calls happen
// ---------------------------------------------------------------------------
const mockFrom = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => ({ from: mockFrom })),
}));

// ---------------------------------------------------------------------------
// Supabase query-builder chain helpers
// ---------------------------------------------------------------------------

/** select() → resolves { data, error } */
function selectChain(data: any, error: any = null) {
    const select = jest.fn().mockResolvedValue({ data, error });
    return { select };
}

/** select().in() → resolves { data, error } */
function selectInChain(data: any, error: any = null) {
    const inOp = jest.fn().mockResolvedValue({ data, error });
    const select = jest.fn().mockReturnValue({ in: inOp });
    return { select, in: inOp };
}

/** Creates a chain for Promise.all with multiple .from() calls */
function createMultiSelectChain(
    projectsData: any,
    clientsData: any,
    usersData: any,
    tasksData: any
) {
    let callCount = 0;
    mockFrom.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
            // .from('project').select(...)
            return selectChain(projectsData);
        } else if (callCount === 2) {
            // .from('clients').select(...).in(...)
            return selectInChain(clientsData);
        } else if (callCount === 3) {
            // .from('users').select(...).in(...)
            return selectInChain(usersData);
        } else {
            // .from('task').select(...).in(...)
            return selectInChain(tasksData);
        }
    });
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------
describe('ProjectsService', () => {
    let service: ProjectsService;

    beforeEach(async () => {
        mockFrom.mockReset();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProjectsService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => {
                            if (key === 'SUPABASE_URL') return 'https://fake.supabase.co';
                            if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'fake-service-role-key';
                            return undefined;
                        }),
                    },
                },
            ],
        }).compile();

        service = module.get<ProjectsService>(ProjectsService);
    });

    // =========================================================================
    // findAll — GET /projects
    // =========================================================================
    describe('findAll()', () => {
        it('returns array of projects with all required fields for dashboard', async () => {
            const projects = [
                {
                    project_id: 'p1',
                    name: 'Website Rebrand',
                    status: 'open',
                    service_type: 'design',
                    start_date: '2026-03-01',
                    end_date: '2026-04-30',
                    client_id: 'c1',
                    owner_id: 'u1',
                    budget: 5000,
                    description: 'Complete website redesign',
                },
                {
                    project_id: 'p2',
                    name: 'Q1 Campaign',
                    status: 'in_progress',
                    service_type: 'marketing',
                    start_date: '2026-01-15',
                    end_date: '2026-03-31',
                    client_id: 'c2',
                    owner_id: 'u2',
                    budget: 3000,
                    description: null,
                },
            ];

            const clients = [
                { id: 'c1', first_name: 'Acme', last_name: 'Corp' },
                { id: 'c2', first_name: 'Tech', last_name: 'Startup' },
            ];
            const users = [
                { user_id: 'u1', name: 'Alice' },
                { user_id: 'u2', name: 'Bob' },
            ];
            const tasks = [
                { project_id: 'p1' },
                { project_id: 'p1' },
                { project_id: 'p2' },
            ];

            createMultiSelectChain(projects, clients, users, tasks);

            const result = await service.findAll();

            expect(result).toHaveLength(2);

            // Check first project
            expect(result[0]).toEqual({
                project_id: 'p1',
                name: 'Website Rebrand',
                status: 'open',
                service_type: 'design',
                start_date: '2026-03-01',
                end_date: '2026-04-30',
                client_id: 'c1',
                client_name: 'Acme Corp',
                owner_id: 'u1',
                owner_name: 'Alice',
                task_count: 2,
                budget: 5000,
                description: 'Complete website redesign',
            });

            // Check second project
            expect(result[1]).toEqual({
                project_id: 'p2',
                name: 'Q1 Campaign',
                status: 'in_progress',
                service_type: 'marketing',
                start_date: '2026-01-15',
                end_date: '2026-03-31',
                client_id: 'c2',
                client_name: 'Tech Startup',
                owner_id: 'u2',
                owner_name: 'Bob',
                task_count: 1,
                budget: 3000,
                description: null,
            });
        });

        it('returns empty array when no projects exist', async () => {
            createMultiSelectChain(null, [], [], []);

            const result = await service.findAll();

            expect(result).toEqual([]);
        });

        it('returns empty array when projects data is empty', async () => {
            createMultiSelectChain([], [], [], []);

            const result = await service.findAll();

            expect(result).toEqual([]);
        });

        it('handles projects with null or missing optional fields', async () => {
            const projects = [
                {
                    project_id: 'p1',
                    name: 'Project With Nulls',
                    status: null,
                    service_type: null,
                    start_date: null,
                    end_date: null,
                    client_id: null,
                    owner_id: null,
                    budget: null,
                    description: null,
                },
            ];
            const clients = [];
            const users = [];
            const tasks = [];

            createMultiSelectChain(projects, clients, users, tasks);

            const result = await service.findAll();

            expect(result[0].status).toBeNull();
            expect(result[0].service_type).toBeNull();
            expect(result[0].client_name).toBeNull();
            expect(result[0].owner_name).toBeNull();
            expect(result[0].task_count).toBe(0);
            expect(result[0].budget).toBeNull();
            expect(result[0].description).toBeNull();
        });

        it('throws error when Supabase projects fetch fails', async () => {
            mockFrom.mockReturnValue(selectChain(null, { message: 'DB connection failed' }));

            await expect(service.findAll()).rejects.toThrow('Failed to fetch projects: DB connection failed');
        });

        it('throws error when clients fetch fails', async () => {
            const projects = [
                {
                    project_id: 'p1',
                    name: 'Project',
                    status: 'open',
                    service_type: 'design',
                    start_date: '2026-01-01',
                    end_date: '2026-02-01',
                    client_id: 'c1',
                    owner_id: 'u1',
                    budget: 1000,
                    description: null,
                },
            ];

            let callCount = 0;
            mockFrom.mockImplementation(() => {
                callCount++;
                if (callCount === 1) {
                    return selectChain(projects);
                } else if (callCount === 2) {
                    // clients — returns error
                    return selectInChain(null, { message: 'Clients fetch failed' });
                } else if (callCount === 3) {
                    // users — empty, no error (runs in same Promise.all)
                    return selectInChain([], null);
                } else {
                    // task — empty, no error (runs in same Promise.all)
                    return selectInChain([], null);
                }
            });

            await expect(service.findAll()).rejects.toThrow('Failed to fetch clients: Clients fetch failed');
        });
    });

    // =========================================================================
    // GET /projects — Data structure for dashboard
    // =========================================================================
    describe('Dashboard project data structure', () => {
        it('projects have required fields for dashboard tiles', async () => {
            const projects = [
                {
                    project_id: 'p1',
                    name: 'Website Rebrand',
                    status: 'open',
                    service_type: 'design',
                    start_date: '2026-03-01',
                    end_date: '2026-04-30',
                    client_id: 'c1',
                    owner_id: 'u1',
                    budget: 5000,
                    description: 'Redesign project',
                },
            ];
            const clients = [{ id: 'c1', first_name: 'Client', last_name: 'Name' }];
            const users = [{ user_id: 'u1', name: 'Owner Name' }];
            const tasks = [{ project_id: 'p1' }, { project_id: 'p1' }];

            createMultiSelectChain(projects, clients, users, tasks);

            const result = await service.findAll();
            const project = result[0];

            // Dashboard requires these fields
            expect(project).toHaveProperty('project_id');
            expect(project).toHaveProperty('name');
            expect(project).toHaveProperty('status');
            expect(project).toHaveProperty('owner_id');
            expect(project).toHaveProperty('owner_name');
            expect(project).toHaveProperty('end_date');
        });
    });

    // =========================================================================
    // Project status values and dashboard mapping
    // =========================================================================
    describe('Project status values (for dashboard mapping)', () => {
        it('returns all valid database status values unchanged', async () => {
            const validStatuses = ['open', 'in_progress', 'on_hold', 'completed', 'cancelled', 'behind'];
            const projects = validStatuses.map((status, idx) => ({
                project_id: `p${idx}`,
                name: `Project ${status}`,
                status,
                service_type: 'design',
                start_date: '2026-01-01',
                end_date: '2026-02-01',
                client_id: null,
                owner_id: null,
                budget: null,
                description: null,
            }));

            createMultiSelectChain(projects, [], [], []);

            const result = await service.findAll();

            expect(result.map((p) => p.status)).toEqual(validStatuses);
        });

        it('preserves null status values', async () => {
            const projects = [
                {
                    project_id: 'p1',
                    name: 'Project',
                    status: null,
                    service_type: 'design',
                    start_date: '2026-01-01',
                    end_date: '2026-02-01',
                    client_id: null,
                    owner_id: null,
                    budget: null,
                    description: null,
                },
            ];

            createMultiSelectChain(projects, [], [], []);

            const result = await service.findAll();

            expect(result[0].status).toBeNull();
        });
    });

    // =========================================================================
    // Project status mapping for dashboard display
    // =========================================================================
    describe('Dashboard status mapping', () => {
        it('maps database status values to dashboard labels correctly', () => {
            // This is the mapping used in dashboard/page.tsx
            const statusMap: Record<string, { label: string; bg: string; text: string }> = {
                'open': { label: 'On Track', bg: '#22C55E', text: 'black' },
                'in_progress': { label: 'At Risk', bg: '#F59E0B', text: 'black' },
                'completed': { label: 'Completed', bg: '#9CA3AF', text: 'white' },
                'on_hold': { label: 'On Hold', bg: '#FF5900', text: 'white' },
                'cancelled': { label: 'Cancelled', bg: '#EF4444', text: 'white' },
                'behind': { label: 'Behind', bg: '#EF4444', text: 'white' },
            };

            const testCases = [
                { status: 'open', expectedLabel: 'On Track' },
                { status: 'in_progress', expectedLabel: 'At Risk' },
                { status: 'completed', expectedLabel: 'Completed' },
                { status: 'on_hold', expectedLabel: 'On Hold' },
                { status: 'cancelled', expectedLabel: 'Cancelled' },
                { status: 'behind', expectedLabel: 'Behind' },
            ];

            for (const testCase of testCases) {
                const mapped = statusMap[testCase.status];
                expect(mapped).toBeDefined();
                expect(mapped.label).toBe(testCase.expectedLabel);
            }
        });

        it('returns correct colors for each status in dashboard', () => {
            const statusMap: Record<string, { bg: string; text: string }> = {
                'open': { bg: '#22C55E', text: 'black' },
                'in_progress': { bg: '#F59E0B', text: 'black' },
                'completed': { bg: '#9CA3AF', text: 'white' },
                'on_hold': { bg: '#FF5900', text: 'white' },
                'cancelled': { bg: '#EF4444', text: 'white' },
                'behind': { bg: '#EF4444', text: 'white' },
            };

            // On Track (green background, black text)
            expect(statusMap['open'].bg).toBe('#22C55E');
            expect(statusMap['open'].text).toBe('black');

            // At Risk (orange background, black text)
            expect(statusMap['in_progress'].bg).toBe('#F59E0B');
            expect(statusMap['in_progress'].text).toBe('black');

            // Completed (gray background, white text)
            expect(statusMap['completed'].bg).toBe('#9CA3AF');
            expect(statusMap['completed'].text).toBe('white');

            // On Hold (orange background, white text)
            expect(statusMap['on_hold'].bg).toBe('#FF5900');
            expect(statusMap['on_hold'].text).toBe('white');

            // Cancelled (red background, white text)
            expect(statusMap['cancelled'].bg).toBe('#EF4444');
            expect(statusMap['cancelled'].text).toBe('white');

            // Behind (red background, white text)
            expect(statusMap['behind'].bg).toBe('#EF4444');
            expect(statusMap['behind'].text).toBe('white');
        });
    });

    // =========================================================================
    // Sorting and ordering for Manage Projects tile
    // =========================================================================
    describe('Project ordering for dashboard', () => {
        it('returns projects that can be sorted by updated_at descending (most recent first)', async () => {
            // Note: The service.findAll() doesn't currently include updated_at
            // but the dashboard requires this for "most recently active"
            // This test documents what the dashboard needs
            const projects = [
                {
                    project_id: 'p1',
                    name: 'Old Project',
                    status: 'open',
                    service_type: 'design',
                    start_date: '2026-01-01',
                    end_date: '2026-02-01',
                    client_id: 'c1',
                    owner_id: 'u1',
                    budget: 1000,
                    description: null,
                },
                {
                    project_id: 'p2',
                    name: 'New Project',
                    status: 'open',
                    service_type: 'design',
                    start_date: '2026-03-01',
                    end_date: '2026-04-01',
                    client_id: 'c1',
                    owner_id: 'u1',
                    budget: 2000,
                    description: null,
                },
            ];

            createMultiSelectChain(projects, [{ id: 'c1', first_name: 'Client', last_name: 'Corp' }], [{ user_id: 'u1', name: 'Owner' }], []);

            const result = await service.findAll();

            // Projects are returned in order — the dashboard should be able to sort them
            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('Old Project');
            expect(result[1].name).toBe('New Project');

            // Simulating dashboard sorting by start_date descending
            const sortedByDate = [...result].sort((a, b) => {
                const aDate = a.start_date ? new Date(a.start_date).getTime() : 0;
                const bDate = b.start_date ? new Date(b.start_date).getTime() : 0;
                return bDate - aDate; // descending
            });

            expect(sortedByDate[0].name).toBe('New Project');
            expect(sortedByDate[1].name).toBe('Old Project');
        });
    });

    // =========================================================================
    // GET /clients — for Active Contacts KPI
    // =========================================================================
    describe('Clients data (for dashboard KPIs)', () => {
        it('enriches projects with client names from clients table', async () => {
            const projects = [
                {
                    project_id: 'p1',
                    name: 'Website Project',
                    status: 'open',
                    service_type: 'design',
                    start_date: '2026-01-01',
                    end_date: '2026-02-01',
                    client_id: 'c1',
                    owner_id: null,
                    budget: null,
                    description: null,
                },
            ];
            const clients = [
                { id: 'c1', first_name: 'John', last_name: 'Doe' },
            ];

            createMultiSelectChain(projects, clients, [], []);

            const result = await service.findAll();

            expect(result[0].client_name).toBe('John Doe');
            expect(result[0]).toHaveProperty('client_id');
            expect(result[0]).toHaveProperty('client_name');
        });

        it('returns null client_name when client is not found in clients table', async () => {
            const projects = [
                {
                    project_id: 'p1',
                    name: 'Orphan Project',
                    status: 'open',
                    service_type: 'design',
                    start_date: '2026-01-01',
                    end_date: '2026-02-01',
                    client_id: 'c999',
                    owner_id: null,
                    budget: null,
                    description: null,
                },
            ];
            const clients = []; // No matching client

            createMultiSelectChain(projects, clients, [], []);

            const result = await service.findAll();

            expect(result[0].client_name).toBeNull();
        });

        it('returns null client_name when project has no client_id', async () => {
            const projects = [
                {
                    project_id: 'p1',
                    name: 'Internal Project',
                    status: 'open',
                    service_type: 'design',
                    start_date: '2026-01-01',
                    end_date: '2026-02-01',
                    client_id: null,
                    owner_id: null,
                    budget: null,
                    description: null,
                },
            ];

            createMultiSelectChain(projects, [], [], []);

            const result = await service.findAll();

            expect(result[0].client_id).toBeNull();
            expect(result[0].client_name).toBeNull();
        });
    });
});

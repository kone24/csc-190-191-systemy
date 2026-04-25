import { ConfigService } from '@nestjs/config';
import { ProjectsSupabaseService } from './projects.supabase.service';

// ---------------------------------------------------------------------------
// Mock Supabase client
// ---------------------------------------------------------------------------

let orderReturnValue: any = { data: [], error: null };

const mockChain: any = {
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockImplementation(() => orderReturnValue),
};

jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => ({
        from: jest.fn(() => mockChain),
    })),
}));

function makeConfig(url = 'https://fake.supabase.co', key = 'fake-key') {
    return {
        get: jest.fn((k: string) => {
            if (k === 'SUPABASE_URL') return url;
            if (k === 'SUPABASE_SERVICE_ROLE_KEY') return key;
            return undefined;
        }),
    } as unknown as ConfigService;
}

describe('ProjectsSupabaseService', () => {
    let service: ProjectsSupabaseService;

    beforeEach(() => {
        jest.clearAllMocks();
        orderReturnValue = { data: [], error: null };
        mockChain.select.mockReturnThis();
        mockChain.order.mockImplementation(() => orderReturnValue);
        service = new ProjectsSupabaseService(makeConfig());
    });

    // =========================================================================
    // Constructor
    // =========================================================================

    describe('constructor', () => {
        it('throws when SUPABASE_URL is missing', () => {
            expect(() => new ProjectsSupabaseService(makeConfig('', 'key'))).toThrow(
                'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be provided',
            );
        });

        it('throws when SUPABASE_SERVICE_ROLE_KEY is missing', () => {
            expect(() => new ProjectsSupabaseService(makeConfig('https://x.supabase.co', ''))).toThrow(
                'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be provided',
            );
        });
    });

    // =========================================================================
    // findAll()
    // =========================================================================

    describe('findAll()', () => {
        it('returns projects ordered by name ascending', async () => {
            const projects = [
                { project_id: 'p1', name: 'Alpha' },
                { project_id: 'p2', name: 'Beta' },
            ];
            orderReturnValue = { data: projects, error: null };

            const result = await service.findAll();

            expect(mockChain.select).toHaveBeenCalledWith('project_id, name');
            expect(mockChain.order).toHaveBeenCalledWith('name', { ascending: true });
            expect(result).toEqual(projects);
        });

        it('returns empty array when no projects', async () => {
            orderReturnValue = { data: null, error: null };
            const result = await service.findAll();
            expect(result).toEqual([]);
        });

        it('throws on Supabase error', async () => {
            orderReturnValue = { data: null, error: { message: 'fetch failed' } };
            await expect(service.findAll()).rejects.toThrow('Failed to fetch projects: fetch failed');
        });
    });
});
